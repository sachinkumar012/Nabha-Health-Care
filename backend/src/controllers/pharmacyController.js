const asyncHandler = require("express-async-handler");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

// @desc    Get all pharmacies
// @route   GET /api/pharmacies
// @access  Public
const getPharmacies = asyncHandler(async (req, res) => {
  const { village, isOpen, search, page = 1, limit = 20 } = req.query;

  let query = {};

  // Village filter
  if (village) {
    query.village = { $regex: village, $options: "i" };
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { village: { $regex: search, $options: "i" } },
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { name: 1 },
    populate: [
      { path: "owner", select: "name email phone" },
      { path: "inventory.medicine", select: "name genericName price" },
    ],
  };

  const pharmacies = await Pharmacy.paginate(query, options);

  // Filter by open status if requested
  let filteredPharmacies = pharmacies.docs;
  if (isOpen === "true") {
    filteredPharmacies = pharmacies.docs.filter((pharmacy) =>
      pharmacy.isCurrentlyOpen()
    );
  }

  res.json({
    success: true,
    data: filteredPharmacies,
    pagination: {
      page: pharmacies.page,
      pages: pharmacies.totalPages,
      total: pharmacies.totalDocs,
      limit: pharmacies.limit,
    },
  });
});

// @desc    Get single pharmacy
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id)
    .populate("owner", "name email phone")
    .populate(
      "inventory.medicine",
      "name genericName category price dosageForm"
    );

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  res.json({
    success: true,
    data: {
      ...pharmacy.toObject(),
      isOpen: pharmacy.isCurrentlyOpen(),
    },
  });
});

// @desc    Create new pharmacy
// @route   POST /api/pharmacies
// @access  Private (Admin, Pharmacist)
const createPharmacy = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "pharmacist") {
    res.status(403);
    throw new Error("Not authorized to create pharmacies");
  }

  const {
    name,
    licenseNumber,
    address,
    village,
    phone,
    email,
    coordinates,
    workingHours,
    emergencyContact,
    services,
  } = req.body;

  // Check if pharmacy with same license already exists
  const existingPharmacy = await Pharmacy.findOne({ licenseNumber });
  if (existingPharmacy) {
    res.status(400);
    throw new Error("Pharmacy with this license number already exists");
  }

  const pharmacy = await Pharmacy.create({
    name,
    licenseNumber,
    address,
    village,
    phone,
    email,
    coordinates,
    workingHours: workingHours || {
      monday: { open: "09:00", close: "21:00" },
      tuesday: { open: "09:00", close: "21:00" },
      wednesday: { open: "09:00", close: "21:00" },
      thursday: { open: "09:00", close: "21:00" },
      friday: { open: "09:00", close: "21:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "10:00", close: "16:00" },
    },
    emergencyContact,
    services: services || ["prescription", "otc", "consultation"],
    owner: req.user.id,
    isVerified: req.user.role === "admin",
  });

  const populatedPharmacy = await Pharmacy.findById(pharmacy._id).populate(
    "owner",
    "name email phone"
  );

  res.status(201).json({
    success: true,
    data: populatedPharmacy,
  });
});

// @desc    Update pharmacy
// @route   PUT /api/pharmacies/:id
// @access  Private (Owner, Admin)
const updatePharmacy = asyncHandler(async (req, res) => {
  let pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this pharmacy");
  }

  pharmacy = await Pharmacy.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .populate("owner", "name email phone")
    .populate("inventory.medicine", "name genericName price");

  res.json({
    success: true,
    data: pharmacy,
  });
});

// @desc    Delete pharmacy
// @route   DELETE /api/pharmacies/:id
// @access  Private (Owner, Admin)
const deletePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this pharmacy");
  }

  await pharmacy.deleteOne();

  res.json({
    success: true,
    message: "Pharmacy deleted successfully",
  });
});

// @desc    Get pharmacy inventory
// @route   GET /api/pharmacies/:id/inventory
// @access  Public
const getPharmacyInventory = asyncHandler(async (req, res) => {
  const { search, category, inStock } = req.query;

  const pharmacy = await Pharmacy.findById(req.params.id).populate(
    "inventory.medicine"
  );

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  let inventory = pharmacy.inventory;

  // Apply filters
  if (search) {
    inventory = inventory.filter(
      (item) =>
        item.medicine.name.toLowerCase().includes(search.toLowerCase()) ||
        item.medicine.genericName.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    inventory = inventory.filter((item) => item.medicine.category === category);
  }

  if (inStock === "true") {
    inventory = inventory.filter((item) => item.quantity > 0);
  }

  res.json({
    success: true,
    pharmacy: {
      id: pharmacy._id,
      name: pharmacy.name,
      address: pharmacy.address,
      village: pharmacy.village,
    },
    data: inventory,
  });
});

// @desc    Add medicine to inventory
// @route   POST /api/pharmacies/:id/inventory
// @access  Private (Owner, Admin)
const addToInventory = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this pharmacy inventory");
  }

  const {
    medicine,
    quantity,
    costPrice,
    sellingPrice,
    expiryDate,
    batchNumber,
  } = req.body;

  // Verify medicine exists
  const medicineDoc = await Medicine.findById(medicine);
  if (!medicineDoc) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  // Check if medicine already exists in inventory
  const existingItemIndex = pharmacy.inventory.findIndex(
    (item) => item.medicine.toString() === medicine
  );

  if (existingItemIndex > -1) {
    // Update existing item
    pharmacy.inventory[existingItemIndex].quantity += quantity;
    pharmacy.inventory[existingItemIndex].costPrice = costPrice;
    pharmacy.inventory[existingItemIndex].sellingPrice = sellingPrice;
    pharmacy.inventory[existingItemIndex].expiryDate = expiryDate;
    pharmacy.inventory[existingItemIndex].batchNumber = batchNumber;
    pharmacy.inventory[existingItemIndex].updatedAt = new Date();
  } else {
    // Add new item
    pharmacy.inventory.push({
      medicine,
      quantity,
      costPrice,
      sellingPrice,
      expiryDate,
      batchNumber,
      updatedAt: new Date(),
    });
  }

  await pharmacy.save();

  const updatedPharmacy = await Pharmacy.findById(pharmacy._id).populate(
    "inventory.medicine",
    "name genericName category"
  );

  res.json({
    success: true,
    data: updatedPharmacy.inventory,
  });
});

// @desc    Update inventory item
// @route   PUT /api/pharmacies/:id/inventory/:itemId
// @access  Private (Owner, Admin)
const updateInventoryItem = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this pharmacy inventory");
  }

  const itemIndex = pharmacy.inventory.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Inventory item not found");
  }

  // Update the item
  Object.assign(pharmacy.inventory[itemIndex], req.body);
  pharmacy.inventory[itemIndex].updatedAt = new Date();

  await pharmacy.save();

  const updatedPharmacy = await Pharmacy.findById(pharmacy._id).populate(
    "inventory.medicine",
    "name genericName category"
  );

  res.json({
    success: true,
    data: updatedPharmacy.inventory[itemIndex],
  });
});

// @desc    Remove medicine from inventory
// @route   DELETE /api/pharmacies/:id/inventory/:itemId
// @access  Private (Owner, Admin)
const removeFromInventory = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this pharmacy inventory");
  }

  const itemIndex = pharmacy.inventory.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Inventory item not found");
  }

  pharmacy.inventory.splice(itemIndex, 1);
  await pharmacy.save();

  res.json({
    success: true,
    message: "Medicine removed from inventory",
  });
});

// @desc    Search nearby pharmacies
// @route   GET /api/pharmacies/nearby
// @access  Public
const getNearbyPharmacies = asyncHandler(async (req, res) => {
  const { village, radius = 10, medicine } = req.query;

  if (!village) {
    res.status(400);
    throw new Error("Village is required");
  }

  let query = {
    village: { $regex: village, $options: "i" },
  };

  // If looking for a specific medicine
  if (medicine) {
    const medicineDoc = await Medicine.findOne({
      $or: [
        { name: { $regex: medicine, $options: "i" } },
        { genericName: { $regex: medicine, $options: "i" } },
      ],
    });

    if (medicineDoc) {
      query["inventory.medicine"] = medicineDoc._id;
      query["inventory.quantity"] = { $gt: 0 };
    }
  }

  const pharmacies = await Pharmacy.find(query)
    .populate("owner", "name phone")
    .populate("inventory.medicine", "name genericName price");

  // Add distance calculation and current status
  const pharmaciesWithDetails = pharmacies.map((pharmacy) => ({
    ...pharmacy.toObject(),
    distance: Math.random() * parseInt(radius), // Mock distance
    isOpen: pharmacy.isCurrentlyOpen(),
    hasRequestedMedicine: medicine
      ? pharmacy.inventory.some(
          (item) =>
            item.medicine.name.toLowerCase().includes(medicine.toLowerCase()) ||
            item.medicine.genericName
              .toLowerCase()
              .includes(medicine.toLowerCase())
        )
      : true,
  }));

  // Sort by distance and open status
  pharmaciesWithDetails.sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return a.distance - b.distance;
  });

  res.json({
    success: true,
    searchArea: village,
    radius: parseInt(radius),
    medicineSearched: medicine,
    data: pharmaciesWithDetails,
  });
});

// @desc    Get pharmacy statistics
// @route   GET /api/pharmacies/:id/stats
// @access  Private (Owner, Admin)
const getPharmacyStats = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id).populate(
    "inventory.medicine",
    "category"
  );

  if (!pharmacy) {
    res.status(404);
    throw new Error("Pharmacy not found");
  }

  // Check permissions
  if (req.user.role !== "admin" && pharmacy.owner.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to view this pharmacy statistics");
  }

  const stats = {
    totalMedicines: pharmacy.inventory.length,
    totalStock: pharmacy.inventory.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    outOfStock: pharmacy.inventory.filter((item) => item.quantity === 0).length,
    lowStock: pharmacy.inventory.filter(
      (item) => item.quantity > 0 && item.quantity <= 10
    ).length,
    categories: {},
    totalValue: 0,
    expiringItems: 0,
  };

  // Calculate category breakdown and values
  pharmacy.inventory.forEach((item) => {
    const category = item.medicine.category || "Other";
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    stats.totalValue += item.sellingPrice * item.quantity;

    // Check for expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (item.expiryDate && new Date(item.expiryDate) <= thirtyDaysFromNow) {
      stats.expiringItems++;
    }
  });

  res.json({
    success: true,
    pharmacy: {
      id: pharmacy._id,
      name: pharmacy.name,
    },
    data: stats,
  });
});

module.exports = {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  getPharmacyInventory,
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
  getNearbyPharmacies,
  getPharmacyStats,
};

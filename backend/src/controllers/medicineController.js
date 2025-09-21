const asyncHandler = require("express-async-handler");
const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = asyncHandler(async (req, res) => {
  const { search, category, inStock, page = 1, limit = 20 } = req.query;

  let query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { genericName: { $regex: search, $options: "i" } },
      { manufacturer: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Stock filter
  if (inStock === "true") {
    query.stockQuantity = { $gt: 0 };
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { name: 1 },
  };

  const medicines = await Medicine.paginate(query, options);

  res.json({
    success: true,
    data: medicines.docs,
    pagination: {
      page: medicines.page,
      pages: medicines.totalPages,
      total: medicines.totalDocs,
      limit: medicines.limit,
    },
  });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  res.json({
    success: true,
    data: medicine,
  });
});

// @desc    Search medicines by name
// @route   GET /api/medicines/search/:name
// @access  Public
const searchMedicines = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { village, radius = 10 } = req.query;

  if (!name) {
    res.status(400);
    throw new Error("Medicine name is required");
  }

  // Search for medicines
  const medicines = await Medicine.find({
    $or: [
      { name: { $regex: name, $options: "i" } },
      { genericName: { $regex: name, $options: "i" } },
    ],
  });

  if (medicines.length === 0) {
    res.status(404);
    throw new Error("No medicines found with that name");
  }

  // If village is provided, find nearby pharmacies with the medicine
  let availabilityData = [];

  if (village) {
    for (const medicine of medicines) {
      // Find pharmacies that have this medicine in stock
      const pharmaciesWithMedicine = await Pharmacy.find({
        "inventory.medicine": medicine._id,
        "inventory.quantity": { $gt: 0 },
        village: { $regex: village, $options: "i" },
      }).populate("inventory.medicine");

      availabilityData.push({
        medicine,
        availability: pharmaciesWithMedicine.map((pharmacy) => ({
          pharmacy: {
            id: pharmacy._id,
            name: pharmacy.name,
            address: pharmacy.address,
            village: pharmacy.village,
            phone: pharmacy.phone,
            isOpen: pharmacy.isCurrentlyOpen(),
          },
          stock: pharmacy.inventory.find(
            (item) => item.medicine.toString() === medicine._id.toString()
          ),
          distance:
            pharmacy.coordinates && village
              ? calculateDistance(village, pharmacy.coordinates)
              : null,
        })),
      });
    }
  } else {
    availabilityData = medicines.map((medicine) => ({
      medicine,
      availability: [],
    }));
  }

  res.json({
    success: true,
    searchTerm: name,
    data: availabilityData,
  });
});

// @desc    Get medicine categories
// @route   GET /api/medicines/categories
// @access  Public
const getMedicineCategories = asyncHandler(async (req, res) => {
  const categories = await Medicine.distinct("category");

  res.json({
    success: true,
    data: categories.sort(),
  });
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Admin, Pharmacist)
const createMedicine = asyncHandler(async (req, res) => {
  // Only admins and pharmacists can add new medicines
  if (req.user.role !== "admin" && req.user.role !== "pharmacist") {
    res.status(403);
    throw new Error("Not authorized to create medicines");
  }

  const {
    name,
    genericName,
    category,
    manufacturer,
    description,
    dosageForm,
    strength,
    prescriptionRequired,
    price,
    stockQuantity,
    expiryDate,
    batchNumber,
    sideEffects,
    contraindications,
    activeIngredients,
  } = req.body;

  // Check if medicine already exists
  const existingMedicine = await Medicine.findOne({
    $or: [
      { name: { $regex: `^${name}$`, $options: "i" } },
      { genericName: { $regex: `^${genericName}$`, $options: "i" } },
    ],
  });

  if (existingMedicine) {
    res.status(400);
    throw new Error("Medicine with this name already exists");
  }

  const medicine = await Medicine.create({
    name,
    genericName,
    category,
    manufacturer,
    description,
    dosageForm,
    strength,
    prescriptionRequired: prescriptionRequired || false,
    price,
    stockQuantity: stockQuantity || 0,
    expiryDate,
    batchNumber,
    sideEffects: sideEffects || [],
    contraindications: contraindications || [],
    activeIngredients: activeIngredients || [],
    addedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: medicine,
  });
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin, Pharmacist)
const updateMedicine = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "pharmacist") {
    res.status(403);
    throw new Error("Not authorized to update medicines");
  }

  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: medicine,
  });
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin only)
const deleteMedicine = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete medicines");
  }

  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  await medicine.deleteOne();

  res.json({
    success: true,
    message: "Medicine deleted successfully",
  });
});

// @desc    Check medicine interactions
// @route   POST /api/medicines/check-interactions
// @access  Private
const checkMedicineInteractions = asyncHandler(async (req, res) => {
  const { medicineIds } = req.body;

  if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length < 2) {
    res.status(400);
    throw new Error(
      "At least 2 medicine IDs are required for interaction check"
    );
  }

  const medicines = await Medicine.find({
    _id: { $in: medicineIds },
  });

  if (medicines.length !== medicineIds.length) {
    res.status(404);
    throw new Error("One or more medicines not found");
  }

  // Simple interaction check based on active ingredients
  const interactions = [];
  const commonInteractions = {
    warfarin: ["aspirin", "ibuprofen", "heparin"],
    aspirin: ["warfarin", "heparin"],
    ibuprofen: ["warfarin", "aspirin"],
    metformin: ["insulin"],
    insulin: ["metformin"],
  };

  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const med1 = medicines[i];
      const med2 = medicines[j];

      // Check for ingredient interactions
      const med1Ingredients = med1.activeIngredients.map((ing) =>
        ing.toLowerCase()
      );
      const med2Ingredients = med2.activeIngredients.map((ing) =>
        ing.toLowerCase()
      );

      let hasInteraction = false;
      let interactionType = "minor";

      med1Ingredients.forEach((ingredient1) => {
        med2Ingredients.forEach((ingredient2) => {
          if (
            commonInteractions[ingredient1] &&
            commonInteractions[ingredient1].includes(ingredient2)
          ) {
            hasInteraction = true;
            interactionType = "major";
          }
        });
      });

      if (hasInteraction) {
        interactions.push({
          medicine1: med1.name,
          medicine2: med2.name,
          severity: interactionType,
          description: `Potential interaction between ${med1.name} and ${med2.name}`,
          recommendation:
            "Consult with healthcare provider before combining these medications",
        });
      }
    }
  }

  res.json({
    success: true,
    medicines: medicines.map((med) => ({
      id: med._id,
      name: med.name,
      activeIngredients: med.activeIngredients,
    })),
    interactions,
    hasInteractions: interactions.length > 0,
  });
});

// @desc    Get popular medicines
// @route   GET /api/medicines/popular
// @access  Public
const getPopularMedicines = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // For now, return medicines with highest stock or most common ones
  const popularMedicines = await Medicine.find({
    stockQuantity: { $gt: 0 },
  })
    .sort({ stockQuantity: -1, name: 1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: popularMedicines,
  });
});

// Helper function to calculate distance (simplified)
const calculateDistance = (village1, coordinates2) => {
  // This is a simplified calculation
  // In a real app, you would use proper geolocation APIs
  return Math.random() * 10; // Mock distance in km
};

// @desc    Update medicine stock
// @route   PUT /api/medicines/:id/stock
// @access  Private/Admin/Pharmacist
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation = "set" } = req.body;

  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  if (operation === "add") {
    medicine.stock += quantity;
  } else if (operation === "subtract") {
    medicine.stock = Math.max(0, medicine.stock - quantity);
  } else {
    medicine.stock = quantity;
  }

  const updatedMedicine = await medicine.save();

  res.json({
    success: true,
    data: updatedMedicine,
  });
});

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Private/Admin/Pharmacist
const getLowStockMedicines = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;

  const medicines = await Medicine.find({
    stock: { $lte: threshold },
    inStock: true,
  }).populate("pharmacy", "name location contact");

  res.json({
    success: true,
    count: medicines.length,
    data: medicines,
  });
});

// @desc    Get medicines by category
// @route   GET /api/medicines/category/:category
// @access  Public
const getMedicinesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const query = { category: new RegExp(category, "i") };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: "pharmacy",
    sort: { name: 1 },
  };

  const result = await Medicine.paginate(query, options);

  res.json({
    success: true,
    data: result.docs,
    pagination: {
      page: result.page,
      pages: result.totalPages,
      total: result.totalDocs,
      limit: result.limit,
    },
  });
});

module.exports = {
  getMedicines,
  getMedicine,
  searchMedicines,
  getMedicineCategories,
  getMedicinesByCategory,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  updateStock,
  getLowStockMedicines,
  checkMedicineInteractions,
  getPopularMedicines,
};

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "analgesic",
        "antibiotic",
        "antiviral",
        "antifungal",
        "anti-inflammatory",
        "antihistamine",
        "antacid",
        "antidiarrheal",
        "cough-cold",
        "vitamin",
        "supplement",
        "diabetes",
        "hypertension",
        "cardiac",
        "respiratory",
        "dermatology",
        "ophthalmology",
        "gynecology",
        "pediatric",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    activeIngredients: [
      {
        name: String,
        strength: String,
        unit: String,
      },
    ],
    dosageForm: {
      type: String,
      required: true,
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "drops",
        "inhaler",
        "powder",
      ],
    },
    strength: {
      value: Number,
      unit: String,
    },
    manufacturer: {
      name: String,
      country: String,
    },
    // Prescription information
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
    // Usage information
    indications: [String], // What it treats
    contraindications: [String], // When not to use
    sideEffects: [String],
    interactions: [String], // Drug interactions
    dosageGuidelines: {
      adult: {
        min: String,
        max: String,
        frequency: String,
      },
      child: {
        min: String,
        max: String,
        frequency: String,
      },
      elderly: {
        min: String,
        max: String,
        frequency: String,
      },
    },
    // Storage and handling
    storageConditions: {
      temperature: {
        min: Number,
        max: Number,
      },
      humidity: String,
      specialInstructions: String,
    },
    expiryMonths: {
      type: Number,
      default: 24,
    },
    // Pricing (varies by pharmacy)
    mrp: {
      type: Number,
      required: true,
    },
    // Availability tracking
    totalStock: {
      type: Number,
      default: 0,
    },
    pharmacyStock: [
      {
        pharmacy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pharmacy",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        batchNumber: String,
        expiryDate: Date,
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Multilingual support
    localNames: {
      hindi: String,
      punjabi: String,
    },
    // Search and categorization
    keywords: [String],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Regulatory information
    drugCode: String,
    approvalNumber: String,
    approvedBy: {
      type: String,
      default: "CDSCO", // Central Drugs Standard Control Organisation
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
medicineSchema.index({ name: "text", genericName: "text", keywords: "text" });
medicineSchema.index({ category: 1 });
medicineSchema.index({ isPrescriptionRequired: 1 });
medicineSchema.index({ isActive: 1 });
medicineSchema.index({ "pharmacyStock.pharmacy": 1 });

// Compound indexes
medicineSchema.index({ category: 1, isActive: 1 });
medicineSchema.index({ name: 1, isActive: 1 });

// Virtual for available stock across all pharmacies
medicineSchema.virtual("availableStock").get(function () {
  return this.pharmacyStock.reduce((total, stock) => {
    return total + (stock.quantity || 0);
  }, 0);
});

// Virtual for number of pharmacies having this medicine
medicineSchema.virtual("pharmacyCount").get(function () {
  return this.pharmacyStock.filter((stock) => stock.quantity > 0).length;
});

// Method to get stock at specific pharmacy
medicineSchema.methods.getStockAtPharmacy = function (pharmacyId) {
  return this.pharmacyStock.find(
    (stock) => stock.pharmacy.toString() === pharmacyId.toString()
  );
};

// Method to update stock at pharmacy
medicineSchema.methods.updatePharmacyStock = function (
  pharmacyId,
  quantity,
  price,
  options = {}
) {
  const stockIndex = this.pharmacyStock.findIndex(
    (stock) => stock.pharmacy.toString() === pharmacyId.toString()
  );

  const stockData = {
    quantity,
    price,
    lastUpdated: new Date(),
    ...options,
  };

  if (stockIndex >= 0) {
    // Update existing stock
    Object.assign(this.pharmacyStock[stockIndex], stockData);
  } else {
    // Add new pharmacy stock
    this.pharmacyStock.push({
      pharmacy: pharmacyId,
      ...stockData,
    });
  }

  return this.save();
};

// Static method to search medicines
medicineSchema.statics.searchMedicines = function (query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters,
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate("pharmacyStock.pharmacy", "name location contact")
    .sort({ score: { $meta: "textScore" } })
    .limit(50);
};

// Static method to get low stock medicines
medicineSchema.statics.getLowStockMedicines = function (threshold = 10) {
  return this.aggregate([
    {
      $addFields: {
        totalAvailable: {
          $sum: "$pharmacyStock.quantity",
        },
      },
    },
    {
      $match: {
        isActive: true,
        totalAvailable: { $lt: threshold },
      },
    },
    {
      $sort: { totalAvailable: 1 },
    },
  ]);
};

// Pre-save middleware to update total stock
medicineSchema.pre("save", function (next) {
  this.totalStock = this.pharmacyStock.reduce((total, stock) => {
    return total + (stock.quantity || 0);
  }, 0);
  next();
});

// Add pagination plugin
medicineSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Medicine", medicineSchema);

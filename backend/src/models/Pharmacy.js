const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pharmacy name is required"],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
    },
    owner: {
      name: {
        type: String,
        required: true,
      },
      qualification: String,
      experience: Number,
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: String,
      whatsapp: String,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      village: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        default: "Patiala",
      },
      state: {
        type: String,
        default: "Punjab",
      },
      pincode: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
      landmark: String,
    },
    operatingHours: {
      weekdays: {
        open: {
          type: String,
          default: "08:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
      },
      weekends: {
        open: {
          type: String,
          default: "08:00",
        },
        close: {
          type: String,
          default: "22:00",
        },
      },
      holidays: {
        isOpen: {
          type: Boolean,
          default: false,
        },
        hours: {
          open: String,
          close: String,
        },
      },
    },
    services: {
      homeDelivery: {
        available: {
          type: Boolean,
          default: false,
        },
        deliveryRadius: {
          type: Number,
          default: 5, // in kilometers
        },
        deliveryFee: {
          type: Number,
          default: 0,
        },
        freeDeliveryAbove: Number,
      },
      onlineOrdering: {
        type: Boolean,
        default: false,
      },
      prescriptionUpload: {
        type: Boolean,
        default: false,
      },
      emergencyService: {
        type: Boolean,
        default: false,
      },
      healthCheckup: {
        type: Boolean,
        default: false,
      },
    },
    // Staff information
    staff: [
      {
        name: String,
        role: {
          type: String,
          enum: ["pharmacist", "assistant", "delivery-person"],
        },
        qualification: String,
        shift: {
          type: String,
          enum: ["morning", "evening", "night", "full-day"],
        },
      },
    ],
    // Inventory management
    inventory: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        reorderLevel: {
          type: Number,
          default: 10,
        },
        maxStock: {
          type: Number,
          default: 100,
        },
      },
    ],
    // Rating and reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        reviewDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Digital presence
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      whatsappBusiness: String,
    },
    // Verification and compliance
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [
      {
        type: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Partnership with healthcare system
    isPartner: {
      type: Boolean,
      default: false,
    },
    partnershipDate: Date,
    // Financial information
    paymentMethods: [
      {
        type: String,
        enum: ["cash", "card", "upi", "net-banking", "wallet"],
      },
    ],
    // Analytics
    analytics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
      popularMedicines: [
        {
          medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
          },
          orderCount: Number,
        },
      ],
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastStockUpdate: {
      type: Date,
      default: Date.now,
    },
    // Multilingual support
    localName: {
      hindi: String,
      punjabi: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
pharmacySchema.index({ "location.village": 1 });
pharmacySchema.index({ "location.district": 1 });
pharmacySchema.index({ "location.pincode": 1 });
pharmacySchema.index({ isActive: 1 });
pharmacySchema.index({ isPartner: 1 });
pharmacySchema.index({ "rating.average": -1 });

// Geospatial index for location-based searches
pharmacySchema.index({ "location.coordinates": "2dsphere" });

// Text search index
pharmacySchema.index({
  name: "text",
  "location.village": "text",
  "location.address": "text",
});

// Virtual for current status (open/closed)
pharmacySchema.virtual("currentStatus").get(function () {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;

  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const hours = isWeekend
    ? this.operatingHours.weekends
    : this.operatingHours.weekdays;

  const [openHour, openMin] = hours.open.split(":").map(Number);
  const [closeHour, closeMin] = hours.close.split(":").map(Number);

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime
    ? "open"
    : "closed";
});

// Method to calculate distance from a given point
pharmacySchema.methods.calculateDistance = function (lat, lng) {
  if (!this.location.coordinates.lat || !this.location.coordinates.lng) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat - this.location.coordinates.lat) * Math.PI) / 180;
  const dLng = ((lng - this.location.coordinates.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.location.coordinates.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Static method to find nearby pharmacies
pharmacySchema.statics.findNearby = function (lat, lng, maxDistance = 10) {
  return this.find({
    isActive: true,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
  }).limit(20);
};

// Static method to search pharmacies by medicine availability
pharmacySchema.statics.findByMedicineAvailability = async function (
  medicineId,
  lat,
  lng
) {
  const Medicine = mongoose.model("Medicine");

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) return [];

  const pharmacyIds = medicine.pharmacyStock
    .filter((stock) => stock.quantity > 0)
    .map((stock) => stock.pharmacy);

  let query = {
    _id: { $in: pharmacyIds },
    isActive: true,
  };

  // If coordinates provided, sort by distance
  if (lat && lng) {
    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
    };
  }

  return this.find(query).limit(20);
};

// Method to update rating
pharmacySchema.methods.updateRating = function () {
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.rating.average = totalRating / this.reviews.length || 0;
  this.rating.totalReviews = this.reviews.length;
  return this.save();
};

// Pre-save middleware to ensure coordinates are properly set
pharmacySchema.pre("save", function (next) {
  if (
    this.location.coordinates &&
    this.location.coordinates.lat &&
    this.location.coordinates.lng
  ) {
    // Ensure the coordinates are in the correct format for MongoDB
    this.location.coordinates = {
      lat: this.location.coordinates.lat,
      lng: this.location.coordinates.lng,
    };
  }
  next();
});

// Add pagination plugin
pharmacySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Pharmacy", pharmacySchema);

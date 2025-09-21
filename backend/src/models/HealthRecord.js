const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordType: {
      type: String,
      enum: [
        "consultation",
        "prescription",
        "lab-report",
        "imaging",
        "vaccination",
        "surgery",
        "allergy",
        "chronic-condition",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    // Vital signs
    vitals: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
      },
      heartRate: Number,
      temperature: Number, // in Celsius
      weight: Number, // in kg
      height: Number, // in cm
      oxygenSaturation: Number,
      respiratoryRate: Number,
    },
    // Lab results
    labResults: [
      {
        testName: String,
        value: String,
        unit: String,
        normalRange: String,
        status: {
          type: String,
          enum: ["normal", "high", "low", "critical"],
        },
      },
    ],
    // Medications
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        prescribedDate: Date,
        instructions: String,
        status: {
          type: String,
          enum: ["active", "completed", "discontinued"],
          default: "active",
        },
      },
    ],
    // Allergies
    allergies: [
      {
        allergen: String,
        reaction: String,
        severity: {
          type: String,
          enum: ["mild", "moderate", "severe"],
        },
      },
    ],
    // Attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Follow-up information
    followUp: {
      required: Boolean,
      date: Date,
      instructions: String,
    },
    // Privacy and sharing
    isPrivate: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permissions: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Offline support
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    isLocalOnly: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
healthRecordSchema.index({ patient: 1 });
healthRecordSchema.index({ doctor: 1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ createdAt: -1 });
healthRecordSchema.index({ tags: 1 });
healthRecordSchema.index({ priority: 1 });

// Compound indexes
healthRecordSchema.index({ patient: 1, recordType: 1 });
healthRecordSchema.index({ patient: 1, createdAt: -1 });

// Text search index
healthRecordSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

// Virtual for record age
healthRecordSchema.virtual("recordAge").get(function () {
  const now = new Date();
  const recordDate = this.createdAt;
  const diffTime = Math.abs(now - recordDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} day(s) ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month(s) ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year(s) ago`;
  }
});

// Method to check if user can access this record
healthRecordSchema.methods.canAccess = function (userId) {
  // Patient can always access their own records
  if (this.patient.toString() === userId.toString()) {
    return true;
  }

  // Doctor who created the record can access
  if (this.doctor && this.doctor.toString() === userId.toString()) {
    return true;
  }

  // Check if shared with the user
  return this.sharedWith.some(
    (share) => share.user.toString() === userId.toString()
  );
};

// Static method to get patient summary
healthRecordSchema.statics.getPatientSummary = async function (patientId) {
  const pipeline = [
    { $match: { patient: mongoose.Types.ObjectId(patientId) } },
    {
      $group: {
        _id: "$recordType",
        count: { $sum: 1 },
        latestRecord: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        recordType: "$_id",
        count: 1,
        latestRecord: 1,
        _id: 0,
      },
    },
  ];

  return await this.aggregate(pipeline);
};

// Pre-save middleware to update sync timestamp
healthRecordSchema.pre("save", function (next) {
  if (this.isModified() && !this.isLocalOnly) {
    this.lastSyncedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("HealthRecord", healthRecordSchema);

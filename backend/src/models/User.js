const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "pharmacist"],
      default: "patient",
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      enum: ["en", "hi", "pa"], // English, Hindi, Punjabi
      default: "en",
    },
    location: {
      village: String,
      district: String,
      state: {
        type: String,
        default: "Punjab",
      },
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    // Doctor-specific fields
    specialization: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    licenseNumber: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    experience: {
      type: Number,
      required: function () {
        return this.role === "doctor";
      },
    },
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    consultationFee: {
      type: Number,
      required: function () {
        return this.role === "doctor";
      },
    },
    availability: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],
      timeSlots: [
        {
          start: String,
          end: String,
        },
      ],
    },
    // Patient-specific fields
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "patient";
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    // Pharmacist-specific fields
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: function () {
        return this.role === "pharmacist";
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "location.village": 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get age from date of birth
userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor(
    (Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);

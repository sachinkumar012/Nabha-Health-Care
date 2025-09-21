const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    type: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },
    symptoms: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    prescription: [
      {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    notes: {
      doctorNotes: String,
      patientNotes: String,
    },
    fee: {
      consultationFee: Number,
      platformFee: {
        type: Number,
        default: 0,
      },
      totalFee: Number,
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
      },
    },
    meetingDetails: {
      roomId: String,
      recordingUrl: String,
      duration: Number, // in minutes
    },
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      scheduledDate: Date,
      reason: String,
    },
    rating: {
      patientRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      doctorRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: {
        patientFeedback: String,
        doctorFeedback: String,
      },
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    rescheduleCount: {
      type: Number,
      default: 0,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ urgency: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound indexes
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, status: 1 });

// Virtual for appointment duration
appointmentSchema.virtual("duration").get(function () {
  if (!this.timeSlot.start || !this.timeSlot.end) return null;

  const start = new Date(`2000-01-01 ${this.timeSlot.start}`);
  const end = new Date(`2000-01-01 ${this.timeSlot.end}`);

  return (end - start) / (1000 * 60); // duration in minutes
});

// Pre-save middleware to calculate total fee
appointmentSchema.pre("save", function (next) {
  if (this.fee.consultationFee) {
    this.fee.totalFee = this.fee.consultationFee + (this.fee.platformFee || 0);
  }
  next();
});

// Static method to find available slots for a doctor
appointmentSchema.statics.findAvailableSlots = async function (doctorId, date) {
  const appointments = await this.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    },
    status: { $in: ["scheduled", "confirmed", "in-progress"] },
  });

  return appointments.map((apt) => ({
    start: apt.timeSlot.start,
    end: apt.timeSlot.end,
  }));
};

module.exports = mongoose.model("Appointment", appointmentSchema);

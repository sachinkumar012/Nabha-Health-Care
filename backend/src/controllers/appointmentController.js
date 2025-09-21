const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { sendNotification } = require("../utils/notification");

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, type, reason, symptoms, priority } = req.body;

  // Check if doctor exists and is available
  const doctorUser = await User.findById(doctor);
  if (!doctorUser || doctorUser.role !== "doctor") {
    res.status(404);
    throw new Error("Doctor not found");
  }

  // Check for conflicting appointments
  const conflictingAppointment = await Appointment.findOne({
    doctor,
    date: {
      $gte: new Date(date.getTime() - 30 * 60000), // 30 minutes before
      $lte: new Date(date.getTime() + 30 * 60000), // 30 minutes after
    },
    status: { $in: ["pending", "confirmed"] },
  });

  if (conflictingAppointment) {
    res.status(400);
    throw new Error("Doctor is not available at this time");
  }

  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor,
    date,
    type,
    reason,
    symptoms,
    priority: priority || "normal",
    status: "pending",
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone specialization");

  // Send notification to doctor
  await sendNotification(doctor, {
    title: "New Appointment Request",
    message: `New appointment request from ${req.user.name}`,
    type: "appointment",
    appointmentId: appointment._id,
  });

  // Send email notification
  await sendEmail({
    to: doctorUser.email,
    subject: "New Appointment Request - Nabha HealthCare",
    template: "appointmentRequest",
    data: {
      doctorName: doctorUser.name,
      patientName: req.user.name,
      appointmentDate: new Date(date).toLocaleDateString(),
      appointmentTime: new Date(date).toLocaleTimeString(),
      reason,
      symptoms,
    },
  });

  res.status(201).json({
    success: true,
    data: populatedAppointment,
  });
});

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;

  let query = {};

  // Role-based filtering
  if (req.user.role === "patient") {
    query.patient = req.user.id;
  } else if (req.user.role === "doctor") {
    query.doctor = req.user.id;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Upcoming appointments filter
  if (upcoming === "true") {
    query.date = { $gte: new Date() };
    query.status = { $in: ["pending", "confirmed"] };
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name email phone village")
    .populate("doctor", "name email phone specialization")
    .sort({ date: 1 });

  res.json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "name email phone village address")
    .populate("doctor", "name email phone specialization licenseNumber");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check if user has permission to view this appointment
  if (
    req.user.role === "patient" &&
    appointment.patient._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this appointment");
  }

  if (
    req.user.role === "doctor" &&
    appointment.doctor._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this appointment");
  }

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check permissions
  if (
    req.user.role === "patient" &&
    appointment.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  if (
    req.user.role === "doctor" &&
    appointment.doctor.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  const { status, date, notes, prescription } = req.body;

  // Handle status changes
  if (status && status !== appointment.status) {
    if (status === "confirmed" && req.user.role !== "doctor") {
      res.status(403);
      throw new Error("Only doctors can confirm appointments");
    }

    if (status === "completed" && req.user.role !== "doctor") {
      res.status(403);
      throw new Error("Only doctors can mark appointments as completed");
    }

    appointment.status = status;

    // Send notifications for status changes
    const notificationTarget =
      req.user.role === "doctor" ? appointment.patient : appointment.doctor;
    await sendNotification(notificationTarget, {
      title: "Appointment Status Updated",
      message: `Your appointment has been ${status}`,
      type: "appointment",
      appointmentId: appointment._id,
    });
  }

  // Handle rescheduling
  if (date && new Date(date) !== appointment.date) {
    appointment.date = date;
    appointment.status = "pending"; // Reset to pending when rescheduled
  }

  // Update other fields
  if (notes) appointment.notes = notes;
  if (prescription) appointment.prescription = prescription;

  appointment.updatedAt = Date.now();
  await appointment.save();

  const updatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "name email phone")
    .populate("doctor", "name email phone specialization");

  res.json({
    success: true,
    data: updatedAppointment,
  });
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check permissions
  if (
    appointment.patient.toString() !== req.user.id &&
    appointment.doctor.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to cancel this appointment");
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = req.user.id;
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = req.body.reason || "No reason provided";

  await appointment.save();

  // Send notification to the other party
  const notificationTarget =
    req.user.role === "doctor" ? appointment.patient : appointment.doctor;
  await sendNotification(notificationTarget, {
    title: "Appointment Cancelled",
    message: `Your appointment has been cancelled`,
    type: "appointment",
    appointmentId: appointment._id,
  });

  res.json({
    success: true,
    message: "Appointment cancelled successfully",
  });
});

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots/:doctorId
// @access  Private
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "doctor") {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const selectedDate = new Date(date);
  const startOfDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Get existing appointments for the day
  const existingAppointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  });

  // Generate available slots (9 AM to 6 PM, 30-minute intervals)
  const availableSlots = [];
  const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM

  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hour,
        minute
      );

      // Check if slot is not conflicting with existing appointments
      const isAvailable = !existingAppointments.some((appointment) => {
        const appointmentTime = new Date(appointment.date);
        const timeDiff = Math.abs(
          appointmentTime.getTime() - slotTime.getTime()
        );
        return timeDiff < 30 * 60 * 1000; // 30 minutes
      });

      if (isAvailable && slotTime > new Date()) {
        // Only future slots
        availableSlots.push({
          time: slotTime,
          formatted: slotTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }
  }

  res.json({
    success: true,
    date: selectedDate.toDateString(),
    availableSlots,
  });
});

// @desc    Get doctor's schedule
// @route   GET /api/appointments/schedule/:doctorId
// @access  Private
const getDoctorSchedule = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "doctor") {
    res.status(404);
    throw new Error("Doctor not found");
  }

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    ...dateFilter,
    status: { $in: ["pending", "confirmed", "completed"] },
  })
    .populate("patient", "name phone")
    .sort({ date: 1 });

  res.json({
    success: true,
    doctor: {
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
    },
    appointments,
  });
});

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Only doctor can complete appointments
  if (
    req.user.role !== "doctor" ||
    appointment.doctor.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Only the assigned doctor can complete appointments");
  }

  const { diagnosis, prescription, notes, followUpRequired, followUpDate } =
    req.body;

  appointment.status = "completed";
  appointment.completedAt = new Date();
  appointment.diagnosis = diagnosis;
  appointment.prescription = prescription;
  appointment.notes = notes;
  appointment.followUpRequired = followUpRequired || false;

  if (followUpRequired && followUpDate) {
    appointment.followUpDate = new Date(followUpDate);
  }

  await appointment.save();

  // Send notification to patient
  await sendNotification(appointment.patient, {
    title: "Appointment Completed",
    message:
      "Your appointment has been completed. Check your health records for details.",
    type: "appointment",
    appointmentId: appointment._id,
  });

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Rate appointment
// @route   PUT /api/appointments/:id/rate
// @access  Private (Patient only)
const rateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Only patient can rate appointments
  if (
    req.user.role !== "patient" ||
    appointment.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Only patients can rate appointments");
  }

  if (appointment.status !== "completed") {
    res.status(400);
    throw new Error("Can only rate completed appointments");
  }

  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  appointment.rating = rating;
  appointment.feedback = feedback;
  appointment.ratedAt = new Date();

  await appointment.save();

  res.json({
    success: true,
    message: "Appointment rated successfully",
    data: appointment,
  });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
  getDoctorSchedule,
  completeAppointment,
  rateAppointment,
};

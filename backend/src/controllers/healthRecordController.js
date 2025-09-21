const asyncHandler = require("express-async-handler");
const HealthRecord = require("../models/HealthRecord");
const User = require("../models/User");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

// @desc    Create new health record
// @route   POST /api/health-records
// @access  Private
const createHealthRecord = asyncHandler(async (req, res) => {
  const {
    patient,
    type,
    title,
    description,
    diagnosis,
    prescription,
    testResults,
    vitalSigns,
    allergies,
    medications,
    notes,
  } = req.body;

  // If user is a patient, they can only create records for themselves
  const patientId = req.user.role === "patient" ? req.user.id : patient;

  // Verify patient exists
  const patientUser = await User.findById(patientId);
  if (!patientUser || patientUser.role !== "patient") {
    res.status(404);
    throw new Error("Patient not found");
  }

  const healthRecord = await HealthRecord.create({
    patient: patientId,
    doctor: req.user.role === "doctor" ? req.user.id : undefined,
    type,
    title,
    description,
    diagnosis,
    prescription,
    testResults,
    vitalSigns,
    allergies,
    medications,
    notes,
    createdBy: req.user.id,
  });

  const populatedRecord = await HealthRecord.findById(healthRecord._id)
    .populate("patient", "name email phone dateOfBirth")
    .populate("doctor", "name specialization")
    .populate("createdBy", "name role");

  res.status(201).json({
    success: true,
    data: populatedRecord,
  });
});

// @desc    Get health records
// @route   GET /api/health-records
// @access  Private
const getHealthRecords = asyncHandler(async (req, res) => {
  const { patient, type, startDate, endDate } = req.query;

  let query = {};

  // Role-based filtering
  if (req.user.role === "patient") {
    query.patient = req.user.id;
  } else if (req.user.role === "doctor") {
    // Doctors can see records they created or for their patients
    if (patient) {
      query.patient = patient;
    } else {
      query.doctor = req.user.id;
    }
  } else if (patient) {
    query.patient = patient;
  }

  // Type filter
  if (type) {
    query.type = type;
  }

  // Date range filter
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const records = await HealthRecord.find(query)
    .populate("patient", "name email phone dateOfBirth")
    .populate("doctor", "name specialization")
    .populate("createdBy", "name role")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: records.length,
    data: records,
  });
});

// @desc    Get single health record
// @route   GET /api/health-records/:id
// @access  Private
const getHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id)
    .populate("patient", "name email phone dateOfBirth address village")
    .populate("doctor", "name specialization licenseNumber")
    .populate("createdBy", "name role");

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Check if user has permission to view this record
  if (
    req.user.role === "patient" &&
    record.patient._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this record");
  }

  if (
    req.user.role === "doctor" &&
    record.doctor &&
    record.doctor._id.toString() !== req.user.id &&
    record.createdBy._id.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to view this record");
  }

  res.json({
    success: true,
    data: record,
  });
});

// @desc    Update health record
// @route   PUT /api/health-records/:id
// @access  Private
const updateHealthRecord = asyncHandler(async (req, res) => {
  let record = await HealthRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Check permissions
  if (
    req.user.role === "patient" &&
    record.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to update this record");
  }

  if (
    req.user.role === "doctor" &&
    record.doctor &&
    record.doctor.toString() !== req.user.id &&
    record.createdBy.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to update this record");
  }

  record = await HealthRecord.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .populate("patient", "name email phone")
    .populate("doctor", "name specialization")
    .populate("createdBy", "name role");

  res.json({
    success: true,
    data: record,
  });
});

// @desc    Delete health record
// @route   DELETE /api/health-records/:id
// @access  Private
const deleteHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Check permissions
  if (
    req.user.role === "patient" &&
    record.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this record");
  }

  if (
    req.user.role === "doctor" &&
    record.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this record");
  }

  // Delete associated files from cloudinary
  if (record.attachments && record.attachments.length > 0) {
    for (let attachment of record.attachments) {
      if (attachment.cloudinaryId) {
        await deleteFromCloudinary(attachment.cloudinaryId);
      }
    }
  }

  await record.deleteOne();

  res.json({
    success: true,
    message: "Health record deleted successfully",
  });
});

// @desc    Upload attachment to health record
// @route   POST /api/health-records/:id/attachments
// @access  Private
const uploadAttachment = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Check permissions
  if (
    req.user.role === "patient" &&
    record.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to upload attachments to this record");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  try {
    // Upload to cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "health-records",
      resource_type: "auto",
    });

    const attachment = {
      filename: req.file.originalname,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    };

    record.attachments.push(attachment);
    await record.save();

    res.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    res.status(500);
    throw new Error("File upload failed");
  }
});

// @desc    Delete attachment from health record
// @route   DELETE /api/health-records/:id/attachments/:attachmentId
// @access  Private
const deleteAttachment = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Check permissions
  if (
    req.user.role === "patient" &&
    record.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Not authorized to delete attachments from this record");
  }

  const attachmentIndex = record.attachments.findIndex(
    (att) => att._id.toString() === req.params.attachmentId
  );

  if (attachmentIndex === -1) {
    res.status(404);
    throw new Error("Attachment not found");
  }

  const attachment = record.attachments[attachmentIndex];

  // Delete from cloudinary
  if (attachment.cloudinaryId) {
    await deleteFromCloudinary(attachment.cloudinaryId);
  }

  // Remove from record
  record.attachments.splice(attachmentIndex, 1);
  await record.save();

  res.json({
    success: true,
    message: "Attachment deleted successfully",
  });
});

// @desc    Share health record
// @route   POST /api/health-records/:id/share
// @access  Private
const shareHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Health record not found");
  }

  // Only patient can share their records
  if (
    req.user.role !== "patient" ||
    record.patient.toString() !== req.user.id
  ) {
    res.status(403);
    throw new Error("Only patients can share their health records");
  }

  const { sharedWith, permissions, expiresAt } = req.body;

  // Validate sharedWith user
  const sharedUser = await User.findById(sharedWith);
  if (!sharedUser) {
    res.status(404);
    throw new Error("User to share with not found");
  }

  // Check if already shared with this user
  const existingShare = record.sharedWith.find(
    (share) => share.user.toString() === sharedWith
  );

  if (existingShare) {
    // Update existing share
    existingShare.permissions = permissions || ["read"];
    existingShare.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    existingShare.sharedAt = new Date();
  } else {
    // Add new share
    record.sharedWith.push({
      user: sharedWith,
      permissions: permissions || ["read"],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      sharedAt: new Date(),
    });
  }

  await record.save();

  res.json({
    success: true,
    message: "Health record shared successfully",
  });
});

// @desc    Get patient summary
// @route   GET /api/health-records/patient/:patientId/summary
// @access  Private
const getPatientSummary = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check permissions
  if (req.user.role === "patient" && req.user.id !== patientId) {
    res.status(403);
    throw new Error("Not authorized to view this patient summary");
  }

  const patient = await User.findById(patientId);
  if (!patient || patient.role !== "patient") {
    res.status(404);
    throw new Error("Patient not found");
  }

  // Get all records for the patient
  const records = await HealthRecord.find({ patient: patientId })
    .populate("doctor", "name specialization")
    .sort({ createdAt: -1 });

  // Create summary
  const summary = {
    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      village: patient.village,
    },
    totalRecords: records.length,
    recordsByType: {},
    recentRecords: records.slice(0, 5),
    chronicConditions: [],
    currentMedications: [],
    allergies: [],
  };

  // Analyze records
  records.forEach((record) => {
    // Count by type
    summary.recordsByType[record.type] =
      (summary.recordsByType[record.type] || 0) + 1;

    // Collect chronic conditions
    if (record.diagnosis && record.type === "diagnosis") {
      summary.chronicConditions.push(record.diagnosis);
    }

    // Collect current medications
    if (record.medications && record.medications.length > 0) {
      summary.currentMedications.push(...record.medications);
    }

    // Collect allergies
    if (record.allergies && record.allergies.length > 0) {
      summary.allergies.push(...record.allergies);
    }
  });

  // Remove duplicates
  summary.chronicConditions = [...new Set(summary.chronicConditions)];
  summary.currentMedications = [...new Set(summary.currentMedications)];
  summary.allergies = [...new Set(summary.allergies)];

  res.json({
    success: true,
    data: summary,
  });
});

// @desc    Get shared health records for current user
// @route   GET /api/health-records/shared
// @access  Private
const getSharedRecords = asyncHandler(async (req, res) => {
  const records = await HealthRecord.find({
    "sharedWith.user": req.user._id,
    "sharedWith.permissions": { $ne: [] },
  })
    .populate("patient", "name email phone")
    .populate("doctor", "name specialization")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: records.length,
    data: records,
  });
});

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  uploadAttachment,
  deleteAttachment,
  shareHealthRecord,
  getSharedRecords,
  getPatientSummary,
};

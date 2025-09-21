const express = require("express");
const {
  createHealthRecord,
  getHealthRecords,
  getHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  shareHealthRecord,
  getSharedRecords,
  getPatientSummary,
} = require("../controllers/healthRecordController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.use(protect);

// Health record routes
router.post("/", createHealthRecord);
router.get("/", getHealthRecords);
router.get("/shared", getSharedRecords);
router.get(
  "/summary/:patientId",
  authorize("doctor", "admin"),
  getPatientSummary
);
router.get("/:id", getHealthRecord);
router.put("/:id", updateHealthRecord);
router.delete("/:id", deleteHealthRecord);
router.post("/:id/share", shareHealthRecord);

module.exports = router;

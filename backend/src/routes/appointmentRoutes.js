const express = require("express");
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
  getDoctorSchedule,
  completeAppointment,
  rateAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.use(protect);

// Appointment routes
router.post("/", authorize("patient"), createAppointment);
router.get("/", getAppointments);
router.get("/available-slots/:doctorId", getAvailableSlots);
router.get(
  "/doctor-schedule/:doctorId",
  authorize("doctor", "admin"),
  getDoctorSchedule
);
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/complete", authorize("doctor"), completeAppointment);
router.post("/:id/rate", rateAppointment);

module.exports = router;

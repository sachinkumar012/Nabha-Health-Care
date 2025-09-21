const express = require("express");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar,
  getDoctors,
  getPatients,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.use(protect);

// User profile routes
router.get("/profile", getUser);
router.put("/profile", updateProfile);
router.post("/avatar", uploadAvatar);

// Get doctors and patients (public for patients to see doctors)
router.get("/doctors", getDoctors);
router.get("/patients", authorize("doctor", "admin"), getPatients);

// Admin only routes
router.use(authorize("admin"));
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

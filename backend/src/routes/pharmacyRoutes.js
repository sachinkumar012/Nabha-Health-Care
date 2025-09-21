const express = require("express");
const {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  getNearbyPharmacies,
  getPharmacyInventory,
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
  getPharmacyStats,
} = require("../controllers/pharmacyController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getPharmacies);
router.get("/nearby", getNearbyPharmacies);
router.get("/:id", getPharmacy);
router.get("/:id/inventory", getPharmacyInventory);
router.get("/:id/stats", getPharmacyStats);

// Protected routes
router.use(protect);

// Pharmacist routes - inventory management
router.post("/:id/inventory", authorize("pharmacist", "admin"), addToInventory);
router.put(
  "/:id/inventory/:itemId",
  authorize("pharmacist", "admin"),
  updateInventoryItem
);
router.delete(
  "/:id/inventory/:itemId",
  authorize("pharmacist", "admin"),
  removeFromInventory
);

// Admin routes
router.post("/", authorize("admin"), createPharmacy);
router.put("/:id", authorize("pharmacist", "admin"), updatePharmacy);
router.delete("/:id", authorize("admin"), deletePharmacy);

module.exports = router;

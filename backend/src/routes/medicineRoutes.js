const express = require("express");
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  updateStock,
  getLowStockMedicines,
  getMedicinesByCategory,
} = require("../controllers/medicineController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/search", searchMedicines);
router.get("/category/:category", getMedicinesByCategory);
router.get("/", getMedicines);
router.get("/:id", getMedicine);

// Protected routes
router.use(protect);

// Pharmacist and admin routes
router.post("/", authorize("admin"), createMedicine);
router.put("/:id", authorize("pharmacist", "admin"), updateMedicine);
router.delete("/:id", authorize("admin"), deleteMedicine);
router.put("/:id/stock", authorize("pharmacist", "admin"), updateStock);
router.get(
  "/admin/low-stock",
  authorize("pharmacist", "admin"),
  getLowStockMedicines
);

module.exports = router;

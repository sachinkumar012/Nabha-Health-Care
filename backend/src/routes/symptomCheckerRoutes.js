const express = require("express");
const {
  checkSymptoms,
  getSymptomCategories,
  getCommonSymptoms,
  getHealthTips,
} = require("../controllers/symptomCheckerController");

const router = express.Router();

// Public routes (accessible without authentication for better user experience)
router.post("/check", checkSymptoms);
router.get("/categories", getSymptomCategories);
router.get("/common", getCommonSymptoms);
router.get("/health-tips", getHealthTips);

module.exports = router;

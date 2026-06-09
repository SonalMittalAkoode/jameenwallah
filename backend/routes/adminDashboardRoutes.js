const express = require("express");
const {
  getDashboardCounts,
  getPropertyTypeAnalytics,
  getCityLevelAnalytics,
} = require("../controllers/adminDashboard");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/counts", authMiddleware, isAdmin, getDashboardCounts);
router.get(
  "/property-type-analytics",
  authMiddleware,
  isAdmin,
  getPropertyTypeAnalytics
);
router.get(
  "/city-level-analytics",
  authMiddleware,
  isAdmin,
  getCityLevelAnalytics
);

module.exports = router;

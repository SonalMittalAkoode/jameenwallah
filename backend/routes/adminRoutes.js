const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  verifyEmailOtp,
  adminLogin,
  adminLogout,
  createBroker,
  getAllBrokers,
} = require("../controllers/adminCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", registerAdmin);
router.post("/verify-otp", verifyEmailOtp);
router.post("/login", adminLogin);
router.post("/logout", authMiddleware, adminLogout);
router.post("/create-broker", authMiddleware, isAdmin, createBroker);
router.get("/brokers", authMiddleware, isAdmin, getAllBrokers);
module.exports = router;

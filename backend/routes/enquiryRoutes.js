const express = require("express");
const { getEnquiries, getEnquiryAnalytics } = require("../controllers/enquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

console.log("Loading Enquiry Routes...");

router.get("/analytics", (req, res, next) => {
  console.log("Analytics route hit!");
  next();
}, authMiddleware, isAdmin, getEnquiryAnalytics);
router.get("/", authMiddleware, isAdmin, getEnquiries);

module.exports = router;

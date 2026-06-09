const express = require("express");
const {
  getTourRequestEnquiries,
} = require("../controllers/tourRequestEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getTourRequestEnquiries);

module.exports = router;

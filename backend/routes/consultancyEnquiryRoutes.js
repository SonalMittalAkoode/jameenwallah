const express = require("express");
const { getConsultancyEnquiries } = require("../controllers/consultancyEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getConsultancyEnquiries);

module.exports = router;

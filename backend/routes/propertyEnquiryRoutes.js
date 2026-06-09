const express = require("express");
const { getPropertyEnquiries } = require("../controllers/propertyEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getPropertyEnquiries);

module.exports = router;

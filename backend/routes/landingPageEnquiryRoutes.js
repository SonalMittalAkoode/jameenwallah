const express = require("express");
const {
  getLandingPageEnquiries,
} = require("../controllers/landingPageEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getLandingPageEnquiries);

module.exports = router;

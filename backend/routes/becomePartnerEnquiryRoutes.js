const express = require("express");
const {
  getBecomePartnerEnquiries,
} = require("../controllers/becomePartnerEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getBecomePartnerEnquiries);

module.exports = router;

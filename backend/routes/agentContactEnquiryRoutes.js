const express = require("express");
const {
  getAgentContactEnquiries,
} = require("../controllers/agentContactEnquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAgentContactEnquiries);

module.exports = router;

const express = require("express");
const {
  createAgentContactEnquiry,
} = require("../../controllers/frontend/agentContactEnquiryFrntCtrl");

const router = express.Router();

router.post("/", createAgentContactEnquiry);

module.exports = router;

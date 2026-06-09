const express = require("express");
const { createBecomeaPartnerEnquiry } = require("../../controllers/frontend/BecomeaPartnerEnquiryFrntCtrl");

const router = express.Router();

router.post("/", createBecomeaPartnerEnquiry);

module.exports = router;

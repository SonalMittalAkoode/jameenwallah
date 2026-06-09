const express = require("express");
const { createconsultancyEnquiry } = require("../../controllers/frontend/consultancyEnquiryFrntCtrl.js");

const router = express.Router();

router.post("/", createconsultancyEnquiry);

module.exports = router;

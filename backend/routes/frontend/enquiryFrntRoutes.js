const express = require("express");
const { createEnquiry } = require("../../controllers/frontend/enquiryFrntCtrl");

const router = express.Router();

router.post("/", createEnquiry);

module.exports = router;

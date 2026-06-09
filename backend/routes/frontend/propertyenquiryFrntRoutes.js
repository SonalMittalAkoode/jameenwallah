const express = require("express");
const { createpropertyEnquiry } = require("../../controllers/frontend/propertyEnquiryFrntCtrl.js");

const router = express.Router();

router.post("/", createpropertyEnquiry);

module.exports = router;

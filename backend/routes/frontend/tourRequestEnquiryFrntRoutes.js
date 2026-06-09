const express = require("express");
const {
  createTourRequestEnquiry,
} = require("../../controllers/frontend/tourRequestEnquiryCtrl");

const router = express.Router();

router.post("/", createTourRequestEnquiry);

module.exports = router;

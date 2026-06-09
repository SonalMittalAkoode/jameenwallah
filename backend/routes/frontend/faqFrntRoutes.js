const express = require("express");
const { getLimitedFAQs, getFAQsByProperty } = require("../../controllers/frontend/faqFrntCtrl");

const router = express.Router();

router.get("/faqs", getLimitedFAQs);
router.get("/faqs/property/:propertyId", getFAQsByProperty);

module.exports = router;

const express = require("express");
const {
  getAllTestimonials,
} = require("../../controllers/frontend/testimonialFrntCtrl");

const router = express.Router();

router.get("/testimonials", getAllTestimonials);

module.exports = router;

const express = require("express");
const {
  getAllAmenities,
  getAmenityById,
} = require("../../controllers/frontend/amenityFrntCtrl");

const router = express.Router();

router.get("/amenities", getAllAmenities);
router.get("/amenities/:id", getAmenityById);

module.exports = router;


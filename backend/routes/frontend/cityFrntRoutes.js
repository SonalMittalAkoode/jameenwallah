const express = require("express");
const {
  getAllCities,
  getCitiesByStateId,
  getCityById,
  getCityByName,
  getCitiesWithPropertyCounts,
  getCityWithPropertypage
} = require("../../controllers/frontend/cityFrntCtrl");

const router = express.Router();

// More specific routes first to avoid conflicts
router.get("/cities-with-properties", getCitiesWithPropertyCounts);
router.get("/cities/state/:stateId", getCitiesByStateId);
router.get("/cities/name/:name", getCityByName);
router.get("/cities/:id", getCityById);
router.get("/cities", getAllCities);
router.get("/city/citywithpropertypage", getCityWithPropertypage);


module.exports = router;


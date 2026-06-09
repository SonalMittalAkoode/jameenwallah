const express = require("express");
const {
  getAllAreas,
  getAreasByCityId,
  getAreaById,
  getAreaBySlug,
  getTrendingAreasByCityName,
  getTrendingAreasList,
} = require("../../controllers/frontend/areaFrntCtrl");

const router = express.Router();

router.get("/areas", getAllAreas);
router.get("/areas/trending/:cityName", getTrendingAreasByCityName);
router.get("/areas/trendinglist", getTrendingAreasList);
router.get("/areas/city/:cityId", getAreasByCityId);
router.get("/areas/slug/:slug", getAreaBySlug);
router.get("/areas/:id", getAreaById);

module.exports = router;


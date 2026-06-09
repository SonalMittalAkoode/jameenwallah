const express = require("express");
const {
  getPropertiesByCategory,
  getPropertiesByBuilder,
  getPropertiesWithFilters,
  getPropertyById,
  getFeaturedProperties,
  getAllProperties,
  propertyListTrends
} = require("../../controllers/frontend/propertyFrntCtrl");
const { createProperty } = require("../../controllers/propertyCtrl");
const upload = require("../../middlewares/uploadImage");

const router = express.Router();

router.get("/properties", getPropertiesWithFilters);
router.get("/properties/featured", getFeaturedProperties);
router.get("/properties/all", getAllProperties);
router.get("/properties/category/:categoryName", getPropertiesByCategory);
router.get("/properties/builder/:builderId", getPropertiesByBuilder);
router.get("/properties/propertylisttrends", propertyListTrends);
router.get("/properties/:id", getPropertyById);


router.post(
  "/property",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlanImages", maxCount: 10 },
    { name: "virtualTour", maxCount: 1 },
    { name: "sitePlanImage", maxCount: 1 },
    { name: "masterPlanImage", maxCount: 1 },
  ]),
  createProperty
);

module.exports = router;

const express = require("express");
const {
  getPropertyTypesByCategory,
  getAllPropertyTypes,
} = require("../../controllers/frontend/propertyTypeFrntCtrl");

const router = express.Router();

router.get("/property-types", getAllPropertyTypes);
router.get(
  "/property-types/category/:categoryIdOrName",
  getPropertyTypesByCategory
);

module.exports = router;

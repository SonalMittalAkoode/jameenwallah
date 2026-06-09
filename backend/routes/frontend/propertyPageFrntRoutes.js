const express = require("express");
const {
  getPropertyPages,
  getPropertyPageBySlug,
} = require("../../controllers/frontend/propertyPageFrntCtrl");

const router = express.Router();

router.get("/property-page", getPropertyPages);
router.get("/property-page/:slug", getPropertyPageBySlug);

module.exports = router;

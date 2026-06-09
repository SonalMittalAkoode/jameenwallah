const express = require("express");
const {
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
} = require("../../controllers/frontend/categoryFrntCtrl");

const router = express.Router();

router.get("/categories", getActiveCategories);
router.get("/categories/slug/:slug", getCategoryBySlug);
router.get("/categories/:id", getCategoryById);

module.exports = router;

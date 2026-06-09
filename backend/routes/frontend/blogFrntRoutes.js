const express = require("express");
const {
  getLimitedBlogs,
  getAllBlogs,
  getLatestBlogs,
  getPopularTags,
  getBlogCategories,
  getBlogById,
  getRelatedBlogs,
} = require("../../controllers/frontend/blogFrntCtrl");

const router = express.Router();

router.get("/blogs", getLimitedBlogs);
router.get("/blogs/all", getAllBlogs);
router.get("/blogs/latest", getLatestBlogs);
router.get("/blogs/tags/popular", getPopularTags);
router.get("/blogs/categories", getBlogCategories);
router.get("/blogs/:id/related", getRelatedBlogs);
router.get("/blogs/:id", getBlogById);

module.exports = router;

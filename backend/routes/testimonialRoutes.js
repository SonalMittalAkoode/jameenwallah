const express = require("express");
const {
  createTestimonial,
  getAllTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, isAdmin, createTestimonial);
router.get("/", authMiddleware, isAdmin, getAllTestimonials);
router.get("/:id", authMiddleware, isAdmin, getTestimonial);
router.put("/:id", authMiddleware, isAdmin, updateTestimonial);
router.delete("/:id", authMiddleware, isAdmin, deleteTestimonial);

module.exports = router;

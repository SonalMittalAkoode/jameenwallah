const express = require("express");
const {
  createFaq,
  getAllFaqs,
  getFaqsByProperty,
  getFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, isAdmin, createFaq);
router.get("/", authMiddleware, isAdmin, getAllFaqs);
router.get("/property/:propertyId", authMiddleware, isAdmin, getFaqsByProperty);
router.get("/:id", authMiddleware, isAdmin, getFaq);
router.put("/:id", authMiddleware, isAdmin, updateFaq);
router.delete("/:id", authMiddleware, isAdmin, deleteFaq);

module.exports = router;

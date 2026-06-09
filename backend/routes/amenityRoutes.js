const express = require("express");
const router = express.Router();
const {
  createAmenity,
  getAllAmenity,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
} = require("../controllers/amenityCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createAmenity);
router.get("/", authMiddleware, isAdmin, getAllAmenity);
router.get("/:id", authMiddleware, isAdmin, getAmenityById);
router.put("/:id", authMiddleware, isAdmin, updateAmenity);
router.delete("/:id", authMiddleware, isAdmin, deleteAmenity);

module.exports = router;

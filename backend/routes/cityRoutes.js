const express = require("express");
const {
  createCity,
  getAllCities,
  getCitiesByStateId,
  getCityById,
  updateCity,
  deleteCity,
} = require("../controllers/cityCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createCity);
router.get("/", authMiddleware, isAdmin, getAllCities);
router.get("/state/:stateId", authMiddleware, isAdmin, getCitiesByStateId);
router.get("/:id", authMiddleware, isAdmin, getCityById);
router.put("/:id", authMiddleware, isAdmin, upload.single("image"), updateCity);
router.delete("/:id", authMiddleware, isAdmin, deleteCity);

module.exports = router;

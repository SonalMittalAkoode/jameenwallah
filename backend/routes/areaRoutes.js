const express = require("express");
const {
  createArea,
  getAllAreas,
  getAreaById,
  getAreasByCityId,
  updateArea,
  deleteArea,
} = require("../controllers/areaCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createArea);
router.get("/", authMiddleware, isAdmin, getAllAreas);
router.get("/city/:cityId", authMiddleware, isAdmin, getAreasByCityId);
router.get("/:id", authMiddleware, isAdmin, getAreaById);
router.put("/:id", authMiddleware, isAdmin, upload.single("image"), updateArea);
router.delete("/:id", authMiddleware, isAdmin, deleteArea);

module.exports = router;

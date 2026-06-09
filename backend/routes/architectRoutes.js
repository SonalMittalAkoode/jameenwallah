const express = require("express");
const {
  createArchitect,
  getAllArchitects,
  getArchitectById,
  updateArchitect,
  deleteArchitect,
} = require("../controllers/architectCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]), createArchitect);
router.get("/", authMiddleware, isAdmin, getAllArchitects);
router.get("/:id", authMiddleware, isAdmin, getArchitectById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]),
  updateArchitect
);
router.delete("/:id", authMiddleware, isAdmin, deleteArchitect);

module.exports = router;

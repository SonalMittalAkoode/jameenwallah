const express = require("express");
const {
  createBuilder,
  getAllBuilders,
  getBuilder,
  updateBuilder,
  deleteBuilder,
} = require("../controllers/builderCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  createBuilder
);
router.get("/", authMiddleware, isAdmin, getAllBuilders);
router.get("/:id", authMiddleware, isAdmin, getBuilder);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  updateBuilder
);
router.delete("/:id", authMiddleware, isAdmin, deleteBuilder);

module.exports = router;

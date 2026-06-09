const express = require("express");
const {
  createCharteredaccountant,
  getAllCharteredaccountants,
  getCharteredaccountantById,
  updateCharteredaccountant,
  deleteCharteredaccountant,
} = require("../controllers/charteredaccountantCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]), createCharteredaccountant);
router.get("/", authMiddleware, isAdmin, getAllCharteredaccountants);
router.get("/:id", authMiddleware, isAdmin, getCharteredaccountantById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]),
  updateCharteredaccountant
);
router.delete("/:id", authMiddleware, isAdmin, deleteCharteredaccountant);

module.exports = router;

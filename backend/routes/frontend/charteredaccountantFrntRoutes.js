const express = require("express");
const {
//   createCharteredaccountant,
  getAllCharteredaccountants,
  getCharteredaccountantById
} = require("../../controllers/frontend/charteredaccountantFrntCtrl.js");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadImage");

const router = express.Router();

// router.post("/", authMiddleware, isAdmin, upload.single("image"), createCharteredaccountant);
router.get("/", getAllCharteredaccountants);
router.get("/:id", getCharteredaccountantById);

module.exports = router;

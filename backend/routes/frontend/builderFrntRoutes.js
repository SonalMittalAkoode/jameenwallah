const express = require("express");
const {
  getAllBuilders,
  getBuilderById,
} = require("../../controllers/frontend/builderFrntCtrl");

const router = express.Router();

router.get("/builders", getAllBuilders);
router.get("/builders/:id", getBuilderById);

module.exports = router;

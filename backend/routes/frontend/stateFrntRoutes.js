const express = require("express");
const {
  getAllStates,
  getStateById,
} = require("../../controllers/frontend/stateFrntCtrl");

const router = express.Router();

router.get("/states", getAllStates);
router.get("/states/:id", getStateById);

module.exports = router;


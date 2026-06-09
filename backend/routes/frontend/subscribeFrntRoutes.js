const express = require("express");
const {
  createSubscribe,
} = require("../../controllers/frontend/subscribeFrntCtrl");

const router = express.Router();

router.post("/subscribe", createSubscribe);

module.exports = router;

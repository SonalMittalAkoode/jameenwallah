const express = require("express");
const {
  createBankerConnect,
} = require("../../controllers/frontend/bankerConnectFrntCtrl");

const router = express.Router();

router.post("/", createBankerConnect);

module.exports = router;

const express = require("express");
const { createCallRequest } = require("../../controllers/frontend/callRequestFrntCtrl");

const router = express.Router();

router.post("/", createCallRequest);

module.exports = router;

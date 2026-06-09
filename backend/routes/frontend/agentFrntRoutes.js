const express = require("express");
const { getAgentById,getAllAgents } = require("../../controllers/frontend/agentFrntCtrl");

const router = express.Router();

router.get("/:id", getAgentById);
router.get("/", getAllAgents);

module.exports = router;

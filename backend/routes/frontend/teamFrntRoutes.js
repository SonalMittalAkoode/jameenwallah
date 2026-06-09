const express = require("express");
const {
  getAllTeams,
  getTeamById,
} = require("../../controllers/frontend/teamFrntCtrl");

const router = express.Router();

router.get("/teams", getAllTeams);
router.get("/teams/:id", getTeamById);

module.exports = router;

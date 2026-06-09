const Team = require("../../models/team");
const asyncHandler = require("express-async-handler");

// get all teams
const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Teams fetched successfully",
    data: teams,
    timestamp: new Date().toISOString(),
  });
});

// get single team by ID or slug
const getTeamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Team ID or slug is required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  let team = null;

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    team = await Team.findById(id);
  }

  if (!team) {
    team = await Team.findOne({ slug: id });
  }

  if (!team) {
    return res.status(404).json({
      status: "error",
      message: `Team not found with ID or slug: ${id}`,
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Team fetched successfully",
    data: team,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getAllTeams,
  getTeamById,
};

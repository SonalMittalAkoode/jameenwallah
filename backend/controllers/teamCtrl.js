const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Team = require("../models/team.js");

// create team
const createTeam = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and phone number are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const teamSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingTeam = await Team.findOne({ slug: teamSlug });
  if (existingTeam) {
    return res.status(400).json({
      status: "error",
      message: "Team with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const team = await Team.create({
    name,
    email,
    phoneNumber,
    slug: teamSlug,
    description,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Team created successfully",
    data: team,
    timestamp: new Date().toISOString(),
  });
});

//get all teams
const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Teams fetched successfully",
    data: teams,
    timestamp: new Date().toISOString(),
  });
});

// get team by id or slug
const getTeamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let team = null;

  team = await Team.findOne({ slug: id });

  if (!team && mongoose.Types.ObjectId.isValid(id)) {
    team = await Team.findById(id);
  }

  if (!team) {
    return res.status(404).json({
      status: "error",
      message: "Team not found",
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

//update team
const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  const existingTeam = await Team.findById(id);
  if (!existingTeam) {
    return res.status(404).json({
      status: "error",
      message: "Team not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  if (phoneNumber !== undefined) {
    updateData.phoneNumber = phoneNumber;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (metaTitle !== undefined) {
    updateData.metaTitle = metaTitle;
  }

  if (metaDescription !== undefined) {
    updateData.metaDescription = metaDescription;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (slug !== undefined) {
    const teamSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingTeam.slug);

    const slugExists = await Team.findOne({
      slug: teamSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Team with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = teamSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedTeam = await Team.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTeam) {
    return res.status(404).json({
      status: "error",
      message: "Team not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Team updated successfully",
    data: updatedTeam,
    timestamp: new Date().toISOString(),
  });
});

// delete team
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      status: "error",
      message: "Team not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await team.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Team deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};

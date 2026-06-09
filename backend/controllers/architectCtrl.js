const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Architect = require("../models/architect.js");

// create architect
const createArchitect = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    registrationNumber,
    about,
    experience,
    specialty,
    areaOfExpertise,
    courtsAndTribunals,
    location,
    status,
    slug,
    metaTitle,
    metaDescription,
    rating,
  } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and phone number are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const architectSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingArchitect = await Architect.findOne({ slug: architectSlug });
  if (existingArchitect) {
    return res.status(400).json({
      status: "error",
      message: "Architect with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const architect = await Architect.create({
    name,
    email,
    phoneNumber,
    slug: architectSlug,
    description,
    tag,
    shortDescription,
    registrationNumber,
    about,
    experience,
    specialty,
    areaOfExpertise,
    courtsAndTribunals,
    location,
    metaTitle,
    metaDescription,
    status: status || "active",
    rating,
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Architect created successfully",
    data: architect,
    timestamp: new Date().toISOString(),
  });
});

//get all architects
const getAllArchitects = asyncHandler(async (req, res) => {
  const architects = await Architect.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Architects fetched successfully",
    data: architects,
    timestamp: new Date().toISOString(),
  });
});

// get architect by id or slug
const getArchitectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let architect = null;

  architect = await Architect.findOne({ slug: id });

  if (!architect && mongoose.Types.ObjectId.isValid(id)) {
    architect = await Architect.findById(id);
  }

  if (!architect) {
    return res.status(404).json({
      status: "error",
      message: "Architect not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Architect fetched successfully",
    data: architect,
    timestamp: new Date().toISOString(),
  });
});

//update architect
const updateArchitect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    registrationNumber,
    about,
    experience,
    specialty,
    areaOfExpertise,
    courtsAndTribunals,
    location,
    status,
    slug,
    metaTitle,
    metaDescription,
    rating,
  } = req.body;

  const existingArchitect = await Architect.findById(id);
  if (!existingArchitect) {
    return res.status(404).json({
      status: "error",
      message: "Architect not found",
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

  if (tag !== undefined) {
    updateData.tag = tag;
  }

  if (shortDescription !== undefined) {
    updateData.shortDescription = shortDescription;
  }

  if (registrationNumber !== undefined) {
    updateData.registrationNumber = registrationNumber;
  }

  if (about !== undefined) {
    updateData.about = about;
  }

  if (experience !== undefined) {
    updateData.experience = experience;
  }

  if (specialty !== undefined) {
    updateData.specialty = specialty;
  }

  if (areaOfExpertise !== undefined) {
    updateData.areaOfExpertise = areaOfExpertise;
  }

  if (courtsAndTribunals !== undefined) {
    updateData.courtsAndTribunals = courtsAndTribunals;
  }

  if (location !== undefined) {
    updateData.location = location;
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

  if (rating !== undefined) {
    updateData.rating = rating;
  }

  if (slug !== undefined) {
    const architectSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingArchitect.slug);

    const slugExists = await Architect.findOne({
      slug: architectSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Architect with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = architectSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  if (req.files && req.files.featuredImage && req.files.featuredImage[0]) {
    updateData.featuredImage = `/images/${req.files.featuredImage[0].filename}`;
  }

  const updatedArchitect = await Architect.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedArchitect) {
    return res.status(404).json({
      status: "error",
      message: "Architect not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Architect updated successfully",
    data: updatedArchitect,
    timestamp: new Date().toISOString(),
  });
});

// delete architect
const deleteArchitect = asyncHandler(async (req, res) => {
  const architect = await Architect.findById(req.params.id);

  if (!architect) {
    return res.status(404).json({
      status: "error",
      message: "Architect not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await architect.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Architect deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createArchitect,
  getAllArchitects,
  getArchitectById,
  updateArchitect,
  deleteArchitect,
};

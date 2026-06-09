const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Charteredaccountant = require("../models/charteredaccountant.js");

// create charteredaccountant
const createCharteredaccountant = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
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

  const charteredaccountantSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingCharteredaccountant = await Charteredaccountant.findOne({ slug: charteredaccountantSlug });
  if (existingCharteredaccountant) {
    return res.status(400).json({
      status: "error",
      message: "Charteredaccountant with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;
  const featuredImage = req.files && req.files.featuredImage && req.files.featuredImage[0] ? `/images/${req.files.featuredImage[0].filename}` : null;

  const charteredaccountant = await Charteredaccountant.create({
    name,
    email,
    phoneNumber,
    slug: charteredaccountantSlug,
    description,
    tag,
    shortDescription,
    featuredImage,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
    rating: rating || 0,
  });

  res.status(201).json({
    status: "success",
    message: "Charteredaccountant created successfully",
    data: charteredaccountant,
    timestamp: new Date().toISOString(),
  });
});

//get all charteredaccountants
const getAllCharteredaccountants = asyncHandler(async (req, res) => {
  const charteredaccountants = await Charteredaccountant.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Charteredaccountants fetched successfully",
    data: charteredaccountants,
    timestamp: new Date().toISOString(),
  });
});

// get charteredaccountant by id or slug
const getCharteredaccountantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let charteredaccountant = null;

  charteredaccountant = await Charteredaccountant.findOne({ slug: id });

  if (!charteredaccountant && mongoose.Types.ObjectId.isValid(id)) {
    charteredaccountant = await Charteredaccountant.findById(id);
  }

  if (!charteredaccountant) {
    return res.status(404).json({
      status: "error",
      message: "Charteredaccountant not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Charteredaccountant fetched successfully",
    data: charteredaccountant,
    timestamp: new Date().toISOString(),
  });
});

//update charteredaccountant
const updateCharteredaccountant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
    status,
    slug,
    metaTitle,
    metaDescription,
    rating,
  } = req.body;

  const existingCharteredaccountant = await Charteredaccountant.findById(id);
  if (!existingCharteredaccountant) {
    return res.status(404).json({
      status: "error",
      message: "Charteredaccountant not found",
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

  if (experience !== undefined) {
    updateData.experience = experience;
  }

  if (location !== undefined) {
    updateData.location = location;
  }

  if (areaOfExpertise !== undefined) {
    updateData.areaOfExpertise = areaOfExpertise;
  }

  if (courtsAndTribunals !== undefined) {
    updateData.courtsAndTribunals = courtsAndTribunals;
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
    const charteredaccountantSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingCharteredaccountant.slug);

    const slugExists = await Charteredaccountant.findOne({
      slug: charteredaccountantSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Charteredaccountant with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = charteredaccountantSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  if (req.files && req.files.featuredImage && req.files.featuredImage[0]) {
    updateData.featuredImage = `/images/${req.files.featuredImage[0].filename}`;
  }

  const updatedCharteredaccountant = await Charteredaccountant.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedCharteredaccountant) {
    return res.status(404).json({
      status: "error",
      message: "Charteredaccountant not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Charteredaccountant updated successfully",
    data: updatedCharteredaccountant,
    timestamp: new Date().toISOString(),
  });
});

// delete charteredaccountant
const deleteCharteredaccountant = asyncHandler(async (req, res) => {
  const charteredaccountant = await Charteredaccountant.findById(req.params.id);

  if (!charteredaccountant) {
    return res.status(404).json({
      status: "error",
      message: "Charteredaccountant not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await charteredaccountant.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Charteredaccountant deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createCharteredaccountant,
  getAllCharteredaccountants,
  getCharteredaccountantById,
  updateCharteredaccountant,
  deleteCharteredaccountant,
};

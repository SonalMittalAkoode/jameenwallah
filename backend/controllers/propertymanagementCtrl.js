const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Propertymanagement = require("../models/propertymanagement.js");

// create propertymanagement
const createPropertymanagement = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    shortDescription,
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

  const propertymanagementSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingPropertymanagement = await Propertymanagement.findOne({ slug: propertymanagementSlug });
  if (existingPropertymanagement) {
    return res.status(400).json({
      status: "error",
      message: "Propertymanagement with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const propertymanagement = await Propertymanagement.create({
    name,
    email,
    phoneNumber,
    slug: propertymanagementSlug,
    description,
    shortDescription,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Propertymanagement created successfully",
    data: propertymanagement,
    timestamp: new Date().toISOString(),
  });
});

//get all propertymanagements
const getAllPropertymanagements = asyncHandler(async (req, res) => {
  const propertymanagements = await Propertymanagement.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Propertymanagements fetched successfully",
    data: propertymanagements,
    timestamp: new Date().toISOString(),
  });
});

// get propertymanagement by id or slug
const getPropertymanagementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let propertymanagement = null;

  propertymanagement = await Propertymanagement.findOne({ slug: id });

  if (!propertymanagement && mongoose.Types.ObjectId.isValid(id)) {
    propertymanagement = await Propertymanagement.findById(id);
  }

  if (!propertymanagement) {
    return res.status(404).json({
      status: "error",
      message: "Propertymanagement not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Propertymanagement fetched successfully",
    data: propertymanagement,
    timestamp: new Date().toISOString(),
  });
});

//update propertymanagement
const updatePropertymanagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    shortDescription,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  const existingPropertymanagement = await Propertymanagement.findById(id);
  if (!existingPropertymanagement) {
    return res.status(404).json({
      status: "error",
      message: "Propertymanagement not found",
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

  if (shortDescription !== undefined) {
    updateData.shortDescription = shortDescription;
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
    const propertymanagementSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingPropertymanagement.slug);

    const slugExists = await Propertymanagement.findOne({
      slug: propertymanagementSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Propertymanagement with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = propertymanagementSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  if (req.files && req.files.featuredImage && req.files.featuredImage[0]) {
    updateData.featuredImage = `/images/${req.files.featuredImage[0].filename}`;
  }

  const updatedPropertymanagement = await Propertymanagement.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPropertymanagement) {
    return res.status(404).json({
      status: "error",
      message: "Propertymanagement not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Propertymanagement updated successfully",
    data: updatedPropertymanagement,
    timestamp: new Date().toISOString(),
  });
});

// delete propertymanagement
const deletePropertymanagement = asyncHandler(async (req, res) => {
  const propertymanagement = await Propertymanagement.findById(req.params.id);

  if (!propertymanagement) {
    return res.status(404).json({
      status: "error",
      message: "Propertymanagement not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await propertymanagement.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Propertymanagement deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createPropertymanagement,
  getAllPropertymanagements,
  getPropertymanagementById,
  updatePropertymanagement,
  deletePropertymanagement,
};

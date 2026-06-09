const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Financer = require("../../models/financer");

// create financer
const createFinancer = asyncHandler(async (req, res) => {
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

  const financerSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingFinancer = await Financer.findOne({ slug: financerSlug });
  if (existingFinancer) {
    return res.status(400).json({
      status: "error",
      message: "Financer with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const financer = await Financer.create({
    name,
    email,
    phoneNumber,
    slug: financerSlug,
    description,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Financer created successfully",
    data: financer,
    timestamp: new Date().toISOString(),
  });
});

//get all financers
const getAllFinancers = asyncHandler(async (req, res) => {
  const financers = await Financer.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Financers fetched successfully",
    data: financers,
    timestamp: new Date().toISOString(),
  });
});

// get financer by id or slug
const getFinancerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let financer = null;

  financer = await Financer.findOne({ slug: id });

  if (!financer && mongoose.Types.ObjectId.isValid(id)) {
    financer = await Financer.findById(id);
  }

  if (!financer) {
    return res.status(404).json({
      status: "error",
      message: "Financer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Financer fetched successfully",
    data: financer,
    timestamp: new Date().toISOString(),
  });
});

//update financer
const updateFinancer = asyncHandler(async (req, res) => {
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

  const existingFinancer = await Financer.findById(id);
  if (!existingFinancer) {
    return res.status(404).json({
      status: "error",
      message: "Financer not found",
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
    const financerSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingFinancer.slug);

    const slugExists = await Financer.findOne({
      slug: financerSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Financer with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = financerSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedFinancer = await Financer.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedFinancer) {
    return res.status(404).json({
      status: "error",
      message: "Financer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Financer updated successfully",
    data: updatedFinancer,
    timestamp: new Date().toISOString(),
  });
});

// delete financer
const deleteFinancer = asyncHandler(async (req, res) => {
  const financer = await Financer.findById(req.params.id);

  if (!financer) {
    return res.status(404).json({
      status: "error",
      message: "Financer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await financer.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Financer deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createFinancer,
  getAllFinancers,
  getFinancerById,
  updateFinancer,
  deleteFinancer,
};

const Builder = require("../models/builder");
const asyncHandler = require("express-async-handler");

const generateSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// create builder
const createBuilder = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    description,
    metaTitle,
    metaDescription,
    reraRegistration,
    experience,
    projectsCompleted,
    ongoingProjects,
    certifications,
    partnerships,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Builder title is required",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  const builderSlug = slug || generateSlug(title);

  const existingBuilder = await Builder.findOne({ slug: builderSlug });
  if (existingBuilder) {
    return res.status(400).json({
      status: "error",
      message: "Builder with this slug already exists",
      code: 400,
      timeStamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : undefined;

  const builder = await Builder.create({
    title: title.trim(),
    slug: builderSlug,
    description,
    image,
    metaTitle,
    metaDescription,
    reraRegistration,
    experience,
    projectsCompleted,
    ongoingProjects,
    certifications,
    partnerships,
  });

  res.status(201).json({
    status: "success",
    message: "Builder created successfully",
    data: builder,
    timeStamp: new Date().toISOString(),
  });
});

// get all builders
const getAllBuilders = asyncHandler(async (req, res) => {
  const builders = await Builder.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    message: "Builders fetched successfully",
    data: builders,
    timeStamp: new Date().toISOString(),
  });
});

// get single builder
const getBuilder = asyncHandler(async (req, res) => {
  const builder = await Builder.findById(req.params.id);
  if (!builder) {
    return res.status(404).json({
      status: "error",
      message: "Builder not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Builder fetched successfully",
    data: builder,
    timestamp: new Date().toISOString(),
  });
});

// update builder
const updateBuilder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    description,
    metaTitle,
    metaDescription,
    reraRegistration,
    experience,
    projectsCompleted,
    ongoingProjects,
    certifications,
    partnerships,
  } = req.body;

  const existingBuilder = await Builder.findById(id);
  if (!existingBuilder) {
    return res.status(404).json({
      status: "error",
      message: "Builder not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const updateData = {};

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Builder title cannot be empty",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    updateData.title = title.trim();
  }

  if (slug !== undefined || title !== undefined) {
    const builderSlug =
      slug || (title ? generateSlug(title) : existingBuilder.slug);

    const slugExists = await Builder.findOne({
      slug: builderSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Builder with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = builderSlug;
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

  if (reraRegistration !== undefined) {
    updateData.reraRegistration = reraRegistration;
  }

  if (experience !== undefined) {
    updateData.experience = experience;
  }

  if (projectsCompleted !== undefined) {
    updateData.projectsCompleted = projectsCompleted;
  }

  if (ongoingProjects !== undefined) {
    updateData.ongoingProjects = ongoingProjects;
  }

  if (certifications !== undefined) {
    updateData.certifications = certifications;
  }

  if (partnerships !== undefined) {
    updateData.partnerships = partnerships;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const builder = await Builder.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!builder) {
    return res.status(404).json({
      status: "error",
      message: "Builder not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Builder updated successfully",
    data: builder,
    timestamp: new Date().toISOString(),
  });
});

// delete builder
const deleteBuilder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const builder = await Builder.findByIdAndDelete(id);
  if (!builder) {
    return res.status(404).json({
      status: "error",
      message: "Builder not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Builder deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createBuilder,
  getAllBuilders,
  getBuilder,
  updateBuilder,
  deleteBuilder,
};

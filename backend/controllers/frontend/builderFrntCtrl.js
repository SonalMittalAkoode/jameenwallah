const Builder = require("../../models/builder");
const asyncHandler = require("express-async-handler");

// get all builders
const getAllBuilders = asyncHandler(async (req, res) => {
  const builders = await Builder.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Builders fetched successfully",
    data: builders,
    timestamp: new Date().toISOString(),
  });
});

// get single builder by ID or slug
const getBuilderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Builder ID or slug is required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  let builder = null;

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    builder = await Builder.findById(id);
  }

  if (!builder) {
    builder = await Builder.findOne({ slug: id });
  }

  if (!builder) {
    return res.status(404).json({
      status: "error",
      message: `Builder not found with ID or slug: ${id}`,
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

module.exports = {
  getAllBuilders,
  getBuilderById,
};

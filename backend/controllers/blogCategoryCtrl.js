const BlogCategory = require("../models/blogCategory");
const asyncHandler = require("express-async-handler");

// create category
const createCategory = asyncHandler(async (req, res) => {
  const { title, status } = req.body;

  const exists = await BlogCategory.findOne({ title });
  if (exists) {
    return res.status(400).json({
      status: "error",
      message: "Category already exists",
      code: 400,
      timestamps: new Date().toISOString(),
    });
  }

  const category = await BlogCategory.create({ title, status });
  res.status(201).json({
    status: "success",
    message: "Blog Category created successfully",
    data: category,
    timestamps: new Date().toISOString(),
  });
});

// get all blog categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    message: "Blog categories fetched successfully",
    data: categories,
    timestamps: new Date().toISOString(),
  });
});

// get category by id
const getCategory = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({
      status: "error",
      message: "Category not found",
      code: 404,
      timestamps: new Date().toISOString(),
    });
  }
  res.status(200).json({
    status: "success",
    message: "Blog category fetched successfully",
    data: category,
    timestamps: new Date().toISOString(),
  });
});

// update blog category
const updateCategory = asyncHandler(async (req, res) => {
  const updated = await BlogCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({
      status: "error",
      message: "Category not found",
      code: 404,
      timestamps: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Blog category updated successfully",
    code: 200,
    timestamps: new Date().toISOString(),
  });
});

// delete blog category
const deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await BlogCategory.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      status: "error",
      message: "Category not found",
      code: 404,
      timestamps: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
    timestamps: new Date().toISOString(),
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};

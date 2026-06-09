const Category = require("../../models/category");
const asyncHandler = require("express-async-handler");

// get all active categories
const getActiveCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select("name slug description _id")
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      status: "success",
      message: "Active categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch categories",
    });
  }
});

// get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Category ID is required",
      });
    }

    const category = await Category.findOne({
      _id: id,
      status: "active",
    })
      .select("name slug description _id listingPageCard categoryH1Title metaTitle metaDescription")
      .lean();

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found or inactive",
      });
    }

    res.json({
      status: "success",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch category",
    });
  }
});

// get category by slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Category slug is required",
      });
    }

    const category = await Category.findOne({
      slug: slug.toLowerCase().trim(),
      status: "active",
    })
      .select("name slug description listingPageCard _id categoryH1Title metaTitle metaDescription")
      .lean();

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found or inactive",
      });
    }

    res.json({
      status: "success",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch category",
    });
  }
});

module.exports = {
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
};

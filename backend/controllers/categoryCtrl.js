const Category = require("../models/category");

// create category
const createCategory = async (req, res) => {
  try {
    const { name, description, metaTitle, metaDescription, status, listingPageCard, categoryH1Title } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        status: "error",
        message: "Category already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = await Category.create({
      name,
      slug,
      description,
      metaTitle,
      metaDescription,
      status,
      categoryH1Title,
      listingPageCard: listingPageCard || {},
    });

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: "success",
      message: "Categories fetched successfully",
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get category by id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Category fetched successfully",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// update category
const updateCategory = async (req, res) => {
  try {
    const { name, description, metaTitle, metaDescription, status, listingPageCard, categoryH1Title } = req.body;

    const updateData = { description, metaTitle, metaDescription, status };
    
    if (categoryH1Title !== undefined) {
      updateData.categoryH1Title = categoryH1Title;
    }
    
    if (listingPageCard !== undefined) {
      updateData.listingPageCard = listingPageCard;
    }

    if (name) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

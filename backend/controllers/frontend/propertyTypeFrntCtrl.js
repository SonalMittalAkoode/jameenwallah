const PropertyType = require("../../models/propertyType");
const Category = require("../../models/category");
const asyncHandler = require("express-async-handler");

// get property types by category id or name
const getPropertyTypesByCategory = asyncHandler(async (req, res) => {
  const { categoryIdOrName } = req.params;

  if (!categoryIdOrName) {
    return res.status(400).json({
      status: "error",
      message: "Category ID or name is required.",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  let category = null;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryIdOrName);

  if (isObjectId) {
    category = await Category.findOne({
      _id: categoryIdOrName,
      status: "active",
    });
  } else {
    category = await Category.findOne({
      slug: categoryIdOrName.toLowerCase().trim(),
      status: "active",
    });

    if (!category) {
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryIdOrName}$`, "i") },
        status: "active",
      });
    }

    if (!category && categoryIdOrName.endsWith("s")) {
      const singularName = categoryIdOrName.slice(0, -1);
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${singularName}$`, "i") },
        status: "active",
      });
    } else if (!category && !categoryIdOrName.endsWith("s")) {
      const pluralName = categoryIdOrName + "s";
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${pluralName}$`, "i") },
        status: "active",
      });
    }
  }

  if (!category) {
    return res.status(404).json({
      status: "error",
      message: `Category not found or inactive`,
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const propertyTypes = await PropertyType.find({
    category: category._id,
    status: "active",
  })
    .select("name _id")
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    status: "success",
    message: `Property types for category fetched successfully`,
    data: propertyTypes,
    category: category.name,
    categoryId: category._id,
    count: propertyTypes.length,
    timestamp: new Date().toISOString(),
  });
});

// get all active property types
const getAllPropertyTypes = asyncHandler(async (req, res) => {
  try {
    const propertyTypes = await PropertyType.find({
      status: "active",
    })
      .select("name _id category")
      .populate("category", "name")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "All property types fetched successfully",
      data: propertyTypes,
      count: propertyTypes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch property types",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  getPropertyTypesByCategory,
  getAllPropertyTypes,
};

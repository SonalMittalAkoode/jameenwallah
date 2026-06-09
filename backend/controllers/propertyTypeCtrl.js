const PropertyType = require("../models/propertyType");
const Category = require("../models/category");

// create property type
const createPropertyType = async (req, res) => {
  try {
    const { name, categoryId, status } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({
        status: "error",
        message: "Property type name and category ID are required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID or category does not exist",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const existingPropertyType = await PropertyType.findOne({
      name,
      category: categoryId,
    });
    if (existingPropertyType) {
      return res.status(400).json({
        status: "error",
        message: "Property type already exists in this category",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const propertyType = await PropertyType.create({
      name,
      category: categoryId,
      status: status || "active",
    });
    res.status(201).json({
      status: "success",
      message: "Property type created successfully",
      data: propertyType,
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

// get all property types
const getAllPropertyTypes = async (req, res) => {
  try {
    const propertyTypes = await PropertyType.find().populate(
      "category",
      "name"
    );
    res.status(200).json({
      status: "success",
      message: "Property types fetched successfully",
      data: propertyTypes,
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

// get property type by id
const getPropertyTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const propertyType = await PropertyType.findById(id).populate(
      "category",
      "name"
    );

    if (!propertyType) {
      return res.status(404).json({
        status: "error",
        message: "Property type not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Property type fetched successfully",
      data: propertyType,
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

// get property type by category id
const getPropertyTypesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const propertyTypes = await PropertyType.find({
      category: categoryId,
    }).populate("category", "name");

    if (!propertyTypes.length) {
      return res.status(404).json({
        status: "error",
        message: "No property types found for this category",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Property types fetched successfully",
      data: propertyTypes,
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

// update property type
const updatePropertyType = async (req, res) => {
  try {
    const { name, categoryId, status } = req.body;
    const updateData = {
      name,
      category: categoryId,
    };

    if (status !== undefined && status !== null) {
      updateData.status = status;
    }
    const propertyType = await PropertyType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");
    if (!propertyType) {
      return res.status(404).json({
        status: "error",
        message: "Property type not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Property type updated successfully",
      data: propertyType,
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

// delete property type
const deletePropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.findByIdAndDelete(req.params.id);
    if (!propertyType) {
      return res.status(404).json({
        status: "error",
        message: "Property type not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Property type deleted successfully",
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
  createPropertyType,
  getAllPropertyTypes,
  getPropertyTypeById,
  getPropertyTypesByCategoryId,
  updatePropertyType,
  deletePropertyType,
};

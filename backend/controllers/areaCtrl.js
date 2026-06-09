const Area = require("../models/area");
const City = require("../models/city");
const fs = require("fs");
const path = require("path");

// delete file
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;
    const absolutePath = path.join(__dirname, "../public", normalizedPath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

// create area
const createArea = async (req, res) => {
  try {
    const { name, cityId, status, isTrending,slug } = req.body;
    if (!name || !cityId) {
      return res.status(400).json({
        status: "error",
        message: "Area name and cityId are required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const existingCity = await City.findById(cityId);
    if (!existingCity) {
      return res.status(400).json({
        status: "error",
        message: "Invalid cityId or city does not exist",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const existingArea = await Area.findOne({ slug, city: cityId });
    if (existingArea) {
      return res.status(400).json({
        status: "error",
        message: "Area already exists in this city",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const image = req.file ? `/images/${req.file.filename}` : undefined;

    const areaData = {
      name,
      slug,
      city: cityId,
      status: status || "active",
      isTrending: isTrending || "deactive",
      image,
    };
    const area = await Area.create(areaData);
    res.status(201).json({
      status: "success",
      message: "Area created successfully",
      data: area,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get all areas
const getAllAreas = async (req, res) => {
  try {
    const areas = await Area.find().populate("city", " name");
    res.status(200).json({
      status: "success",
      message: "Areas retrieved successfully",
      data: areas,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get areas by city id
const getAreasByCityId = async (req, res) => {
  try {
    const { cityId } = req.params;
    const areas = await Area.find({ city: cityId }).populate("city", " name");
    if (!areas.length) {
      return res.status(404).json({
        status: "error",
        message: "No Areas found for this city",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Area retrieved successfully",
      data: areas,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get area by id
const getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id).populate("city", " name");
    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    // Convert Mongoose document to plain object to ensure all fields are included
    const areaData = area.toObject ? area.toObject() : area;
    res.status(200).json({
      status: "success",
      message: "Area retrieved successfully",
      data: areaData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// update area
const updateArea = async (req, res) => {
  try {
    const { name, cityId, status, isTrending,slug } = req.body;
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (cityId) updateData.city = cityId;
    if (status) updateData.status = status;
    if (isTrending !== undefined) updateData.isTrending = isTrending;

    if (req.file) {
      if (area.image) {
        deleteFile(area.image);
      }
      updateData.image = `/images/${req.file.filename}`;
    }

    const updatedArea = await Area.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      message: "Area updated successfully",
      data: updatedArea,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// delete area
const deleteArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    if (area.image) {
      deleteFile(area.image);
    }

    await Area.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Area deleted successfully",
      data: area,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  createArea,
  getAllAreas,
  getAreasByCityId,
  getAreaById,
  updateArea,
  deleteArea,
};

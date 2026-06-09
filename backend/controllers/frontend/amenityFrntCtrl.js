const Amenity = require("../../models/amenity");
const asyncHandler = require("express-async-handler");

// get all active amenities
const getAllAmenities = asyncHandler(async (req, res) => {
  try {
    const amenities = await Amenity.find({ status: "active" })
      .select("title _id")
      .sort({ title: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Active amenities fetched successfully",
      data: amenities,
      count: amenities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch amenities",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get amenity by id
const getAmenityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Amenity ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const amenity = await Amenity.findOne({
      _id: id,
      status: "active",
    })
      .select("title _id")
      .lean();

    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found or inactive",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Amenity fetched successfully",
      data: amenity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch amenity",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  getAllAmenities,
  getAmenityById,
};


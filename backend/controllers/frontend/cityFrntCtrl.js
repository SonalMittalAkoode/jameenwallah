const City = require("../../models/city");
const { getCitiesWithPropertyCounts } = require("../cityCtrl");
const asyncHandler = require("express-async-handler");

// get all active cities
const getAllCities = asyncHandler(async (req, res) => {
  try {
    const cities = await City.find({ status: "active" })
      .select("name _id state description metaTitle metaDescription cityH1Title")
      .populate("state", "name")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Active cities fetched successfully",
      data: cities,
      count: cities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch cities",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get cities by state id
const getCitiesByStateId = asyncHandler(async (req, res) => {
  try {
    const { stateId } = req.params;

    if (!stateId) {
      return res.status(400).json({
        status: "error",
        message: "State ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const cities = await City.find({
      state: stateId,
      status: "active",
    })
      .select("name _id state description metaTitle metaDescription cityH1Title")
      .populate("state", "name")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Cities fetched successfully",
      data: cities,
      count: cities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch cities",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get city by id
const getCityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "City ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const city = await City.findOne({
      _id: id,
      status: "active",
    })
      .select("name _id state description metaTitle metaDescription cityH1Title")
      .populate("state", "name")
      .lean();

    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found or inactive",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "City fetched successfully",
      data: city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch city",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get city by name (supports hyphenated URL segments)
const getCityByName = asyncHandler(async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "City name is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const decodedName = decodeURIComponent(name);
    const cityName = decodedName.replace(/-/g, " ");

    const city = await City.findOne({
      name: { $regex: new RegExp(`^${cityName}$`, "i") },
      status: "active",
    })
      .select("name _id state description metaTitle metaDescription cityH1Title")
      .populate("state", "name")
      .lean();

    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found or inactive",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "City fetched successfully",
      data: city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch city",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});


const getCityWithPropertypage = asyncHandler(async (req, res) => {
  try {
    const result = await City.aggregate([
      {
        $match: { status: "active" }, // Optional: only active cities
      },
      {
        $lookup: {
          from: "propertypages",           // collection name in MongoDB (pluralized lowercase)
          localField: "_id",
          foreignField: "cityId",
          as: "propertypages",
        },
      },
      {
        $project: {
          name: 1,
          status: 1,
          propertypages: 1,
        },
      },
    ]);
    // console.log("result",result)
    // const getallState = await City.find({ stateid: stateid });
    const message={
      "status":"success",
      "message":"Data City with propertypage sucessfully",
      "data":result
    }
    res.json(message);
    // console.log(result);
  } catch (error) {
    console.error("Error counting properties by city:", error);
  }

});

module.exports = {
  getAllCities,
  getCitiesByStateId,
  getCityById,
  getCityByName,
  getCitiesWithPropertyCounts,
  getCityWithPropertypage
};


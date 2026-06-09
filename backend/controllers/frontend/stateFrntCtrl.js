const State = require("../../models/state");
const asyncHandler = require("express-async-handler");

// get all active states
const getAllStates = asyncHandler(async (req, res) => {
  try {
    const states = await State.find({ status: "active" })
      .select("name _id")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Active states fetched successfully",
      data: states,
      count: states.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch states",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get state by id
const getStateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "State ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const state = await State.findOne({
      _id: id,
      status: "active",
    })
      .select("name _id")
      .lean();

    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found or inactive",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "State fetched successfully",
      data: state,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch state",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  getAllStates,
  getStateById,
};


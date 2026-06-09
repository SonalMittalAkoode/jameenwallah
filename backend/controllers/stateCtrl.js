const State = require("../models/state");

// create state
const createState = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "State name is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const existingState = await State.findOne({ name });
    if (existingState) {
      return res.status(400).json({
        status: "error",
        message: "State already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const stateData = {
      name,
      status: status || "active",
    };
    const state = await State.create(stateData);
    res.status(201).json({
      status: "success",
      message: "State created successfully",
      data: state,
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

// get all states
const getAllStates = async (req, res) => {
  try {
    const { includeInactive, status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    } else if (includeInactive !== "true") {
      filter.status = "active";
    }

    const states = await State.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "States retrieved successfully",
      data: states,
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

// get state by id
const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "State retrieved successfully",
      data: state,
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

// update state
const updateState = async (req, res) => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "State updated successfully",
      data: state,
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

// delete state
const deleteState = async (req, res) => {
  try {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) {
      return res.status(404).json({
        status: "error",
        message: "State not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "State deleted successfully",
      data: state,
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
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
};

const subscribe = require("../models/subscribe");
const asyncHandler = require("express-async-handler");

// get all subscribers
const getAllSubscribers = asyncHandler(async (req, res) => {
  try {
    const subscribers = await subscribe
      .find()
      .select("email isActive createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "Subscribers fetched successfully",
      data: subscribers,
      code: 200,
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
});

// update subscriber
const updateSubscriber = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const subscriber = await subscribe.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!subscriber) {
      return res.status(404).json({
        status: "error",
        message: "Subscriber not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Subscriber updated successfully",
      data: subscriber,
      code: 200,
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
});

// delete subscriber
const deleteSubscriber = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await subscribe.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({
        status: "error",
        message: "Subscriber not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Subscriber deleted successfully",
      data: subscriber,
      code: 200,
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
});

module.exports = {
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
};

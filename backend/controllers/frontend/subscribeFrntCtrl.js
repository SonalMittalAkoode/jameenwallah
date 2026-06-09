const subscribe = require("../../models/subscribe");
const asyncHandler = require("express-async-handler");

// create subscribe
const createSubscribe = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const existingSubscribe = await subscribe.findOne({ email });
    if (existingSubscribe) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    const newSubscribe = await subscribe.create({ email });
    return res.status(201).json({
      status: "success",
      message: "You are now subscribed",
      data: newSubscribe,
      code: 201,
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
  createSubscribe,
};
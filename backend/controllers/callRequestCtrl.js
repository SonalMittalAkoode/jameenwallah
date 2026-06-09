const asyncHandler = require("express-async-handler");
const CallRequest = require("../models/callRequest");

const getCallRequests = asyncHandler(async (req, res) => {
  const requests = await CallRequest.find().sort({ createdAt: -1 }).lean();

  res.status(200).json({
    status: "success",
    message: "Call requests fetched successfully",
    data: requests,
    timestamp: new Date().toISOString(),
  });
});

const updateCallRequest = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const request = await CallRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).lean();

  if (!request) {
    return res.status(404).json({
      status: "error",
      message: "Call request not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Call request updated successfully",
    data: request,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getCallRequests,
  updateCallRequest,
};

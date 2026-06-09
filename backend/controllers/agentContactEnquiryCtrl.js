const AgentContactEnquiry = require("../models/agentContactEnquiry");
const asyncHandler = require("express-async-handler");

const getAgentContactEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await AgentContactEnquiry.find()
    .populate({
      path: "agent",
      select: "name email phoneNumber status",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Agent contact enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getAgentContactEnquiries,
};

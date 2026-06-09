const asyncHandler = require("express-async-handler");
const ConsultancyEnquiry = require("../models/consultancyenquiry");

const getConsultancyEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await ConsultancyEnquiry.find().sort({ createdAt: -1 }).lean();

  res.status(200).json({
    status: "success",
    message: "Service enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getConsultancyEnquiries,
};

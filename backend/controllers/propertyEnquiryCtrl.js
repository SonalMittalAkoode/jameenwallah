const PropertyEnquiry = require("../models/propertyenquiry");
const asyncHandler = require("express-async-handler");

const getPropertyEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await PropertyEnquiry.find()
    .populate({
      path: "property",
      select: "description.title details.customId",
    })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: "success",
    message: "Property enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getPropertyEnquiries,
};

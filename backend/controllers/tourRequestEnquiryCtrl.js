const TourRequestEnquiry = require("../models/tourRequestEnquiry");
const asyncHandler = require("express-async-handler");

// get all tour request enquiries
const getTourRequestEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await TourRequestEnquiry.find()
    .populate({
      path: "property",
      select: "description.title details.customId",
    })
    .populate({
      path: "assignedAgent",
      select: "name phoneNumber email",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Tour request enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getTourRequestEnquiries,
};

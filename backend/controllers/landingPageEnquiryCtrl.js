const LandingPageEnquiry = require("../models/landingPageEnquiry");
const asyncHandler = require("express-async-handler");

// get all landing page enquiries
const getLandingPageEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await LandingPageEnquiry.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Landing page enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getLandingPageEnquiries,
};

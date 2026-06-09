const asyncHandler = require("express-async-handler");
const BecomePartnerEnquiry = require("../models/becomeapartnerenquiry");

const getBecomePartnerEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await BecomePartnerEnquiry.find().sort({ createdAt: -1 }).lean();

  res.status(200).json({
    status: "success",
    message: "Partner enquiries fetched successfully",
    data: enquiries,
  });
});

module.exports = {
  getBecomePartnerEnquiries,
};

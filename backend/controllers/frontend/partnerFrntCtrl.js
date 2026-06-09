const Partner = require("../../models/partner");
const asyncHandler = require("express-async-handler");

// get all partners
const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partner.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Partners fetched successfully",
    data: partners,
    timestamp: new Date().toISOString(),
  });
});

// get single partner by ID or slug
const getPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Partner ID or slug is required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  let partner = null;

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    partner = await Partner.findById(id);
  }

  if (!partner) {
    partner = await Partner.findOne({ slug: id });
  }

  if (!partner) {
    return res.status(404).json({
      status: "error",
      message: `Partner not found with ID or slug: ${id}`,
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Partner fetched successfully",
    data: partner,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getAllPartners,
  getPartnerById,
};

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Partner = require("../models/partner.js");

// create partner
const createPartner = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and phone number are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const partnerSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingPartner = await Partner.findOne({ slug: partnerSlug });
  if (existingPartner) {
    return res.status(400).json({
      status: "error",
      message: "Partner with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const partner = await Partner.create({
    name,
    email,
    phoneNumber,
    slug: partnerSlug,
    description,
    metaTitle,
    metaDescription,
    status: status || "active",
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Partner created successfully",
    data: partner,
    timestamp: new Date().toISOString(),
  });
});

//get all partners
const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partner.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Partners fetched successfully",
    data: partners,
    timestamp: new Date().toISOString(),
  });
});

// get partner by id or slug
const getPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let partner = null;

  partner = await Partner.findOne({ slug: id });

  if (!partner && mongoose.Types.ObjectId.isValid(id)) {
    partner = await Partner.findById(id);
  }

  if (!partner) {
    return res.status(404).json({
      status: "error",
      message: "Partner not found",
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

//update partner
const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    status,
    slug,
    metaTitle,
    metaDescription,
  } = req.body;

  const existingPartner = await Partner.findById(id);
  if (!existingPartner) {
    return res.status(404).json({
      status: "error",
      message: "Partner not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  if (phoneNumber !== undefined) {
    updateData.phoneNumber = phoneNumber;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (metaTitle !== undefined) {
    updateData.metaTitle = metaTitle;
  }

  if (metaDescription !== undefined) {
    updateData.metaDescription = metaDescription;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (slug !== undefined) {
    const partnerSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingPartner.slug);

    const slugExists = await Partner.findOne({
      slug: partnerSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Partner with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = partnerSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPartner) {
    return res.status(404).json({
      status: "error",
      message: "Partner not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Partner updated successfully",
    data: updatedPartner,
    timestamp: new Date().toISOString(),
  });
});

// delete partner
const deletePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    return res.status(404).json({
      status: "error",
      message: "Partner not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await partner.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Partner deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
};

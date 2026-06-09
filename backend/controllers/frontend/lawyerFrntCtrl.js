const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Lawyer = require("../../models/lawyer");

// create lawyer
const createLawyer = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    featuredImage,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
    status,
    slug,
    metaTitle,
    metaDescription,
    rating,
  } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and phone number are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const lawyerSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existingLawyer = await Lawyer.findOne({ slug: lawyerSlug });
  if (existingLawyer) {
    return res.status(400).json({
      status: "error",
      message: "Lawyer with this slug already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const image = req.file ? `/images/${req.file.filename}` : null;

  const lawyer = await Lawyer.create({
    name,
    email,
    phoneNumber,
    slug: lawyerSlug,
    description,
    tag,
    shortDescription,
    featuredImage,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
    metaTitle,
    metaDescription,
    status: status || "active",
    rating: rating !== undefined ? rating : 0,
    image,
  });

  res.status(201).json({
    status: "success",
    message: "Lawyer created successfully",
    data: lawyer,
    timestamp: new Date().toISOString(),
  });
});

//get all lawyers
const getAllLawyers = asyncHandler(async (req, res) => {
  const lawyers = await Lawyer.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages: "Lawyers fetched successfully",
    data: lawyers,
    timestamp: new Date().toISOString(),
  });
});

// get lawyer by id or slug
const getLawyerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let lawyer = null;

  lawyer = await Lawyer.findOne({ slug: id });

  if (!lawyer && mongoose.Types.ObjectId.isValid(id)) {
    lawyer = await Lawyer.findById(id);
  }

  if (!lawyer) {
    return res.status(404).json({
      status: "error",
      message: "Lawyer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Lawyer fetched successfully",
    data: lawyer,
    timestamp: new Date().toISOString(),
  });
});

//update lawyer
const updateLawyer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    description,
    tag,
    shortDescription,
    featuredImage,
    registrationNumber,
    experience,
    location,
    areaOfExpertise,
    courtsAndTribunals,
    status,
    slug,
    metaTitle,
    metaDescription,
    rating,
  } = req.body;

  const existingLawyer = await Lawyer.findById(id);
  if (!existingLawyer) {
    return res.status(404).json({
      status: "error",
      message: "Lawyer not found",
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

  if (tag !== undefined) {
    updateData.tag = tag;
  }

  if (shortDescription !== undefined) {
    updateData.shortDescription = shortDescription;
  }

  if (featuredImage !== undefined) {
    updateData.featuredImage = featuredImage;
  }

  if (registrationNumber !== undefined) {
    updateData.registrationNumber = registrationNumber;
  }

  if (experience !== undefined) {
    updateData.experience = experience;
  }

  if (location !== undefined) {
    updateData.location = location;
  }

  if (areaOfExpertise !== undefined) {
    updateData.areaOfExpertise = areaOfExpertise;
  }

  if (courtsAndTribunals !== undefined) {
    updateData.courtsAndTribunals = courtsAndTribunals;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (rating !== undefined) {
    updateData.rating = rating;
  }

  if (slug !== undefined) {
    const lawyerSlug =
      slug ||
      (name
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
        : existingLawyer.slug);

    const slugExists = await Lawyer.findOne({
      slug: lawyerSlug,
      _id: { $ne: id },
    });
    if (slugExists) {
      return res.status(400).json({
        status: "error",
        message: "Lawyer with this slug already exists",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    updateData.slug = lawyerSlug;
  }

  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }

  const updatedLawyer = await Lawyer.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedLawyer) {
    return res.status(404).json({
      status: "error",
      message: "Lawyer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Lawyer updated successfully",
    data: updatedLawyer,
    timestamp: new Date().toISOString(),
  });
});

// delete lawyer
const deleteLawyer = asyncHandler(async (req, res) => {
  const lawyer = await Lawyer.findById(req.params.id);

  if (!lawyer) {
    return res.status(404).json({
      status: "error",
      message: "Lawyer not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  await lawyer.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Lawyer deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createLawyer,
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
};

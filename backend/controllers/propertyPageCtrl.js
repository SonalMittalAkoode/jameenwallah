const PropertyPage = require("../models/propertyPage");
const asyncHandler = require("express-async-handler");

// create propertyPage
const createPropertyPage = asyncHandler(async (req, res) => {
  const { title, description, propertyId,cityId, status,metatitle,metadescription } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      status: "error",
      message: "Title and description are required fields",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const slug = title.toLowerCase().trim().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const propertyPageData = {
    title,
    slug,
    description,
    status,
    metatitle,
    metadescription
  };

  // Only include propertyId if it's provided
  if (propertyId) {
    propertyPageData.propertyId = propertyId;
  }
  if (cityId) {
    propertyPageData.cityId = cityId;
  }

  const propertyPage = await PropertyPage.create(propertyPageData);

  res.status(201).json({
    status: "success",
    message: "propertyPage created successfully",
    data: propertyPage,
    timestamp: new Date().toISOString(),
  });
});

// get all propertyPages
const getAllPropertyPages = asyncHandler(async (req, res) => {
  const propertyPages = await PropertyPage.find()
    .populate("propertyId", "description.title details.customId status")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "FAQs fetched successfully",
    data: propertyPages,
    timestamp: new Date().toISOString(),
  });
});

// get propertyPages by property
const getPropertyPagesByProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const propertyPages = await PropertyPage.find({ propertyId })
    .populate("propertyId","cityId", "description.title details.customId status")
    .sort({ createdAt: -1 });

  if (!propertyPages || propertyPages.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No FAQs found for this property",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "FAQs fetched successfully",
    data: propertyPages,
    timestamp: new Date().toISOString(),
  });
});

// get propertyPage by id
const getPropertyPage = asyncHandler(async (req, res) => {
  const propertyPage = await PropertyPage.findById(req.params.id).populate(
    "propertyId",
    "description.title details.customId status"
  );

  if (!propertyPage) {
    return res.status(404).json({
      status: "error",
      message: "FAQ not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "FAQ fetched successfully",
    data: propertyPage,
    timestamp: new Date().toISOString(),
  });
});

// update propertyPage
const updatePropertyPage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // If title is updated, update the slug as well
  if (req.body.title && !req.body.slug) {
    req.body.slug = req.body.title.toLowerCase().trim().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  const updatedPropertyPage = await PropertyPage.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("propertyId", "description.title details.customId status");

  if (!updatedPropertyPage) {
    return res.status(404).json({
      status: "error",
      message: "FAQ not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "FAQs updated successfully",
    data: updatedPropertyPage,
    timestamp: new Date().toISOString(),
  });
});

// delete propertyPage
const deletePropertyPage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPropertyPage = await PropertyPage.findByIdAndDelete(id);

  if (!deletedPropertyPage) {
    return res.status(404).json({
      status: "error",
      message: "FAQ not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "FAQ deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createPropertyPage,
  getAllPropertyPages,
  getPropertyPagesByProperty,
  getPropertyPage,
  updatePropertyPage,
  deletePropertyPage,
};

const Faq = require("../models/faq");
const asyncHandler = require("express-async-handler");

// create faq
const createFaq = asyncHandler(async (req, res) => {
  const { title, description, propertyId, status } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      status: "error",
      message: "Title and description are required fields",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const faqData = {
    title,
    description,
    status,
  };

  // Only include propertyId if it's provided
  if (propertyId) {
    faqData.propertyId = propertyId;
  }

  const faq = await Faq.create(faqData);

  res.status(201).json({
    status: "success",
    message: "faq created successfully",
    data: faq,
    timestamp: new Date().toISOString(),
  });
});

// get all faqs
const getAllFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find()
    .populate("propertyId", "description.title details.customId status")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "FAQs fetched successfully",
    data: faqs,
    timestamp: new Date().toISOString(),
  });
});

// get faqs by property
const getFaqsByProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const faqs = await Faq.find({ propertyId })
    .populate("propertyId", "description.title details.customId status")
    .sort({ createdAt: -1 });

  if (!faqs || faqs.length === 0) {
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
    data: faqs,
    timestamp: new Date().toISOString(),
  });
});

// get faq by id
const getFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id).populate(
    "propertyId",
    "description.title details.customId status"
  );

  if (!faq) {
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
    data: faq,
    timestamp: new Date().toISOString(),
  });
});

// update faq
const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedFaq = await Faq.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("propertyId", "description.title details.customId status");

  if (!updatedFaq) {
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
    data: updatedFaq,
    timestamp: new Date().toISOString(),
  });
});

// delete faq
const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedFaq = await Faq.findByIdAndDelete(id);

  if (!deletedFaq) {
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
  createFaq,
  getAllFaqs,
  getFaqsByProperty,
  getFaq,
  updateFaq,
  deleteFaq,
};

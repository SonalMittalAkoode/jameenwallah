const Faq = require("../../models/faq");
const asyncHandler = require("express-async-handler");

// get limited FAQs
const getLimitedFAQs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  // Only fetch FAQs that are not linked to any property (propertyId is null or doesn't exist)
  const faqs = await Faq.find({ 
    status: "active",
    $or: [
      { propertyId: null },
      { propertyId: { $exists: false } }
    ]
  })
    .select("title description createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    status: "success",
    message: "FAQs fetched successfully",
    data: faqs,
    count: faqs.length,
    timestamp: new Date().toISOString(),
  });
});

// get FAQs by property ID
const getFAQsByProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!propertyId) {
    return res.status(400).json({
      status: "error",
      message: "Property ID is required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const faqs = await Faq.find({ 
      propertyId, 
      status: "active" 
    })
      .select("title description createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Always return success with data array (even if empty)
    res.status(200).json({
      status: "success",
      message: "FAQs fetched successfully",
      data: faqs || [],
      count: faqs ? faqs.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching FAQs by property:", error);
    // Return empty array on error instead of error response
    res.status(200).json({
      status: "success",
      message: "FAQs fetched successfully",
      data: [],
      count: 0,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  getLimitedFAQs,
  getFAQsByProperty,
};

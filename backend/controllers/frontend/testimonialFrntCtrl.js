const Testimonial = require("../../models/testimonial");
const asyncHandler = require("express-async-handler");

// get all testimonials
const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ status: "active" })
    .select("title description name rating createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: "success",
    message: "Testimonials fetched successfully",
    data: testimonials,
    count: testimonials.length,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getAllTestimonials,
};

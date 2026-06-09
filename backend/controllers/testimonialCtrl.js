const Testimonial = require("../models/testimonial");
const asyncHandler = require("express-async-handler");

// create testimonial
const createTestimonial = asyncHandler(async (req, res) => {
  const { title, description, name, rating, status } = req.body;

  if (!title || !description || !name || !rating) {
    return res.status(400).json({
      status: "error",
      message: "All required fields must be provided",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      status: "error",
      message: "Rating must be between 1 and 5",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const testimonial = await Testimonial.create({
    title,
    description,
    name,
    rating,
    status,
  });

  res.status(201).json({
    status: "success",
    message: "Testimonial created successfully",
    data: testimonial,
    timestamp: new Date().toISOString(),
  });
});

// get all testimonials
const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Testimonials fetched successfully",
    data: testimonials,
    timestamp: new Date().toISOString(),
  });
});

// get testimonial by id
const getTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json({
      status: "error",
      message: "Testimonial not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Testimonial fetched successfully",
    data: testimonial,
    timestamp: new Date().toISOString(),
  });
});

// update testimonial
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, name, rating, status } = req.body;

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({
      status: "error",
      message: "Rating must be between 1 and 5",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const updatedTestimonial = await Testimonial.findByIdAndUpdate(
    id,
    { title, description, name, rating, status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedTestimonial) {
    return res.status(404).json({
      status: "error",
      message: "Testimonial not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Testimonial updated successfully",
    data: updatedTestimonial,
    timestamp: new Date().toISOString(),
  });
});

// delete testimonial
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

  if (!deletedTestimonial) {
    return res.status(404).json({
      status: "error",
      message: "Testimonial not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Testimonial deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
};

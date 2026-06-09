const LandingPageEnquiry = require("../../models/landingPageEnquiry");
const asyncHandler = require("express-async-handler");

// create landing page enquiry
const createLandingPageEnquiry = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;

  if (!name || !email || !phoneNumber || !message) {
    return res.status(400).json({
      status: "error",
      message: "All fields (name, email, phoneNumber, message) are required",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Validate phone number - must be exactly 10 digits
  const cleanedPhone = phoneNumber.trim().replace(/[\s\-\(\)\+]/g, "");
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number should contain only numbers",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if exactly 10 digits
  if (cleanedPhone.length !== 10) {
    return res.status(400).json({
      status: "error",
      message: "Phone number must be exactly 10 digits",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Indian phone number validation (must start with 6-9)
  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number should start with 6, 7, 8, or 9",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Convert phone number to number type
  const phoneNumberAsNumber = Number(cleanedPhone);

  const enquiry = await LandingPageEnquiry.create({
    name,
    email,
    phoneNumber: phoneNumberAsNumber,
    message,
  });

  res.status(201).json({
    status: "success",
    message: "Landing page enquiry submitted successfully",
    data: enquiry,
    timestamp: new Date().toISOString(),
  });
});

// get all landing page enquiries
const getAllLandingPageEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await LandingPageEnquiry.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Landing page enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

// get a single landing page enquiry
const getLandingPageEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await LandingPageEnquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      status: "error",
      message: "Landing page enquiry not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Landing page enquiry fetched successfully",
    data: enquiry,
    timestamp: new Date().toISOString(),
  });
});

// update a landing page enquiry
const updateLandingPageEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedEnquiry = await LandingPageEnquiry.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedEnquiry) {
    return res.status(404).json({
      status: "error",
      message: "Landing page enquiry not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Landing page enquiry updated successfully",
    data: updatedEnquiry,
    timestamp: new Date().toISOString(),
  });
});

// delete a landing page enquiry
const deleteLandingPageEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedEnquiry = await LandingPageEnquiry.findByIdAndDelete(id);

  if (!deletedEnquiry) {
    return res.status(404).json({
      status: "error",
      message: "Landing page enquiry not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Landing page enquiry deleted successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createLandingPageEnquiry,
  getAllLandingPageEnquiries,
  getLandingPageEnquiry,
  updateLandingPageEnquiry,
  deleteLandingPageEnquiry,
};

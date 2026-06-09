const BecomeaPartnerEnquiryModel = require("../../models/becomeapartnerenquiry");
const asyncHandler = require("express-async-handler");

// create becomeapartnerenquiry
const createBecomeaPartnerEnquiry = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, email, message, partnertype } = req.body;

  if (!fullName || !phoneNumber || !email || !message || !partnertype) {
    return res.status(400).json({
      status: "error",
      message:
        "Required fields missing: fullName, phoneNumber, email, message, partnertype",
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

  const doc = await BecomeaPartnerEnquiryModel.create({
    fullName: String(fullName).trim(),
    phoneNumber: phoneNumberAsNumber,
    email: String(email).trim().toLowerCase(),
    message: String(message).trim(),
    partnertype: String(partnertype).trim(),
  });

  res.status(201).json({
    status: "success",
    message: "Partner application submitted successfully",
    data: doc,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createBecomeaPartnerEnquiry,
};

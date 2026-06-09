const asyncHandler = require("express-async-handler");
const CallRequest = require("../../models/callRequest");

const ALLOWED_SERVICES = new Set([
  "Buy Property",
  "Sell Property",
  "Investment Advisory",
  "Legal Services",
  "Financial Services",
  "Architecture & Design",
  "Chartered Accountant",
  "Property Management",
  "Become a Partner",
  "General Consultation",
]);

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const normalizeIndianPhone = (value) => {
  const digits = cleanText(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};

const createCallRequest = asyncHandler(async (req, res) => {
  const name = cleanText(req.body?.name || req.body?.fullName);
  const service = cleanText(req.body?.service);
  const sourcePage = cleanText(req.body?.sourcePage);
  const cleanedPhone = normalizeIndianPhone(req.body?.phoneNumber || req.body?.phone);

  if (!name || !cleanedPhone || !service) {
    return res.status(400).json({
      status: "error",
      message: "Required fields missing: name, phoneNumber, service",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number must be a valid 10 digit Indian mobile number",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (!ALLOWED_SERVICES.has(service)) {
    return res.status(400).json({
      status: "error",
      message: "Please choose a valid service option",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const request = await CallRequest.create({
    name,
    phoneNumber: cleanedPhone,
    service,
    sourcePage,
  });

  res.status(201).json({
    status: "success",
    message: "Call request submitted successfully",
    data: request,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createCallRequest,
};

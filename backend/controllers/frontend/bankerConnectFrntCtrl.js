const BankerConnect = require("../../models/bankerConnect");
const asyncHandler = require("express-async-handler");

const normalizeOption = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const employmentTypeAliases = {
  salaried: "salaried",
  "self-employed": "self-employed",
  "self employed": "self-employed",
  "business-owner": "business-owner",
  "business owner": "business-owner",
  professional: "professional",
  retired: "retired",
};

const loanTypeAliases = {
  "home-loan": "home-loan",
  "home loan": "home-loan",
  mortgage: "home-loan",
  "commercial-loan": "commercial-loan",
  "commercial loan": "commercial-loan",
  "plot-loan": "plot-loan",
  "plot loan": "plot-loan",
  "construction-loan": "construction-loan",
  "construction loan": "construction-loan",
  "balance-transfer": "balance-transfer",
  "balance transfer": "balance-transfer",
  "top-up-loan": "top-up-loan",
  "top up loan": "top-up-loan",
};

// create banker connect request
const createBankerConnect = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    monthlyIncome,
    employmentType,
    loanType,
    message,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !monthlyIncome ||
    !employmentType ||
    !loanType
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Required fields missing: fullName, email, phoneNumber, monthlyIncome, employmentType, loanType",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid email format",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Validate phone number - must be exactly 10 digits
  const cleanedPhone = String(phoneNumber).trim().replace(/[\s\-\(\)\+]/g, "");
  
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

  if (monthlyIncome < 0) {
    return res.status(400).json({
      status: "error",
      message: "Monthly income must be a positive number",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const normalizedEmploymentKey = normalizeOption(employmentType);
  const normalizedLoanKey = normalizeOption(loanType);
  const normalizedEmploymentType =
    employmentTypeAliases[normalizedEmploymentKey] ||
    employmentTypeAliases[String(employmentType).trim().toLowerCase()];
  const normalizedLoanType =
    loanTypeAliases[normalizedLoanKey] ||
    loanTypeAliases[String(loanType).trim().toLowerCase()];

  if (!normalizedEmploymentType || !normalizedLoanType) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid employmentType or loanType. Please choose a supported option.",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const bankerConnect = await BankerConnect.create({
    fullName,
    email,
    phoneNumber: cleanedPhone, // Store cleaned phone number
    monthlyIncome: Number(monthlyIncome),
    employmentType: normalizedEmploymentType,
    loanType: normalizedLoanType,
    message: message || "",
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    message:
      "Banker connect request submitted successfully. Our banking experts will contact you soon.",
    data: bankerConnect,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createBankerConnect,
};

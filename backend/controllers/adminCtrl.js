const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const nodemailer = require("nodemailer");

// admin register
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await User.findOne({ email });
  if (adminExists) {
    res.status(400).json({
      status: "error",
      message: "Admin already exists",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const admin = await User.create({
    name,
    email,
    password,
    otp,
  });

  if (admin) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BigCat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your OTP is: ${otp}`,
    });
    res.status(201).json({
      status: "success",
      message: "User registered. Please verify your email using OTP sent.",
      data: {
        _id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Invalid user data",
      code: 400,
      errors: error.errors,
      timestamp: new Date().toISOString(),
    });
  }
});

// verify email otp
const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const admin = await User.findOne({ email });

  if (!admin) {
    res.status(404).json({
      status: "error",
      message: "Admin not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  if (admin.otp !== otp) {
    res.status(400).json({
      status: "error",
      message: "Invalid OTP",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  admin.otp = undefined;
  await admin.save();

  res.json({
    status: "success",
    message: "Email verified successfully",
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    },
    timestamp: new Date().toISOString(),
  });
});

// admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email });

  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin Not Found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  if (admin.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Only admins can log in.",
      code: 403,
      timestamp: new Date().toISOString(),
    });
  }

  if (!admin.password) {
    return res.status(400).json({
      status: "error",
      message: "Password not set for this admin.",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
      code: 401,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Admin login successful",
    data: {
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    },
    timestamp: new Date().toISOString(),
  });
});

//create broker
const createBroker = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
        timestamp: new Date().toISOString(),
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Broker with this email already exists",
        timestamp: new Date().toISOString(),
      });
    }

    const broker = await User.create({
      name,
      email,
      role: "broker",
    });

    res.status(201).json({
      status: "success",
      message: "Broker created successfully",
      data: { id: broker._id, name: broker.name, email: broker.email },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// get all brokers
const getAllBrokers = async (req, res) => {
  try {
    const brokers = await User.find({ role: "broker" });
    res.status(200).json({
      status: "success",
      message: "Brokers fetched successfully",
      data: brokers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// admin logout
const adminLogout = asyncHandler(async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Admin logged out successfully",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  registerAdmin,
  verifyEmailOtp,
  adminLogin,
  adminLogout,
  createBroker,
  getAllBrokers,
};

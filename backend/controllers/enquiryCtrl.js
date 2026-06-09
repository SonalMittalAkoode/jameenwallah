const Enquiry = require("../models/enquiry");
const asyncHandler = require("express-async-handler");

const getEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

const getEnquiryAnalytics = asyncHandler(async (req, res) => {
  // 1. Weekly Data (Last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const weeklyData = await Enquiry.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) - 7 (Sat)
        count: { $sum: 1 },
      },
    },
  ]);

  // Map MongoDB dayOfWeek (1=Sun, 7=Sat) to our chart labels
  const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Initialize last 7 days with 0/correct day name
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysMap[d.getDay()];
    const found = weeklyData.find((w) => {
      // MongoDB $dayOfWeek returns 1 for Sunday, which matches d.getDay() + 1
      return w._id === d.getDay() + 1;
    });
    last7Days.push({
      period: dayName,
      totalEnquiries: found ? found.count : 0,
    });
  }

  // 2. Monthly Data (Current Year)
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  
  const monthlyData = await Enquiry.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, // 1 (Jan) - 12 (Dec)
        count: { $sum: 1 },
      },
    },
  ]);

  const monthsMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYearMonths = monthsMap.map((m, index) => {
    const found = monthlyData.find((item) => item._id === index + 1);
    return {
      period: m,
      totalEnquiries: found ? found.count : 0,
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      weekly: last7Days,
      monthly: currentYearMonths,
    },
  });
});

module.exports = {
  getEnquiries,
  getEnquiryAnalytics,
};

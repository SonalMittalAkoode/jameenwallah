const asyncHandler = require("express-async-handler");
const Property = require("../models/property");
const PropertyType = require("../models/propertyType");
const TourRequestEnquiry = require("../models/tourRequestEnquiry");
const LandingPageEnquiry = require("../models/landingPageEnquiry");
const Enquiry = require("../models/enquiry");

const getDashboardCounts = asyncHandler(async (req, res) => {
  const [
    propertiesCount,
    propertyEnquiriesCount,
    landingPageEnquiriesCount,
    contactEnquiriesCount,
  ] = await Promise.all([
    Property.countDocuments(),
    TourRequestEnquiry.countDocuments(),
    LandingPageEnquiry.countDocuments(),
    Enquiry.countDocuments(),
  ]);

  res.status(200).json({
    status: "success",
    message: "Dashboard counts fetched successfully",
    data: {
      properties: propertiesCount,
      propertyEnquiries: propertyEnquiriesCount,
      landingPageEnquiries: landingPageEnquiriesCount,
      contactEnquiries: contactEnquiriesCount,
    },
    timestamp: new Date().toISOString(),
  });
});

// get property type analytics
const getPropertyTypeAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Property.aggregate([
    { $match: { status: "verified" } },
    {
      $lookup: {
        from: "propertytypes",
        localField: "description.propertyType",
        foreignField: "_id",
        as: "propertyTypeInfo",
      },
    },
    {
      $unwind: { path: "$propertyTypeInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: "$propertyTypeInfo.name",
        count: { $sum: 1 },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        name: "$_id",
        count: 1,
      },
    },
  ]);

  const total = analytics.reduce((sum, item) => sum + item.count, 0);

  res.status(200).json({
    status: "success",
    message: "Property type analytics fetched successfully",
    data: {
      types: analytics,
      total,
    },
    timestamp: new Date().toISOString(),
  });
});

// get city level property analytics
const getCityLevelAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Property.aggregate([
    { $match: { status: "verified" } },
    {
      $lookup: {
        from: "cities",
        localField: "location.city",
        foreignField: "_id",
        as: "cityInfo",
      },
    },
    { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$cityInfo.name",
        count: { $sum: 1 },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        cityName: "$_id",
        total: "$count",
      },
    },
  ]);

  const total = analytics.reduce((sum, item) => sum + item.total, 0);

  res.status(200).json({
    status: "success",
    message: "City-level property analytics fetched successfully",
    data: {
      cities: analytics,
      total,
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getDashboardCounts,
  getPropertyTypeAnalytics,
  getCityLevelAnalytics,
};

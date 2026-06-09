const Area = require("../../models/area");
const City = require("../../models/city");
const Property = require("../../models/property");
const asyncHandler = require("express-async-handler");

// get all active areas
const getAllAreas = asyncHandler(async (req, res) => {
  try {
    const areas = await Area.find({ status: "active" })
      .select("name _id city")
      .populate("city", "name")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Active areas fetched successfully",
      data: areas,
      count: areas.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch areas",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get areas by city id
const getAreasByCityId = asyncHandler(async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!cityId) {
      return res.status(400).json({
        status: "error",
        message: "City ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const areas = await Area.find({
      city: cityId,
      status: "active",
    })
      .select("name _id city")
      .populate("city", "name")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      message: "Areas fetched successfully",
      data: areas,
      count: areas.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch areas",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get area by id
const getAreaById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Area ID is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const area = await Area.findOne({
      _id: id,
      status: "active",
    })
      .select("name _id city")
      .populate("city", "name")
      .lean();

    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found or inactive",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Area fetched successfully",
      data: area,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch area",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get trending areas by city name
const getTrendingAreasByCityName = asyncHandler(async (req, res) => {
  try {
    const { cityName } = req.params;

    if (!cityName) {
      return res.status(400).json({
        status: "error",
        message: "City name is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    // Normalize city name: convert hyphens to spaces and handle case
    const normalizedCityName = cityName
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Find city by name
    
    const city = await City.findOne({
      name: { $regex: new RegExp(`^${normalizedCityName}$`, "i") },
      status: "active",
    }).lean();

    if (!city) {
      return res.status(200).json({
        status: "success",
        message: "No city found or no trending areas",
        data: [],
        count: 0,
        cityDisplayName: normalizedCityName,
        timestamp: new Date().toISOString(),
      });
    }

    // Find trending areas for this city
    const areas = await Area.find({
      city: city._id,
      status: "active",
      isTrending: "active",
    })
      .select("name _id city image")
      .populate("city", "name")
      .sort({ name: 1 })
      .lean();

    // Format areas for frontend
    const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
    const formattedAreas = areas.map((area) => ({
      name: area.name,
      image: area.image
        ? area.image.startsWith("http")
          ? area.image
          : area.image.startsWith("/")
          ? `${baseUrl}${area.image}`
          : `${baseUrl}/${area.image}`
        : null,
    }));

    res.status(200).json({
      status: "success",
      message: "Trending areas fetched successfully",
      data: formattedAreas,
      count: formattedAreas.length,
      cityDisplayName: city.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch trending areas",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});
const getTrendingAreasList = asyncHandler(async (req, res) => {
  try {
    let limit = 100;
    let page = 1;
    if (req.query.limit) limit = Math.max(1, Number(req.query.limit) || 100);
    if (req.query.page) page = Math.max(1, Number(req.query.page) || 1);

    const areaMatch = { status: "active", isTrending: "active" };

    const [areasList, totalCount] = await Promise.all([
      Area.aggregate([
        { $match: areaMatch },
        {
          $lookup: {
            from: "properties",
            let: { areaId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$location.area", "$$areaId"] },
                },
              },
              {
                $project: {
                  price: "$description.price",
                  size: {
                    $ifNull: [
                      "$details.sizeInFt",
                      {
                        $ifNull: [
                          "$details.sizeInSqFt",
                          { $ifNull: ["$details.totalAreaInSqFt", "$maxSize"] },
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $addFields: {
                  pricePerSqft: {
                    $cond: [
                      {
                        $and: [
                          { $gt: ["$price", 0] },
                          { $gt: ["$size", 0] },
                        ],
                      },
                      { $divide: ["$price", "$size"] },
                      null,
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "propertytypes",
                  localField: "description.propertyType",
                  foreignField: "_id",
                  as: "propertyTypeDoc",
                },
              },
              {
                $addFields: {
                  propertyTypeName: {
                    $toLower: {
                      $ifNull: [{ $arrayElemAt: ["$propertyTypeDoc.name", 0] }, ""],
                    },
                  },
                },
              },
              {
                $addFields: {
                  segment: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $regexMatch: {
                              input: "$propertyTypeName",
                              regex: "residential\\s*plot|plot",
                            },
                          },
                          then: "residential-plots",
                        },
                        {
                          case: {
                            $regexMatch: {
                              input: "$propertyTypeName",
                              regex: "villa",
                            },
                          },
                          then: "villas",
                        },
                        {
                          case: {
                            $regexMatch: {
                              input: "$propertyTypeName",
                              regex: "low\\s*rise|floor",
                            },
                          },
                          then: "low-rise-floors",
                        },
                        {
                          case: {
                            $regexMatch: {
                              input: "$propertyTypeName",
                              regex: "mid\\s*rise",
                            },
                          },
                          then: "mid-rise",
                        },
                        {
                          case: {
                            $regexMatch: {
                              input: "$propertyTypeName",
                              regex: "high\\s*rise|apartment|tower",
                            },
                          },
                          then: "high-rise",
                        },
                      ],
                      default: "high-rise",
                    },
                  },
                },
              },
              {
                $facet: {
                  counts: [{ $count: "propertyCount" }],
                  prices: [
                    { $match: { pricePerSqft: { $ne: null, $gt: 0 } } },
                    {
                      $group: {
                        _id: null,
                        avgPricePerSqft: { $avg: "$pricePerSqft" },
                        minPricePerSqft: { $min: "$pricePerSqft" },
                        maxPricePerSqft: { $max: "$pricePerSqft" },
                      },
                    },
                  ],
                  segmentStats: [
                    {
                      $group: {
                        _id: "$segment",
                        propertyCount: { $sum: 1 },
                        avgPricePerSqft: { $avg: "$pricePerSqft" },
                        minPricePerSqft: { $min: "$pricePerSqft" },
                        maxPricePerSqft: { $max: "$pricePerSqft" },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        segment: "$_id",
                        propertyCount: 1,
                        avgPricePerSqft: {
                          $cond: [{ $gt: ["$avgPricePerSqft", 0] }, "$avgPricePerSqft", 0],
                        },
                        minPricePerSqft: {
                          $cond: [{ $gt: ["$minPricePerSqft", 0] }, "$minPricePerSqft", 0],
                        },
                        maxPricePerSqft: {
                          $cond: [{ $gt: ["$maxPricePerSqft", 0] }, "$maxPricePerSqft", 0],
                        },
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  propertyCount: {
                    $ifNull: [{ $arrayElemAt: ["$counts.propertyCount", 0] }, 0],
                  },
                  avgPricePerSqft: {
                    $ifNull: [{ $arrayElemAt: ["$prices.avgPricePerSqft", 0] }, 0],
                  },
                  minPricePerSqft: {
                    $ifNull: [{ $arrayElemAt: ["$prices.minPricePerSqft", 0] }, 0],
                  },
                  maxPricePerSqft: {
                    $ifNull: [{ $arrayElemAt: ["$prices.maxPricePerSqft", 0] }, 0],
                  },
                  segmentStats: { $ifNull: ["$segmentStats", []] },
                },
              },
            ],
            as: "marketStats",
          },
        },
        {
          $addFields: {
            propertyCount: { $ifNull: [{ $arrayElemAt: ["$marketStats.propertyCount", 0] }, 0] },
            avgPricePerSqft: { $ifNull: [{ $arrayElemAt: ["$marketStats.avgPricePerSqft", 0] }, 0] },
            minPricePerSqft: { $ifNull: [{ $arrayElemAt: ["$marketStats.minPricePerSqft", 0] }, 0] },
            maxPricePerSqft: { $ifNull: [{ $arrayElemAt: ["$marketStats.maxPricePerSqft", 0] }, 0] },
          },
        },
        { $sort: { propertyCount: -1, _id: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            image: 1,
            propertyCount: 1,
            avgPricePerSqft: 1,
            minPricePerSqft: 1,
            maxPricePerSqft: 1,
            segmentStats: 1,
          },
        },
      ]),
      Area.countDocuments(areaMatch),
    ]);

    const areaIds = areasList.map((area) => area?._id).filter(Boolean);
    let marketSummary = null;
    if (areaIds.length) {
      const stats = await Property.aggregate([
        {
          $match: {
            "location.area": { $in: areaIds },
            "description.price": { $gt: 0 },
          },
        },
        {
          $project: {
            price: "$description.price",
            size: {
              $ifNull: [
                "$details.sizeInFt",
                {
                  $ifNull: [
                    "$details.sizeInSqFt",
                    { $ifNull: ["$details.totalAreaInSqFt", "$maxSize"] },
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            pricePerSqft: {
              $cond: [
                { $gt: ["$size", 0] },
                { $divide: ["$price", "$size"] },
                null,
              ],
            },
          },
        },
        { $match: { pricePerSqft: { $ne: null, $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgPricePerSqft: { $avg: "$pricePerSqft" },
            minPricePerSqft: { $min: "$pricePerSqft" },
            maxPricePerSqft: { $max: "$pricePerSqft" },
          },
        },
      ]);
      if (stats[0]) {
        marketSummary = {
          avgPricePerSqft: Number(stats[0].avgPricePerSqft || 0),
          minPricePerSqft: Number(stats[0].minPricePerSqft || 0),
          maxPricePerSqft: Number(stats[0].maxPricePerSqft || 0),
        };
      }
    }

    // Format areas for frontend
    const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
    const formattedAreas = areasList.map((area) => ({
      _id: area._id,
      name: area.name,
      slug: area.slug,
      propertyCount: Number(area.propertyCount || 0),
      avgPricePerSqft: Number(area.avgPricePerSqft || 0),
      minPricePerSqft: Number(area.minPricePerSqft || 0),
      maxPricePerSqft: Number(area.maxPricePerSqft || 0),
      segmentStats: Array.isArray(area.segmentStats) ? area.segmentStats : [],
      image: area.image
        ? area.image.startsWith("http")
          ? area.image
          : area.image.startsWith("/")
          ? `${baseUrl}${area.image}`
          : `${baseUrl}/${area.image}`
        : null,
    }));

    res.status(200).json({
      status: "success",
      message: "Trending areas fetched successfully",
      data: formattedAreas,
      count: formattedAreas.length,
      // cityDisplayName: city.name,
      timestamp: new Date().toISOString(),
      //  items: areasList,
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      marketSummary,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch trending areas",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// get area by slug
const getAreaBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Area slug is required",
      });
    }

    const area = await Area.findOne({
      slug: slug.toLowerCase().trim(),
      status: "active",
    })
      .select("name slug description listingPageCard _id categoryH1Title metaTitle metaDescription")
      .lean();

    if (!area) {
      return res.status(404).json({
        status: "error",
        message: "Area not found or inactive",
      });
    }

    res.json({
      status: "success",
      message: "Area fetched successfully",
      data: area,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch area",
    });
  }
});
module.exports = {
  getAllAreas,
  getAreasByCityId,
  getAreaById,
  getTrendingAreasByCityName,
  getTrendingAreasList,
  getAreaBySlug,
};


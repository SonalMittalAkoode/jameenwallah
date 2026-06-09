const mongoose = require("mongoose");
const Property = require("../../models/property");
const Category = require("../../models/category");
const Builder = require("../../models/builder");
const City = require("../../models/city");
const State = require("../../models/state");
const Area = require("../../models/area");
const PropertyType = require("../../models/propertyType");
const Agent = require("../../models/agent");
const asyncHandler = require("express-async-handler");

// compute size range from floor plans
function computeSizeRangeFromFloorPlans(floorPlans = []) {
  if (!Array.isArray(floorPlans) || floorPlans.length === 0) {
    return { minSize: null, maxSize: null, sizeRange: null };
  }
  const nums = floorPlans
    .map((fp) => {
      const v = fp?.superBuiltUpArea;
      if (v === null || v === undefined) return NaN;
      return Number(String(v).replace(/,/g, "").trim());
    })
    .filter((n) => !Number.isNaN(n) && Number.isFinite(n));
  if (nums.length === 0)
    return { minSize: null, maxSize: null, sizeRange: null };
  const minSize = Math.min(...nums);
  const maxSize = Math.max(...nums);
  const sizeRange =
    minSize === maxSize ? `${minSize}` : `${minSize} - ${maxSize}`;
  return { minSize, maxSize, sizeRange };
}

// compute price range from floor plans
function computePriceRangeFromFloorPlans(floorPlans = []) {
  if (!Array.isArray(floorPlans) || floorPlans.length === 0) {
    return { minPrice: null, maxPrice: null, priceRange: null };
  }
  const nums = floorPlans
    .map((fp) => {
      const v = fp?.price;
      if (v === null || v === undefined || v === "") return NaN;
      const cleanedPrice = String(v)
        .replace(/[₹$RsINRrupees]/gi, "")
        .replace(/,/g, "")
        .trim();
      const num = Number(cleanedPrice);
      return num;
    })
    .filter((n) => !Number.isNaN(n) && Number.isFinite(n) && n > 0);
  if (nums.length === 0)
    return { minPrice: null, maxPrice: null, priceRange: null };
  const minPrice = Math.min(...nums);
  const maxPrice = Math.max(...nums);
  return { minPrice, maxPrice };
}

// find document by name or ID
const findDoc = async (Model, value, statusField = "status") => {
  if (!value) return null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
  const query = isObjectId
    ? { _id: value }
    : { name: { $regex: new RegExp(`^${value}$`, "i") } };
  if (statusField) query[statusField] = "active";
  return await Model.findOne(query);
};

// build filter query
const buildFilterQuery = async (filters) => {
  const query = { status: "verified" };

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");

      const searchConditions = [
        { "description.title": regex },
        { "description.description": regex },
        { "location.address": regex },
        { "details.customId": regex },
      ];

      query.$or = searchConditions;
    }
  }

  if (filters.categoryId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(filters.categoryId);
    if (isObjectId) {
      const category = await Category.findOne({
        _id: filters.categoryId,
        status: "active",
      });
      if (category) {
        query["description.category"] = category._id;
      }
    }
  } else if (filters.category) {
    let category = null;

    category = await Category.findOne({
      slug: filters.category.toLowerCase().trim(),
      status: "active",
    });

    if (!category) {
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${filters.category}$`, "i") },
        status: "active",
      });
    }

    if (!category && filters.category.endsWith("s")) {
      const singularName = filters.category.slice(0, -1);
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${singularName}$`, "i") },
        status: "active",
      });
    } else if (!category && !filters.category.endsWith("s")) {
      const pluralName = filters.category + "s";
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${pluralName}$`, "i") },
        status: "active",
      });
    }

    if (category) {
      query["description.category"] = category._id;
    }
  }

  if (filters.propertyType) {
    const types = Array.isArray(filters.propertyType)
      ? filters.propertyType
      : filters.propertyType.split(",").map((t) => t.trim());

    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    const ids = types.filter((t) => objectIdPattern.test(t));
    const names = types.filter((t) => !objectIdPattern.test(t));

    const findQuery = { status: "active" };
    const orConditions = [];

    if (names.length > 0) {
      orConditions.push({
        name: { $in: names.map((n) => new RegExp(`^${n}$`, "i")) },
      });
    }
    if (ids.length > 0) {
      orConditions.push({ _id: { $in: ids } });
    }

    if (orConditions.length > 0) {
      findQuery.$or = orConditions;
      const propertyTypes = await PropertyType.find(findQuery);
      if (propertyTypes.length > 0) {
        query["description.propertyType"] = {
          $in: propertyTypes.map((pt) => pt._id),
        };
      }
    }
  }

  if (filters.city && filters.city !== "All Cities") {
    const city = await findDoc(City, filters.city);
    if (city) query["location.city"] = city._id;
  }

  if (filters.area) {
    const raw = String(filters.area).trim();
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (objectIdPattern.test(raw)) {
      const areaDoc = await Area.findOne({
        _id: raw,
        status: "active",
      })
        .select("_id")
        .lean();
      if (areaDoc) query["location.area"] = areaDoc._id;
    }
  }

  if (filters.state) query["location.state"] = filters.state;

  if (filters.priceCategory) {
    const prices = await Property.find({ status: "verified" })
      .select("description.price")
      .lean();
    const priceList = prices
      .map((p) => p.description?.price)
      .filter((price) => price != null && !isNaN(price))
      .sort((a, b) => a - b);

    if (priceList.length > 0) {
      const percentile = (arr, p) => {
        const index = Math.floor((p / 100) * arr.length);
        return arr[index];
      };

      const p20 = percentile(priceList, 20);
      const p60 = percentile(priceList, 60);
      const p85 = percentile(priceList, 85);
      const p95 = percentile(priceList, 95);

      const category = filters.priceCategory;
      switch (category) {
        case "budget":
          query["description.price"] = { $lte: p20 };
          break;
        case "mid-range":
          query["description.price"] = { $gt: p20, $lte: p60 };
          break;
        case "premium":
          query["description.price"] = { $gt: p60, $lte: p85 };
          break;
        case "luxury":
          query["description.price"] = { $gt: p85, $lte: p95 };
          break;
        case "ultra-luxury":
          query["description.price"] = { $gt: p95 };
          break;
      }
    }
  } else if (filters.minPrice || filters.maxPrice) {
    query["description.price"] = {};
    if (filters.minPrice)
      query["description.price"].$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice)
      query["description.price"].$lte = parseFloat(filters.maxPrice);
  }

  // bedrooms & bathrooms
  if (filters.minBedrooms !== undefined && filters.minBedrooms !== null) {
    const minBedrooms =
      typeof filters.minBedrooms === "number"
        ? filters.minBedrooms
        : parseInt(filters.minBedrooms);
    if (!isNaN(minBedrooms) && minBedrooms > 0) {
      query["details.bedrooms"] = { $gte: minBedrooms, $exists: true };
    }
  }
  if (filters.minBathrooms !== undefined && filters.minBathrooms !== null) {
    const minBathrooms =
      typeof filters.minBathrooms === "number"
        ? filters.minBathrooms
        : parseInt(filters.minBathrooms);
    if (!isNaN(minBathrooms) && minBathrooms > 0) {
      query["details.bathrooms"] = { $gte: minBathrooms, $exists: true };
    }
  }

  // size range
  if (filters.minSize !== undefined || filters.maxSize !== undefined) {
    const sizeQuery = { $exists: true };
    if (filters.minSize !== undefined && filters.minSize !== null) {
      const minSize =
        typeof filters.minSize === "number"
          ? filters.minSize
          : parseFloat(filters.minSize);
      if (!isNaN(minSize) && minSize > 0) {
        sizeQuery.$gte = minSize;
      }
    }
    if (filters.maxSize !== undefined && filters.maxSize !== null) {
      const maxSize =
        typeof filters.maxSize === "number"
          ? filters.maxSize
          : parseFloat(filters.maxSize);
      if (!isNaN(maxSize) && maxSize > 0) {
        sizeQuery.$lte = maxSize;
      }
    }
    if (sizeQuery.$gte !== undefined || sizeQuery.$lte !== undefined) {
      query["details.sizeInFt"] = sizeQuery;
    }
  }

  // year built range
  if (filters.minYearBuilt || filters.maxYearBuilt) {
    query["details.yearBuilt"] = {};
    if (filters.minYearBuilt)
      query["details.yearBuilt"].$gte = parseInt(filters.minYearBuilt);
    if (filters.maxYearBuilt)
      query["details.yearBuilt"].$lte = parseInt(filters.maxYearBuilt);
  }

  // assigned agent
  if (filters.assignedAgent) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(filters.assignedAgent);
    let agentId = null;

    if (isObjectId) {
      agentId = filters.assignedAgent;
    } else {
      try {
        const agent = await Agent.findOne({ slug: filters.assignedAgent });
        if (agent) {
          agentId = agent._id.toString();
        }
      } catch (error) {
        console.error("Error finding agent by slug:", error);
      }
    }

    if (agentId) {
      query.assignedAgent = { $in: [agentId] };
    }
  }

  // property status
  if (filters.propertyStatus && filters.propertyStatus !== "All") {
    query["details.propertyStatus"] = filters.propertyStatus;
  }

  // furnishing status
  if (filters.furnishingStatus && filters.furnishingStatus !== "All") {
    query["details.furnishingStatus"] = filters.furnishingStatus;
  }

  // ownership type
  if (filters.ownershipType && filters.ownershipType !== "All") {
    query["details.ownershipType"] = filters.ownershipType;
  }

  // shell status
  if (filters.shellStatus && filters.shellStatus !== "All") {
    query["details.shellStatus"] = filters.shellStatus;
  }

  // facing
  if (filters.facing && filters.facing !== "All") {
    query["details.facing"] = filters.facing;
  }

  // plot size range
  if (filters.minPlotSize !== undefined || filters.maxPlotSize !== undefined) {
    const plotSizeQuery = { $exists: true };
    if (filters.minPlotSize !== undefined && filters.minPlotSize !== null) {
      const minPlotSize =
        typeof filters.minPlotSize === "number"
          ? filters.minPlotSize
          : parseFloat(filters.minPlotSize);
      if (!isNaN(minPlotSize) && minPlotSize > 0) {
        plotSizeQuery.$gte = minPlotSize;
      }
    }
    if (filters.maxPlotSize !== undefined && filters.maxPlotSize !== null) {
      const maxPlotSize =
        typeof filters.maxPlotSize === "number"
          ? filters.maxPlotSize
          : parseFloat(filters.maxPlotSize);
      if (!isNaN(maxPlotSize) && maxPlotSize > 0) {
        plotSizeQuery.$lte = maxPlotSize;
      }
    }
    if (plotSizeQuery.$gte !== undefined || plotSizeQuery.$lte !== undefined) {
      query["details.plotSize"] = plotSizeQuery;
    }
  }

  // total area range
  if (
    filters.minTotalArea !== undefined ||
    filters.maxTotalArea !== undefined
  ) {
    const totalAreaQuery = { $exists: true };
    if (filters.minTotalArea !== undefined && filters.minTotalArea !== null) {
      const minTotalArea =
        typeof filters.minTotalArea === "number"
          ? filters.minTotalArea
          : parseFloat(filters.minTotalArea);
      if (!isNaN(minTotalArea) && minTotalArea > 0) {
        totalAreaQuery.$gte = minTotalArea;
      }
    }
    if (filters.maxTotalArea !== undefined && filters.maxTotalArea !== null) {
      const maxTotalArea =
        typeof filters.maxTotalArea === "number"
          ? filters.maxTotalArea
          : parseFloat(filters.maxTotalArea);
      if (!isNaN(maxTotalArea) && maxTotalArea > 0) {
        totalAreaQuery.$lte = maxTotalArea;
      }
    }
    if (
      totalAreaQuery.$gte !== undefined ||
      totalAreaQuery.$lte !== undefined
    ) {
      query["details.totalAreaInSqFt"] = totalAreaQuery;
    }
  }

  // building status
  if (filters.buildingStatus && filters.buildingStatus !== "All") {
    query["details.buildingStatus"] = filters.buildingStatus;
  }

  return query;
};

// get sort options
const getSortOptions = (sort) => {
  const sortMap = {
    price: { "description.price": 1 },
    "-price": { "description.price": -1 },
    newest: { createdAt: -1 },
    "-createdAt": { createdAt: -1 },
    oldest: { createdAt: 1 },
    createdAt: { createdAt: 1 },
  };
  return sortMap[sort] || { createdAt: -1 };
};

const sourceCopyPattern = /(leasing\.net(\.in)?|BigCat Realty|BigCat|Imported from)/i;

const cleanPublicCopy = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/Imported from leasing\.net\.in/gi, "JameenWallah")
    .replace(/leasing\.net\.in/gi, "JameenWallah")
    .replace(/leasing\.net/gi, "JameenWallah")
    .replace(/BigCat Realty/gi, "JameenWallah")
    .replace(/BigCat/gi, "JameenWallah")
    .replace(/\s+property listings imported from JameenWallah for JameenWallah review\.?/gi, "")
    .replace(/\s+listings imported from JameenWallah for JameenWallah review\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const googlePhotoPattern = /^https?:\/\/lh3\.googleusercontent\.com\//i;

const imageTrustStopWords = new Set(
  [
    "the",
    "and",
    "for",
    "with",
    "from",
    "pvt",
    "ltd",
    "private",
    "limited",
    "group",
    "company",
    "companies",
    "independent",
    "commercial",
    "office",
    "space",
    "retail",
    "shop",
    "showroom",
    "restaurant",
    "bank",
    "apartment",
    "apartments",
    "builder",
    "floor",
    "floors",
    "villa",
    "villas",
    "plot",
    "sco",
    "sector",
    "gurgaon",
    "gurugram",
    "delhi",
    "noida",
    "south",
    "north",
    "west",
    "east",
    "road",
    "golf",
    "course",
    "extension",
    "sohna",
    "phase",
    "mg",
    "nh",
    "bhk",
  ].filter(Boolean)
);

const normalizeImageTrustText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getImageTrustTokens = (value) =>
  normalizeImageTrustText(value)
    .split(/\s+/)
    .map((token) => {
      if (token === "farmhouse") return "farm";
      if (token === "coworking") return "working";
      return token;
    })
    .filter((token) => token.length > 2 && !imageTrustStopWords.has(token));

const getNamedListingTokens = (property) => {
  const titleTokens = getImageTrustTokens(property?.description?.title);
  const builder = property?.description?.builder;
  const builderTokens = getImageTrustTokens(
    typeof builder === "object" ? builder?.title || builder?.name : builder
  );

  return Array.from(new Set([...titleTokens, ...builderTokens]));
};

const hasNamedGooglePlaceMismatch = (property) => {
  const googlePlaceName = property?.externalSource?.googleMapsPlaceName;
  if (!googlePlaceName) return false;

  const namedTokens = getNamedListingTokens(property);
  if (!namedTokens.length) return false;

  const googleContext = new Set(
    getImageTrustTokens(
      [
        googlePlaceName,
        property?.externalSource?.googleMapsPlaceAddress,
        property?.location?.address,
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  return namedTokens.every((token) => !googleContext.has(token));
};

const sanitizePublicMedia = (media, property) => {
  if (!media || typeof media !== "object") return media;

  const images = Array.isArray(media.images) ? media.images : [];
  const shouldSuppressGoogleImages = hasNamedGooglePlaceMismatch(property);

  if (!shouldSuppressGoogleImages) return media;

  const trustedImages = images.filter(
    (image) => !googlePhotoPattern.test(String(image || "").trim())
  );

  if (!trustedImages.length && images.length) {
    return {
      ...media,
      imageAccuracyWarning:
        "Google gallery needs admin review; no safer replacement gallery is available yet.",
      imageReviewRecommended: true,
    };
  }

  return {
    ...media,
    images: trustedImages,
  };
};

const sanitizePublicBuilder = (builder) => {
  if (!builder || typeof builder !== "object") return builder;
  return {
    ...builder,
    description: sourceCopyPattern.test(builder.description || "")
      ? cleanPublicCopy(builder.description)
      : builder.description,
  };
};

const sanitizePublicAgent = (agent) => {
  if (!agent || typeof agent !== "object") return agent;
  const email = sourceCopyPattern.test(agent.email || "")
    ? "support@jameenwallah.com"
    : agent.email;
  return { ...agent, email };
};

const sanitizePublicProperty = (property) => {
  if (!property || typeof property !== "object") return property;
  const { externalSource, personalDetails, ...rest } = property;
  return {
    ...rest,
    media: sanitizePublicMedia(rest.media, property),
    description: {
      ...rest.description,
      metaTitle: cleanPublicCopy(rest.description?.metaTitle),
      metaDescription: cleanPublicCopy(rest.description?.metaDescription),
      description: cleanPublicCopy(rest.description?.description),
      builder: sanitizePublicBuilder(rest.description?.builder),
    },
    assignedAgent: Array.isArray(rest.assignedAgent)
      ? rest.assignedAgent.map(sanitizePublicAgent)
      : sanitizePublicAgent(rest.assignedAgent),
  };
};

// get properties by category
const getPropertiesByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;
  const limit = parseInt(req.query.limit) || 8;

  let category = null;

  category = await Category.findOne({
    slug: categoryName.toLowerCase().trim(),
    status: "active",
  });

  if (!category) {
    category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, "i") },
      status: "active",
    });
  }

  if (!category && categoryName.endsWith("s")) {
    const singularName = categoryName.slice(0, -1);
    category = await Category.findOne({
      name: { $regex: new RegExp(`^${singularName}$`, "i") },
      status: "active",
    });
  } else if (!category && !categoryName.endsWith("s")) {
    const pluralName = categoryName + "s";
    category = await Category.findOne({
      name: { $regex: new RegExp(`^${pluralName}$`, "i") },
      status: "active",
    });
  }

  if (!category) {
    return res.status(404).json({
      status: "error",
      message: `Category '${categoryName}' not found or inactive`,
    });
  }

  // use category id to filter properties
  const properties = await Property.find({
    "description.category": category._id,
    status: "verified",
  })
    .populate("description.category", "name")
    .populate("description.propertyType", "name")
    .populate("location.city", "name")
    .populate("location.state", "name")
    .populate("location.area", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // compute price range and size range for each property
  const enhancedProperties = properties.map((property) => {
    const { minPrice, maxPrice } = computePriceRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    return sanitizePublicProperty({
      ...property,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      sizeRange,
    });
  });

  res.json({
    status: "success",
    message: `Properties for ${category.name} fetched successfully`,
    data: enhancedProperties,
    count: enhancedProperties.length,
  });
});

// get properties by builder
const getPropertiesByBuilder = asyncHandler(async (req, res) => {
  const { builderId } = req.params;
  const builder = /^[0-9a-fA-F]{24}$/.test(builderId)
    ? await Builder.findById(builderId)
    : await Builder.findOne({ slug: builderId });

  if (!builder) {
    return res
      .status(404)
      .json({ status: "error", message: "Builder not found" });
  }

  const properties = await Property.find({
    "description.builder": builder._id,
    status: "verified",
  })
    .populate("description.category", "name")
    .populate("description.propertyType", "name")
    .populate("location.city", "name")
    .populate("location.state", "name")
    .sort({ createdAt: -1 })
    .lean();

  const enhancedProperties = properties.map((property) => {
    const { minPrice, maxPrice } = computePriceRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    return sanitizePublicProperty({
      ...property,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      sizeRange,
    });
  });

  res.json({
    status: "success",
    message: "Properties fetched successfully",
    data: enhancedProperties,
  });
});

// get properties with filters
const getPropertiesWithFilters = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const filters = {
    search: req.query.search,
    categoryId: req.query.categoryId,
    category: req.query.category,
    propertyType: req.query.propertyType,
    city: req.query.city,
    area: req.query.area,
    state: req.query.state,
    priceCategory: req.query.priceCategory,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    minBedrooms: req.query.minBedrooms
      ? parseInt(req.query.minBedrooms)
      : undefined,
    minBathrooms: req.query.minBathrooms
      ? parseInt(req.query.minBathrooms)
      : undefined,
    minSize: req.query.minSize ? parseFloat(req.query.minSize) : undefined,
    maxSize: req.query.maxSize ? parseFloat(req.query.maxSize) : undefined,
    minYearBuilt: req.query.minYearBuilt
      ? parseInt(req.query.minYearBuilt)
      : undefined,
    maxYearBuilt: req.query.maxYearBuilt
      ? parseInt(req.query.maxYearBuilt)
      : undefined,
    assignedAgent: req.query.assignedAgent,
    propertyStatus: req.query.propertyStatus,
    furnishingStatus: req.query.furnishingStatus,
    ownershipType: req.query.ownershipType,
    shellStatus: req.query.shellStatus,
    facing: req.query.facing,
    minPlotSize: req.query.minPlotSize
      ? parseFloat(req.query.minPlotSize)
      : undefined,
    maxPlotSize: req.query.maxPlotSize
      ? parseFloat(req.query.maxPlotSize)
      : undefined,
    minTotalArea: req.query.minTotalArea
      ? parseFloat(req.query.minTotalArea)
      : undefined,
    maxTotalArea: req.query.maxTotalArea
      ? parseFloat(req.query.maxTotalArea)
      : undefined,
    buildingStatus: req.query.buildingStatus,
  };

  const query = await buildFilterQuery(filters);
  const sort = getSortOptions(req.query.sort || "-createdAt");

  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    const regex = new RegExp(searchTerm, "i");

    const matchingCities = await City.find({
      name: regex,
      status: "active",
    })
      .select("_id")
      .lean();
    const matchingStates = await State.find({
      name: regex,
      status: "active",
    })
      .select("_id")
      .lean();
    const matchingAreas = await Area.find({
      name: regex,
      status: "active",
    })
      .select("_id")
      .lean();

    if (matchingCities.length > 0 || matchingStates.length > 0 || matchingAreas.length > 0) {
      const cityIds = matchingCities.map((c) => c._id);
      const stateIds = matchingStates.map((s) => s._id);
      const areaIds = matchingAreas.map((l) => l._id);


      if (query.$or) {
        if (cityIds.length > 0) {
          query.$or.push({ "location.city": { $in: cityIds } });
        }
        if (stateIds.length > 0) {
          query.$or.push({ "location.state": { $in: stateIds } });
        }
        if (areaIds.length > 0) {
          query.$or.push({ "location.area": { $in: areaIds } });
        }
      } else {
        const orConditions = [];
        if (cityIds.length > 0) {
          orConditions.push({ "location.city": { $in: cityIds } });
        }
        if (stateIds.length > 0) {
          orConditions.push({ "location.state": { $in: stateIds } });
        }
         if (areaIds.length > 0) {
          orConditions.push({ "location.area": { $in: areaIds } });
        }
        if (orConditions.length > 0) {
          query.$or = orConditions;
        }
      }
    }
  }

  const sortParam = req.query.sort || "-createdAt";
  const isPriceSort = sortParam === "price" || sortParam === "-price";

  let properties;
  let total = await Property.countDocuments(query);

  if (isPriceSort) {
    const priceDir = sortParam === "price" ? 1 : -1;

    // Many listings don't have description.price but do have floorPlan prices.
    // For Price Low/High we sort by a computed numeric "sortPrice":
    // - prefer description.price if it's a positive number
    // - else use minimum numeric floor plan price (if any)
    // Exclude properties that have neither (these are "Price on request").

    const extractNumeric = (value) => {
      if (value === null || value === undefined) return null;
      if (typeof value === "number") {
        return Number.isFinite(value) && value > 0 ? value : null;
      }
      const str = String(value).trim();
      if (!str) return null;
      const cleaned = str.replace(/[^0-9.]/g, "");
      if (!cleaned) return null;
      const num = Number(cleaned);
      return Number.isFinite(num) && num > 0 ? num : null;
    };

    const candidates = await Property.find(query)
      .select("_id description.price description.floorPlans.price")
      .lean();

    const sortable = (candidates || [])
      .map((p) => {
        const direct = extractNumeric(p?.description?.price);
        if (direct) return { id: p._id, sortPrice: direct };

        const floorPlans = Array.isArray(p?.description?.floorPlans)
          ? p.description.floorPlans
          : [];
        let minFp = null;
        for (const fp of floorPlans) {
          const v = extractNumeric(fp?.price);
          if (!v) continue;
          if (minFp === null || v < minFp) minFp = v;
        }
        if (minFp) return { id: p._id, sortPrice: minFp };

        return null;
      })
      .filter(Boolean);

    sortable.sort((a, b) =>
      priceDir === 1 ? a.sortPrice - b.sortPrice : b.sortPrice - a.sortPrice
    );

    total = sortable.length;

    const pageIds = sortable
      .slice((page - 1) * limit, (page - 1) * limit + limit)
      .map((x) => x.id);

    if (!pageIds.length) {
      properties = [];
    } else {
      const docs = await Property.find({ _id: { $in: pageIds } })
        .populate("description.category", "name")
        .populate("description.propertyType", "name")
        .populate("description.builder", "title slug description image")
        .populate("location.city", "name")
        .populate("location.state", "name")
        .populate("location.area", "name")
        .populate("assignedAgent", "name email phoneNumber slug image")
        .populate("amenities", "title")
        .lean();

      const orderMap = new Map(pageIds.map((id, i) => [id.toString(), i]));
      docs.sort(
        (a, b) =>
          (orderMap.get(a._id.toString()) ?? 0) -
          (orderMap.get(b._id.toString()) ?? 0)
      );
      properties = docs;
    }
  } else {
    properties = await Property.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug description image")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber slug image")
      .populate("amenities", "title")
      .lean();
  }

  const enhancedProperties = properties.map((property) => {
    const { minPrice, maxPrice } = computePriceRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      property?.description?.floorPlans
    );
    return sanitizePublicProperty({
      ...property,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      sizeRange,
    });
  });

  res.json({
    status: "success",
    message: "Properties fetched successfully",
    data: enhancedProperties,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  });
});

// get single property by id for frontend
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findOne({
    "description.slug": id,
    status: "verified",
  })
    .populate("description.category", "name slug")
    .populate("description.propertyType", "name")
    .populate("description.builder", "title slug description image experience projectsCompleted ongoingProjects")
    .populate("location.city", "name")
    .populate("location.state", "name")
    .populate("location.area", "name")
    .populate("amenities", "title")
    .populate("assignedAgent", "name email phoneNumber slug image")
    .populate("faqs")
    .lean();

  if (!property) {
    return res.status(404).json({
      status: "error",
      message: "Property not found",
    });
  }

  const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
    property?.description?.floorPlans
  );

  const { minPrice, maxPrice } = computePriceRangeFromFloorPlans(
    property?.description?.floorPlans
  );

  const enhancedProperty = sanitizePublicProperty({
    ...property,
    minSize,
    maxSize,
    sizeRange,
    minPrice,
    maxPrice,
  });

  res.status(200).json({
    status: "success",
    message: "Property fetched successfully",
    data: enhancedProperty,
  });
});

// get all featured properties
const getFeaturedProperties = asyncHandler(async (req, res) => {
    let limit = 100;
    let page = 1;


    if (req.query.limit) {
      limit = req.query.limit;
      page = req.query.page;
    }
     const [propertyList, totalCount] = await Promise.all([
      Property.find({
          "description.featuredProperty": "Yes",
          status: "verified",
        })
       .populate("description.category", "name slug")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.area", "name")
      .populate("amenities", "title")
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Property.countDocuments({
        "description.featuredProperty": "Yes",
        status: "verified",
      }) // total matching without skip/limit
    ]);
    // propertyList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // console.log(propertyList)
    res.status(200).json({
      items: propertyList.map(sanitizePublicProperty),
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  // const properties = await Property.find({
  //   "description.featuredProperty": "Yes",
  //   status: "verified",
  // })
  //   .populate("description.category", "name slug")
  //   .populate("description.propertyType", "name")
  //   .populate("description.builder", "title slug")
  //   .populate("location.city", "name")
  //   .populate("location.state", "name")
  //   .populate("location.area", "name")
  //   .populate("amenities", "title")
  //   .sort({ createdAt: -1 })
  //   .lean();

  // const enhancedProperties = properties.map((property) => {
  //   const { minPrice, maxPrice } = computePriceRangeFromFloorPlans(
  //     property?.description?.floorPlans
  //   );
  //   const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
  //     property?.description?.floorPlans
  //   );
  //   return {
  //     ...property,
  //     minPrice,
  //     maxPrice,
  //     minSize,
  //     maxSize,
  //     sizeRange,
  //   };
  // });

  // res.json({
  //   status: "success",
  //   message: "Featured properties fetched successfully",
  //   data: enhancedProperties,
  // });
});

// get all properties
const getAllProperties = asyncHandler(async (req, res) => {
  try {
    let limit = 100;
    let page = 1;


    if (req.query.limit) {
      limit = req.query.limit;
      page = req.query.page;
    }
     const [propertyList, totalCount] = await Promise.all([
      Property.find({ status: "verified" })
       .populate("amenities", " title")
      .populate("description.propertyType", " name")
      .populate("description.category", " name")
      .populate("location.city", " name")
      .populate("location.state", " name")
      .populate("location.area", " name")
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Property.countDocuments({ status: "verified" }) // total matching without skip/limit
    ]);
    // propertyList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // console.log(propertyList)
    res.status(200).json({
      items: propertyList.map(sanitizePublicProperty),
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
    // const properties = await Property.find({ status: "verified" })
    //   .populate("amenities", " title")
    //   .populate("description.propertyType", " name")
    //   .populate("description.category", " name")
    //   .populate("location.city", " name")
    //   .populate("location.state", " name")
    //   .populate("location.area", " name")
  
    // if (!properties || properties.length === 0) {
    //   return res.status(404).json({
    //     status: "error",
    //     message: "No properties found",
    //   });
    // }
    // res.status(200).json({
    //   status: "success",
    //   message: "All properties fetched successfully",
    //   data: properties,
    // });
  } catch (err) {
    console.error("Error fetching all properties:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching properties",
    });
  }
});
const propertyListTrends = asyncHandler(async (req, res) => {
  try {
    console.log("Received request for propertyListTrends with query:", req.query);
    let query = {
       status: "verified",
      // admin_approve: true,
    };
    
    if (req.query.propertytypeid) {
      
      query["description.propertyType"] = new mongoose.Types.ObjectId(
        req.query.propertytypeid
      );
    }

    if (req.query.categoriesid) {
      query["description.category"] = new mongoose.Types.ObjectId(
        req.query.categoriesid
      );
    }
    const categoryId = req.query.categoriesid
  ? new mongoose.Types.ObjectId(req.query.categoriesid)
  : null;

const propertyTypeId = req.query.propertytypeid
  ? new mongoose.Types.ObjectId(req.query.propertytypeid)
  : null;
    console.log("propertyListTrends query:", query);
    const matchCount = await Property.countDocuments(query);
    console.log("propertyListTrends match count:", matchCount);

    const result = await Property.aggregate([
      { $match: query },
      { $addFields: { priceNumeric: { $toDouble: "$description.price" } } },
      {
        $group: {
          _id: "$location.area",
          propertyCount: { $sum: 1 },
          avgPrice: { $avg: "$priceNumeric" },
          minPrice: { $min: "$priceNumeric" },
          maxPrice: { $max: "$priceNumeric" },
          categoryIds: { $first: categoryId },
          propertyTypeIds: { $first: propertyTypeId },
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "_id",
          foreignField: "_id",
          as: "areaDetails",
        },
      },
      { $unwind: { path: "$areaDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          areaId: "$_id",
          areaTitle: { $ifNull: ["$areaDetails.name", "Unknown Area"] },
          // areaSlug: { $ifNull: ["$areaDetails.slug", "unknown-area"] },
          propertyCount: 1,
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          categoryIds: 1,
          propertyTypeIds: 1,
        },
      },
    ]);

    const totalStats = await Property.aggregate([
      { $match: query },
      { $addFields: { priceNumeric: { $toDouble: "$description.price" } } },
      {
        $group: {
          _id: null,
          totalAverage: { $avg: "$priceNumeric" },
          minPrice: { $min: "$priceNumeric" },
          maxPrice: { $max: "$priceNumeric" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAverage: 1,
          totalRange: {
            $cond: [
              { $and: [{ $ifNull: ["$minPrice", false] }, { $ifNull: ["$maxPrice", false] }] },
              { $concat: [ { $toString: "$minPrice" }, " - ", { $toString: "$maxPrice" } ] },
              null,
            ],
          },
           minPrice: { $toString: "$minPrice" },
            maxPrice: { $toString: "$maxPrice" },
        },
      },
    ]);

    const totals = totalStats[0] || { totalAverage: null, totalRange: null };
    const message = {
      status: "success",
      message: "Data fetched successfully",
      data: result,
      meta: {
        matchedProperties: matchCount,
        totalAverage: totals.totalAverage,
        totalRange: totals.totalRange,
        totalminPrice: totals.minPrice ? String(totals.minPrice) : null,
        totalmaxPrice: totals.maxPrice ? String(totals.maxPrice) : null,
      },
    };
    res.json(message);
    // return result;
    
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getPropertiesByCategory,
  getPropertiesByBuilder,
  getPropertiesWithFilters,
  getPropertyById,
  getFeaturedProperties,
  getAllProperties,
  propertyListTrends,
};

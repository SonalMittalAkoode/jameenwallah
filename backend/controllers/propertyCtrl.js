const asyncHandler = require("express-async-handler");
const Property = require("../models/property");
const User = require("../models/user");
const Agent = require("../models/agent");
const fs = require("fs");
const path = require("path");
const City = require("../models/city");
const State = require("../models/state");
const Area = require("../models/area");
const mongoose = require("mongoose");

// build full address
async function buildFullAddress(location = {}) {
  if (!location) return "";

  const parts = [];

  if (location.address) parts.push(location.address);

  const resolveName = async (val, Model) => {
    if (!val) return null;
    if (mongoose.isValidObjectId(val)) {
      try {
        const doc = await Model.findById(val).select("name title").lean();
        if (!doc) return null;
        return doc.name || doc.title || null;
      } catch (e) {
        return null;
      }
    }
    return String(val).trim();
  };

  const areaName = await resolveName(location.area, Area);
  const cityName = await resolveName(location.city, City);
  const stateName = await resolveName(location.state, State);

  if (areaName) parts.push(areaName);
  if (cityName) parts.push(cityName);
  if (stateName) parts.push(stateName);
  if (location.zip) parts.push(location.zip);

  return parts.filter(Boolean).join(", ");
}

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

const DETAIL_ENUM_NORMALIZERS = {
  parking: {
    allowed: new Set([
      "Open",
      "Covered",
      "Reserved",
      "Visitor",
      "Basement",
      "Street",
      "Truck",
      "Not Available",
    ]),
  },
  basement: {
    allowed: new Set(["No", "Single", "Double", "Triple", "Parking", "Service"]),
  },
  facing: {
    allowed: new Set([
      "north",
      "south",
      "east",
      "west",
      "north-east",
      "north-west",
      "south-east",
      "south-west",
    ]),
  },
  ownershipType: {
    allowed: new Set([
      "Freehold",
      "Leasehold",
      "Co-operative",
      "Share of Freehold",
      "Government Lease",
      "Pending",
    ]),
  },
  furnishingStatus: {
    allowed: new Set(["Furnished", "Semi-Furnished", "Unfurnished"]),
    aliases: {
      "semi furnished": "Semi-Furnished",
      semifurnished: "Semi-Furnished",
      furnished: "Furnished",
      unfurnished: "Unfurnished",
    },
  },
  propertyStatus: {
    allowed: new Set([
      "Ready to Move",
      "Under Construction",
      "Completed",
      "New Launch",
      "Delayed",
    ]),
    aliases: {
      "ready to sell": "Ready to Move",
      "ready for sale": "Ready to Move",
      ready: "Ready to Move",
      completed: "Completed",
      "under construction": "Under Construction",
      "new launch": "New Launch",
      delayed: "Delayed",
    },
  },
};

function normalizePropertyDetailEnums(details) {
  if (!details || typeof details !== "object") return details;

  Object.entries(DETAIL_ENUM_NORMALIZERS).forEach(([key, config]) => {
    if (!Object.prototype.hasOwnProperty.call(details, key)) return;

    const rawValue = details[key];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      delete details[key];
      return;
    }

    const normalizedText = String(rawValue).trim();
    const alias = config.aliases?.[normalizedText.toLowerCase()];
    const nextValue = alias || normalizedText;

    if (config.allowed.has(nextValue)) {
      details[key] = nextValue;
      return;
    }

    delete details[key];
  });

  return details;
}

// delete file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, "../public", filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

// generate custom id
const generateCustomId = (categoryLabel = "") => {
  const initial = (categoryLabel || "").trim().charAt(0).toUpperCase() || "X";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PROP-${initial}${suffix}`;
};

// parse id array
const parseIdArray = (value) => {
  if (!value) return [];
  const normalizeEntry = (entry) => {
    if (entry === null || entry === undefined) return [];
    if (Array.isArray(entry)) {
      return entry.flatMap(normalizeEntry);
    }
    const trimmed = String(entry).trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.flatMap(normalizeEntry);
      }
    } catch (error) {
      // Fall back to comma-separated parsing below.
    }
    return trimmed
      .split(",")
      .map((item) =>
        item
          .replace(/^[\s\[\]'"]+/, "")
          .replace(/[\s\[\]'"]+$/, "")
          .trim()
      )
      .filter(Boolean);
  };

  if (Array.isArray(value)) {
    return [...new Set(value.flatMap(normalizeEntry))];
  }
  if (typeof value === "string") {
    return [...new Set(normalizeEntry(value))];
  }
  return [];
};

// extract category label
const extractCategoryLabel = (body) => {
  if (!body || typeof body !== "object") return "";

  const candidates = [
    body?.description?.categoryLabel,
    body?.description?.categoryName,
    body?.description?.category,
    body["description[categoryLabel]"],
    body["description[categoryName]"],
    body["description[category]"],
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (typeof candidate === "object" && candidate !== null) {
      const label = candidate.name || candidate.label || candidate.title || "";
      if (typeof label === "string" && label.trim()) {
        return label.trim();
      }
    }
  }

  return "";
};

// generate slug from title
const generateSlug = (title) => {
  if (!title || typeof title !== "string") return "";

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ensure custom id on body
const ensureCustomIdOnBody = (body) => {
  if (!body || typeof body !== "object") return;

  const detailsKey = "details[customId]";
  const existingFromKey =
    typeof body[detailsKey] === "string" && body[detailsKey].trim()
      ? body[detailsKey].trim()
      : null;

  if (!body.details || typeof body.details !== "object") {
    body.details = {};
  }

  const existing =
    (body.details.customId && String(body.details.customId).trim()) ||
    existingFromKey;

  if (existing) {
    const normalized = String(existing).trim();
    body.details.customId = normalized;
    if (!existingFromKey) {
      body[detailsKey] = normalized;
    }
    return;
  }

  const categoryLabel = extractCategoryLabel(body);
  const newId = generateCustomId(categoryLabel);
  body.details.customId = newId;
  body[detailsKey] = newId;
};

// get uploaded floor plan paths
const getUploadedFloorPlanPaths = (req) => {
  if (!req.files?.floorPlanImages) return [];
  return req.files.floorPlanImages.map((file) => `/images/${file.filename}`);
};

// normalize floor plans from request
const normalizeFloorPlansFromRequest = (rawValue, uploadedPaths = []) => {
  let floorPlans = [];
  if (Array.isArray(rawValue)) {
    floorPlans = rawValue;
  } else if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) floorPlans = parsed;
    } catch (error) {
      console.error(error);
    }
  }

  let pathIndex = 0;

  return floorPlans
    .map((plan) => {
      if (!plan || typeof plan !== "object") return null;
      const cleaned = {
        unitType: plan.unitType ? String(plan.unitType).trim() : "",
        carpetArea: plan.carpetArea ? String(plan.carpetArea).trim() : "",
        builtUpArea: plan.builtUpArea ? String(plan.builtUpArea).trim() : "",
        superBuiltUpArea: plan.superBuiltUpArea
          ? Number(plan.superBuiltUpArea)
          : null,
        price: plan.price ? String(plan.price).trim() : "",
      };

      const existingImage =
        typeof plan.image === "string" && plan.image.trim()
          ? plan.image.trim()
          : "";

      if (existingImage) {
        cleaned.image = existingImage;
      } else if (plan.hasFile && pathIndex < uploadedPaths.length) {
        cleaned.image = uploadedPaths[pathIndex];
        pathIndex += 1;
      }

      return cleaned;
    })
    .filter(
      (plan) =>
        plan &&
        (plan.unitType ||
          plan.carpetArea ||
          plan.builtUpArea ||
          plan.superBuiltUpArea ||
          plan.price ||
          plan.image)
    );
};

// create property
const createProperty = asyncHandler(async (req, res) => {
  try {
    // Validate personal details
    if (req.body.personalDetails) {
      const { name, email, phoneNumber } = req.body.personalDetails;
      
      if (!name || !name.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Name is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!email || !email.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          status: "error",
          message: "Please enter a valid email address",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Phone number is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Validate phone number - must contain only digits
      const cleanedPhone = phoneNumber.trim().replace(/[\s\-\(\)\+]/g, "");
      
      if (!/^\d+$/.test(cleanedPhone)) {
        return res.status(400).json({
          status: "error",
          message: "Phone number should contain only numbers",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (cleanedPhone.length < 10) {
        return res.status(400).json({
          status: "error",
          message: "Phone number should be at least 10 digits",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (cleanedPhone.length > 15) {
        return res.status(400).json({
          status: "error",
          message: "Phone number is too long (maximum 15 digits)",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Indian phone number validation (10 digits starting with 6-9)
      if (cleanedPhone.length === 10 && !/^[6-9]\d{9}$/.test(cleanedPhone)) {
        return res.status(400).json({
          status: "error",
          message: "Phone number should start with 6, 7, 8, or 9",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate location fields
    if (req.body.location) {
      const { address, state, city, zip } = req.body.location;
      
      if (!address || !address.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Address is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!state || !state.trim()) {
        return res.status(400).json({
          status: "error",
          message: "State is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!city || !city.trim()) {
        return res.status(400).json({
          status: "error",
          message: "City is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!zip || !zip.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Zip code is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate description fields
    if (req.body.description) {
      const { title, description, category, propertyType, price, paymentPlan } = req.body.description;
      
      if (!title || !title.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Title is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!description || !description.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Description is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!category || !category.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Category is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!propertyType || !propertyType.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Property type is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!price || price === "" || price === null || price === undefined) {
        return res.status(400).json({
          status: "error",
          message: "Price is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!paymentPlan || !paymentPlan.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Payment plan is required",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      
      // RERA number is required only if RERA approved is "Yes"
      if (req.body.description.reraApproved === "Yes") {
        if (!req.body.description.reraNumber || !req.body.description.reraNumber.trim()) {
          return res.status(400).json({
            status: "error",
            message: "RERA number is required when RERA approved is Yes",
            code: 400,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    if (req.files) {
      req.body.media = req.body.media || {};

      if (req.files.images) {
        req.body.media.images = req.files.images.map(
          (file) => `/images/${file.filename}`
        );
      }

      if (req.files.virtualTour && req.files.virtualTour[0]) {
        req.body.media.virtualTour = `/images/${req.files.virtualTour[0].filename}`;
      }

      if (req.files.sitePlanImage && req.files.sitePlanImage[0]) {
        req.body.media.sitePlanImage = `/images/${req.files.sitePlanImage[0].filename}`;
      }

      if (req.files.masterPlanImage && req.files.masterPlanImage[0]) {
        req.body.media.masterPlanImage = `/images/${req.files.masterPlanImage[0].filename}`;
      }

      if (req.files.floorPlanImages && req.files.floorPlanImages.length > 0) {
        req.body.media.floorPlanImages = req.files.floorPlanImages.map(
          (file) => `/images/${file.filename}`
        );
      }
    }

    // Validate media - at least one image is required
    // Check both uploaded files and existing images in body
    const hasImagesFromFiles = req.files?.images && req.files.images.length > 0;
    const hasImagesFromBody = req.body.media?.images && Array.isArray(req.body.media.images) && req.body.media.images.length > 0;
    
    if (!hasImagesFromFiles && !hasImagesFromBody) {
      return res.status(400).json({
        status: "error",
        message: "At least one property photo is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate amenities - at least one amenity is required
    const amenities = parseIdArray(req.body.amenities);
    if (!amenities || amenities.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one amenity must be selected",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    req.body.status = "pending";
    ensureCustomIdOnBody(req.body);
    req.body.amenities = [...new Set(amenities)];

    if (req.body.location && typeof req.body.location === "object") {
      if (!req.body.location) req.body.location = {};

      const fullAddress = await buildFullAddress(req.body.location);

      if (fullAddress) {
        req.body.location.fullAddress = fullAddress;
      }
    }

    if (!req.body.description || typeof req.body.description !== "object") {
      req.body.description = {};
    }

    req.body.media = req.body.media || {};
    const floorPlanImages = req.body.media.floorPlanImages || [];
    req.body.description.floorPlans = normalizeFloorPlansFromRequest(
      req.body.description.floorPlans,
      floorPlanImages
    );

    const property = await Property.create(req.body);

    const populatedProperty = await Property.findById(property._id)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("amenities", "title");

    const plain =
      populatedProperty && typeof populatedProperty.toObject === "function"
        ? populatedProperty.toObject()
        : populatedProperty;
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(201).json({
      status: "success",
      message: "Property created successfully",
      data: enhanced,
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
});

// create property by admin
const createPropertyByAdmin = asyncHandler(async (req, res) => {
  try {
    let mediaObj = req.body.media || {};
    const uploadedFloorPlanImages = getUploadedFloorPlanPaths(req);

    if (typeof mediaObj === "string") {
      try {
        mediaObj = JSON.parse(mediaObj);
      } catch (e) {
        mediaObj = {};
      }
    }

    if (req.body["media[videoLink]"]) {
      mediaObj.videoLink = req.body["media[videoLink]"];
    }

    if (!Array.isArray(mediaObj.images)) {
      mediaObj.images = [];
    }
    if (!Array.isArray(mediaObj.floorPlanImages)) {
      mediaObj.floorPlanImages = [];
    }

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        const uploadedImages = req.files.images.map(
          (file) => `/images/${file.filename}`
        );

        mediaObj.images = [...mediaObj.images, ...uploadedImages];
      }

      if (req.files.virtualTour && req.files.virtualTour[0]) {
        mediaObj.virtualTour = `/images/${req.files.virtualTour[0].filename}`;
      }

      if (req.files.sitePlanImage && req.files.sitePlanImage[0]) {
        mediaObj.sitePlanImage = `/images/${req.files.sitePlanImage[0].filename}`;
      }

      if (req.files.masterPlanImage && req.files.masterPlanImage[0]) {
        mediaObj.masterPlanImage = `/images/${req.files.masterPlanImage[0].filename}`;
      }

      if (uploadedFloorPlanImages.length > 0) {
        mediaObj.floorPlanImages = [
          ...mediaObj.floorPlanImages,
          ...uploadedFloorPlanImages,
        ];
      }
    }

    req.body.media = mediaObj;

    ensureCustomIdOnBody(req.body);
    const amenitiesIds = parseIdArray(req.body.amenities);
    req.body.amenities = [...new Set(amenitiesIds)];

    let incomingAgentIds =
      req.body.assignedAgent || req.body.agentId || req.body.agentIds;

    if (
      !incomingAgentIds ||
      (Array.isArray(incomingAgentIds) && !incomingAgentIds.length)
    ) {
      return res.status(400).json({
        status: "error",
        message: "At least one agent must be selected",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    if (typeof incomingAgentIds === "string") {
      incomingAgentIds = incomingAgentIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    } else if (!Array.isArray(incomingAgentIds)) {
      incomingAgentIds = [incomingAgentIds];
    }

    const uniqueAgentIds = [...new Set(incomingAgentIds)];

    const agents = await Agent.find({
      _id: { $in: uniqueAgentIds },
      status: "active",
    });

    if (agents.length !== uniqueAgentIds.length) {
      return res.status(400).json({
        status: "error",
        message: "One or more selected agents are invalid or inactive",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    req.body.assignedAgent = uniqueAgentIds;
    req.body.status = "verified";
    req.body.rejectionReason = null;
    req.body.createdBy = "admin";

    if (!req.body.location) req.body.location = {};

    const fullAddress = await buildFullAddress(req.body.location);

    if (fullAddress) {
      req.body.location.fullAddress = fullAddress;
    }

    if (req.body.description && req.body.description.title) {
      if (
        !req.body.description.slug ||
        req.body.description.slug.trim() === ""
      ) {
        req.body.description.slug = generateSlug(req.body.description.title);
      } else {
        req.body.description.slug = generateSlug(req.body.description.slug);
      }
    }

    if (!req.body.description || typeof req.body.description !== "object") {
      req.body.description = {};
    }

    req.body.description.floorPlans = normalizeFloorPlansFromRequest(
      req.body.description.floorPlans,
      uploadedFloorPlanImages
    );

    const property = await Property.create(req.body);

    const populatedProperty = await Property.findById(property._id)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    const plain =
      populatedProperty && typeof populatedProperty.toObject === "function"
        ? populatedProperty.toObject()
        : populatedProperty;
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(201).json({
      status: "success",
      message: "Property created and verified by admin successfully",
      data: enhanced,
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
});

// update property by admin
const updatePropertyByAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    const uploadedFloorPlanImages = getUploadedFloorPlanPaths(req);
    const hasFloorPlansInRequest =
      req.body.description &&
      Object.prototype.hasOwnProperty.call(req.body.description, "floorPlans");
    let normalizedFloorPlans;
    if (hasFloorPlansInRequest) {
      normalizedFloorPlans = normalizeFloorPlansFromRequest(
        req.body.description.floorPlans,
        uploadedFloorPlanImages
      );
    }
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const toArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
      }
      return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const updateData = { ...req.body };
    if (req.body?.description?.floorPlans !== undefined) {
      updateData.description = updateData.description || {};
      updateData.description.floorPlans = normalizeFloorPlansFromRequest(
        req.body.description.floorPlans,
        uploadedFloorPlanImages
      );
    }
    if (updateData.amenities !== undefined) {
      updateData.amenities = [...new Set(parseIdArray(updateData.amenities))];
    }
    if (updateData.details && typeof updateData.details === "object") {
      updateData.details = normalizePropertyDetailEnums(updateData.details);
    }
    delete updateData.agentId;
    delete updateData.agentIds;
    delete updateData.reason;

    if (updateData.description && typeof updateData.description === "object") {
      const existingDescription = property.description || {};
      const newDescription = { ...existingDescription };

      Object.keys(updateData.description).forEach((key) => {
        const value = updateData.description[key];
        if (value !== undefined) {
          newDescription[key] = value;
        }
      });

      updateData.description = newDescription;
    }

    updateData.media = {
      ...property.media,
      ...updateData.media,
    };

    if (uploadedFloorPlanImages.length) {
      const existingFloorPlanImages = property.media?.floorPlanImages || [];
      updateData.media.floorPlanImages = [
        ...existingFloorPlanImages,
        ...uploadedFloorPlanImages,
      ];
    }

    let baseImages = property.media?.images || [];
    let shouldUpdateImages = false;

    if (
      req.body.existingImages !== undefined &&
      req.body.existingImages !== null
    ) {
      shouldUpdateImages = true;
      try {
        const parsed =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(parsed)) {
          baseImages = parsed.map((img) => String(img).trim()).filter(Boolean);
        } else {
          baseImages = [];
        }
      } catch (error) {
        console.error(
          "Error parsing existingImages:",
          error,
          req.body.existingImages
        );
        baseImages = [];
      }
    }

    if (req.files && req.files.images) {
      shouldUpdateImages = true;
      const newImages = req.files.images.map(
        (file) => `/images/${file.filename}`
      );
      baseImages = [...baseImages, ...newImages];
    }

    if (shouldUpdateImages) {
      updateData.media.images = baseImages;
    }

    if (req.files?.virtualTour?.[0]) {
      if (property.media?.virtualTour) {
        deleteFile(property.media.virtualTour);
      }
      updateData.media.virtualTour = `/images/${req.files.virtualTour[0].filename}`;
    } else if (req.body.existingVirtualTour !== undefined) {
      updateData.media.virtualTour = req.body.existingVirtualTour || null;
    }

    if (req.files?.sitePlanImage?.[0]) {
      if (property.media?.sitePlanImage) {
        deleteFile(property.media.sitePlanImage);
      }
      updateData.media.sitePlanImage = `/images/${req.files.sitePlanImage[0].filename}`;
    } else if (req.body.existingSitePlanImage !== undefined) {
      updateData.media.sitePlanImage = req.body.existingSitePlanImage || null;
    }

    if (req.files?.masterPlanImage?.[0]) {
      if (property.media?.masterPlanImage) {
        deleteFile(property.media.masterPlanImage);
      }
      updateData.media.masterPlanImage = `/images/${req.files.masterPlanImage[0].filename}`;
    } else if (req.body.existingMasterPlanImage !== undefined) {
      updateData.media.masterPlanImage =
        req.body.existingMasterPlanImage || null;
    }

    updateData.createdBy = property.createdBy || "admin";

    const allowedStatuses = [
      "pending",
      "verified",
      "assigned",
      "rejected",
      "sold",
    ];
    const requestedStatus = updateData.status || property.status;

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value provided",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    if (requestedStatus === "verified") {
      const agentIds = toArray(
        updateData.assignedAgent || req.body.agentId || req.body.agentIds
      );

      if (!agentIds.length) {
        return res.status(400).json({
          status: "error",
          message:
            "Please select at least one agent before verifying a property",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }

      const activeAgents = await Agent.find({
        _id: { $in: agentIds },
        status: "active",
      });

      if (activeAgents.length !== agentIds.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more selected agents are invalid or inactive",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }

      updateData.assignedAgent = agentIds;
      updateData.rejectionReason = null;
    } else if (requestedStatus === "rejected") {
      const reason = (
        updateData.rejectionReason ||
        req.body.reason ||
        ""
      ).trim();
      if (!reason) {
        return res.status(400).json({
          status: "error",
          message: "Rejection reason is required when rejecting a property",
          code: 400,
          timestamp: new Date().toISOString(),
        });
      }
      updateData.rejectionReason = reason;
      updateData.assignedAgent = [];
    } else {
      if (updateData.assignedAgent !== undefined) {
        updateData.assignedAgent = toArray(updateData.assignedAgent);
      }
      if (requestedStatus !== "rejected") {
        updateData.rejectionReason = updateData.rejectionReason
          ? String(updateData.rejectionReason).trim()
          : null;
      }
    }

    if (updateData.location && typeof updateData.location === "object") {
      const locationChanged =
        updateData.location.address !== undefined ||
        updateData.location.state !== undefined ||
        updateData.location.city !== undefined ||
        updateData.location.area !== undefined ||
        updateData.location.zip !== undefined;

      if (locationChanged) {
        const mergedLocation = {
          ...property.location?.toObject(),
          ...updateData.location,
        };

        const fullAddress = await buildFullAddress(mergedLocation);

        if (fullAddress) {
          updateData.location.fullAddress = fullAddress;
        }
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("description.category", "name")
      .populate("description.builder", "title slug")
      .populate("description.propertyType", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name");

    const plain =
      updatedProperty && typeof updatedProperty.toObject === "function"
        ? updatedProperty.toObject()
        : updatedProperty;
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully by admin",
      data: enhanced,
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
});

// get all properties
const getAllProperties = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sort = "-createdAt",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const matchQuery = {};

    if (status && typeof status === "string") {
      matchQuery.status = status.toLowerCase();
    }

    if (search && typeof search === "string") {
      const searchRegex = new RegExp(search.trim(), "i");
      matchQuery.$or = [
        { "description.title": searchRegex },
        { "description.description": searchRegex },
        { "location.address": searchRegex },
      ];
    }

    const sortOptions = {};
    if (typeof sort === "string") {
      const fields = sort.split(",");
      fields.forEach((field) => {
        if (!field) return;
        const direction = field.startsWith("-") ? -1 : 1;
        const fieldName = field.replace(/^-/, "");
        sortOptions[fieldName] = direction;
      });
    }

    const total = await Property.countDocuments(matchQuery);

    const properties = await Property.find(matchQuery)
      .sort(sortOptions)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate("description.category", "name")
      .populate("description.builder", "title slug")
      .populate("description.propertyType", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .lean();

    const enhancedList = (properties || []).map((plain) => {
      const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
        plain?.description?.floorPlans
      );
      return { ...plain, minSize, maxSize, sizeRange };
    });

    res.status(200).json({
      status: "success",
      message: "Properties fetched successfully",
      data: enhancedList,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
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
});

// get property by id
const getPropertyById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let property = null;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isObjectId) {
      property = await Property.findById(id)
        .populate("description.category", "name")
        .populate("description.propertyType", "name")
        .populate("description.builder", "title slug")
        .populate("location.state", "name")
        .populate("location.city", "name")
        .populate("location.area", "name")
        .populate("assignedAgent", "name email phoneNumber image slug")
        .populate("amenities", "title");
    }

    if (!property) {
      property = await Property.findOne({
        "description.slug": id,
      })
        .populate("description.category", "name")
        .populate("description.propertyType", "name")
        .populate("description.builder", "title slug")
        .populate("location.state", "name")
        .populate("location.city", "name")
        .populate("location.area", "name")
        .populate("assignedAgent", "name email phoneNumber image slug")
        .populate("amenities", "title");
    }

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    const plain =
      property && typeof property.toObject === "function"
        ? property.toObject()
        : property;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );

    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property fetched successfully",
      data: enhanced,
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
});

// update property
const updatePropertyById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const uploadedFloorPlanImages = getUploadedFloorPlanPaths(req);
    const hasFloorPlansInRequest =
      req.body.description &&
      Object.prototype.hasOwnProperty.call(req.body.description, "floorPlans");
    let normalizedFloorPlans;
    if (hasFloorPlansInRequest) {
      normalizedFloorPlans = normalizeFloorPlansFromRequest(
        req.body.description.floorPlans,
        uploadedFloorPlanImages
      );
    }
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    req.body.media = req.body.media || {};

    let baseImages = property.media?.images || [];
    let shouldUpdateImages = false;

    if (
      req.body.existingImages !== undefined &&
      req.body.existingImages !== null
    ) {
      shouldUpdateImages = true;
      try {
        const parsed =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(parsed)) {
          baseImages = parsed.map((img) => String(img).trim()).filter(Boolean);
        } else {
          baseImages = [];
        }
      } catch (error) {
        console.error(
          "Error parsing existingImages:",
          error,
          req.body.existingImages
        );
        baseImages = [];
      }
    }

    if (req.files && req.files.images) {
      shouldUpdateImages = true;
      const newImages = req.files.images.map(
        (file) => `/images/${file.filename}`
      );
      baseImages = [...baseImages, ...newImages];
    }

    if (shouldUpdateImages) {
      req.body.media.images = baseImages;
    }

    if (req.files?.virtualTour?.[0]) {
      if (property.media?.virtualTour) {
        deleteFile(property.media.virtualTour);
      }
      req.body.media.virtualTour = `/images/${req.files.virtualTour[0].filename}`;
    } else if (req.body.existingVirtualTour !== undefined) {
      req.body.media.virtualTour = req.body.existingVirtualTour || null;
    }

    if (req.files?.sitePlanImage?.[0]) {
      if (property.media?.sitePlanImage) {
        deleteFile(property.media.sitePlanImage);
      }
      req.body.media.sitePlanImage = `/images/${req.files.sitePlanImage[0].filename}`;
    } else if (req.body.existingSitePlanImage !== undefined) {
      req.body.media.sitePlanImage = req.body.existingSitePlanImage || null;
    }

    if (req.files?.masterPlanImage?.[0]) {
      if (property.media?.masterPlanImage) {
        deleteFile(property.media.masterPlanImage);
      }
      req.body.media.masterPlanImage = `/images/${req.files.masterPlanImage[0].filename}`;
    } else if (req.body.existingMasterPlanImage !== undefined) {
      req.body.media.masterPlanImage = req.body.existingMasterPlanImage || null;
    }

    if (uploadedFloorPlanImages.length) {
      const existingFloorPlanImages = property.media?.floorPlanImages || [];
      req.body.media.floorPlanImages = [
        ...existingFloorPlanImages,
        ...uploadedFloorPlanImages,
      ];
    }

    if (
      req.body.media &&
      Object.keys(req.body.media).length === 0 &&
      !req.files
    ) {
      delete req.body.media;
    }

    if (req.body.description && typeof req.body.description === "object") {
      const existingDescription = property.description || {};
      const newDescription = { ...existingDescription };

      Object.keys(req.body.description).forEach((key) => {
        const value = req.body.description[key];
        if (value !== undefined) {
          newDescription[key] = value;
        }
      });

      if (normalizedFloorPlans !== undefined) {
        newDescription.floorPlans = normalizedFloorPlans;
      }

      req.body.description = newDescription;
    }

    if (req.body.amenities !== undefined) {
      req.body.amenities = [...new Set(parseIdArray(req.body.amenities))];
    }

    if (req.body.details && typeof req.body.details === "object") {
      req.body.details = normalizePropertyDetailEnums(req.body.details);
    }

    if (req.body.location && typeof req.body.location === "object") {
      const locationChanged =
        req.body.location.address !== undefined ||
        req.body.location.state !== undefined ||
        req.body.location.city !== undefined ||
        req.body.location.area !== undefined ||
        req.body.location.zip !== undefined;

      if (locationChanged) {
        const mergedLocation = {
          ...property.location?.toObject(),
          ...req.body.location,
        };

        const fullAddress = await buildFullAddress(mergedLocation);

        if (fullAddress) {
          req.body.location.fullAddress = fullAddress;
        }
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    const plain =
      updatedProperty && typeof updatedProperty.toObject === "function"
        ? updatedProperty.toObject()
        : updatedProperty;
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: enhanced,
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
});

// delete property by id
const deletePropertyById = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: "success",
      message: "Property deleted successfully",
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
});

// get all pending properties
const getPendingProperties = asyncHandler(async (req, res) => {
  try {
    let limit = 10;
    let page = 1;

    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.page) page = parseInt(req.query.page);

    const [properties, totalCount] = await Promise.all([
      Property.find({ status: "pending" })
        .populate("description.category", "name")
        .populate("description.propertyType", "name")
        .populate("description.builder", "title slug")
        .populate("location.state", "name")
        .populate("location.city", "name")
        .populate("location.area", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Property.countDocuments({ status: "pending" }),
    ]);

    const enhancedList = (properties || []).map((plain) => {
      const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
        plain?.description?.floorPlans
      );
      return { ...plain, minSize, maxSize, sizeRange };
    });

    res.status(200).json({
      status: "success",
      message: "Pending properties fetched successfully",
      data: enhancedList,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch pending properties",
      code: 500,
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// get pending property by id
const getPendingPropertyById = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findOne({
      "description.slug": req.params.id,
    })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("amenities", "title");
    if (!property || property.status !== "pending") {
      return res.status(404).json({
        status: "error",
        message: "Pending property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    const plain =
      property && typeof property.toObject === "function"
        ? property.toObject()
        : property;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Pending property fetched successfully",
      data: enhanced,
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
});

// update status to verify or reject with a reason
const verifyOrRejectProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    if (property.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Only pending properties can be updated",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    if (status === "rejected" && !reason) {
      return res.status(400).json({
        status: "error",
        message: "Rejection reason is required",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    property.status = status;
    property.rejectionReason = status === "rejected" ? reason : null;

    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    const plain =
      populatedProperty && typeof populatedProperty.toObject === "function"
        ? populatedProperty.toObject()
        : populatedProperty;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );

    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: enhanced,
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
});

// get rejected properties
const getRejectedProperties = asyncHandler(async (req, res) => {
  try {
    const properties = await Property.find({ status: "rejected" })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .sort({ updatedAt: -1 })
      .lean();

    const enhancedList = (properties || []).map((plain) => {
      const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
        plain?.description?.floorPlans
      );
      return { ...plain, minSize, maxSize, sizeRange };
    });

    res.status(200).json({
      status: "success",
      message: "Rejected properties fetched successfully",
      data: enhancedList,
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
});

// get rejected property by id
const getRejectedPropertyById = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findOne({
      "description.slug": req.params.id,
    })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("amenities", "title")
      .lean();
    if (!property || property.status !== "rejected") {
      return res.status(404).json({
        status: "error",
        message: "Rejected property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    const plain =
      property && typeof property.toObject === "function"
        ? property.toObject()
        : property;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Rejected property fetched successfully",
      data: enhanced,
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
});

//update rejected property with status
const updateRejectedPropertyWithStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updateFields } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    if (property.status !== "rejected") {
      return res.status(400).json({
        status: "error",
        message: "Only rejected properties can be edited in this route",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.files && req.files.images) {
      const currentImages = property.media?.images || [];
      const newImages = req.files.images.map(
        (file) => `/images/${file.filename}`
      );
      updateFields.media = {
        ...property.media,
        ...updateFields.media,
        images: [...currentImages, ...newImages],
      };
    }

    if (req.files?.virtualTour?.[0]) {
      if (property.media?.virtualTour) {
        deleteFile(property.media.virtualTour);
      }
      updateFields.media = {
        ...property.media,
        ...updateFields.media,
        virtualTour: `/images/${req.files.virtualTour[0].filename}`,
      };
    }

    if (req.files?.sitePlanImage?.[0]) {
      if (property.media?.sitePlanImage) {
        deleteFile(property.media.sitePlanImage);
      }
      updateFields.media = {
        ...property.media,
        ...updateFields.media,
        sitePlanImage: `/images/${req.files.sitePlanImage[0].filename}`,
      };
    }

    if (req.files?.masterPlanImage?.[0]) {
      if (property.media?.masterPlanImage) {
        deleteFile(property.media.masterPlanImage);
      }
      updateFields.media = {
        ...property.media,
        ...updateFields.media,
        masterPlanImage: `/images/${req.files.masterPlanImage[0].filename}`,
      };
    }

    if (status === "verified") {
      updateFields.rejectionReason = null;
    }
    if (status) {
      updateFields.status = status;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    const plain =
      updatedProperty && typeof updatedProperty.toObject === "function"
        ? updatedProperty.toObject()
        : updatedProperty;
    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: enhanced,
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
});

// get verified properties
const getVerifiedProperties = asyncHandler(async (req, res) => {
  try {
    const properties = await Property.find({ status: "verified" })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title")
      .sort({ createdAt: -1 })
      .lean();

    const enhancedList = (properties || []).map((plain) => {
      const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
        plain?.description?.floorPlans
      );
      return { ...plain, minSize, maxSize, sizeRange };
    });

    res.status(200).json({
      status: "success",
      message: "Verified properties fetched successfully",
      data: enhancedList,
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
});

// get verified property by id
const getVerifiedPropertyById = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findOne({
      "description.slug": req.params.id,
    })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");
    if (!property || property.status !== "verified") {
      return res.status(404).json({
        status: "error",
        message: "Verified property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const plain =
      property && typeof property.toObject === "function"
        ? property.toObject()
        : property;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );
    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Verified property fetched successfully",
      data: enhanced,
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
});

// assign broker to property
const assignBrokerToProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { brokerId } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    if (property.status !== "verified") {
      return res.status(400).json({
        status: "error",
        message: "Only verified properties can have brokers assigned",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const broker = await User.findById(brokerId);
    if (!broker || broker.role !== "broker") {
      return res.status(400).json({
        status: "error",
        message: "Invalid broker ID or user is not a broker",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }

    property.assignedAgent = [brokerId];
    property.status = "assigned";
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    const plain =
      populatedProperty && typeof populatedProperty.toObject === "function"
        ? populatedProperty.toObject()
        : populatedProperty;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );

    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: enhanced,
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
});

// get all assigned properties
const getAssignedProperties = asyncHandler(async (req, res) => {
  try {
    const assignedProperties = await Property.find({ status: "assigned" })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title")
      .sort({ createdAt: -1 })
      .lean();

    if (!assignedProperties || assignedProperties.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No assigned properties found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const enhancedList = (assignedProperties || []).map((plain) => {
      const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
        plain?.description?.floorPlans
      );
      return { ...plain, minSize, maxSize, sizeRange };
    });

    res.status(200).json({
      status: "success",
      message: "Assigned properties fetched successfully",
      data: enhancedList,
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
});

// get assigned property by id
const getAssignedPropertyById = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findOne({
      "description.slug": req.params.id,
    })
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");
    if (!property || property.status !== "assigned") {
      return res.status(404).json({
        status: "error",
        message: "Assigned property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    const plain =
      property && typeof property.toObject === "function"
        ? property.toObject()
        : property;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );

    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Assigned property fetched successfully",
      data: enhanced,
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
});

// update the status of assigned property to sold
const markAssignedPropertyAsSold = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }
    if (property.status !== "assigned") {
      return res.status(400).json({
        status: "error",
        message: "Only assigned properties can be marked as sold",
        code: 400,
        timestamp: new Date().toISOString(),
      });
    }
    property.status = "sold";
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate("description.category", "name")
      .populate("description.propertyType", "name")
      .populate("description.builder", "title slug")
      .populate("location.state", "name")
      .populate("location.city", "name")
      .populate("location.area", "name")
      .populate("assignedAgent", "name email phoneNumber image slug")
      .populate("amenities", "title");

    if (!populatedProperty) {
      return res.status(404).json({
        status: "error",
        message: "Property not found after update",
        code: 404,
        timestamp: new Date().toISOString(),
      });
    }

    const plain =
      populatedProperty && typeof populatedProperty.toObject === "function"
        ? populatedProperty.toObject()
        : populatedProperty;

    const { minSize, maxSize, sizeRange } = computeSizeRangeFromFloorPlans(
      plain?.description?.floorPlans
    );

    const enhanced = { ...plain, minSize, maxSize, sizeRange };

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: enhanced,
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
});

module.exports = {
  createProperty,
  createPropertyByAdmin,
  updatePropertyByAdmin,
  getAllProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  getPendingProperties,
  getPendingPropertyById,
  verifyOrRejectProperty,
  getRejectedProperties,
  getRejectedPropertyById,
  updateRejectedPropertyWithStatus,
  getVerifiedProperties,
  getVerifiedPropertyById,
  assignBrokerToProperty,
  getAssignedProperties,
  getAssignedPropertyById,
  markAssignedPropertyAsSold,
};

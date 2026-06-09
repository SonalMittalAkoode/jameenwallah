import Property from "@/models/Property";
import dbConnect from "@/lib/db";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "http://localhost:5001";

const getEntityName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.title || "";
};

const formatPriceDisplay = (price) => {
  const priceNum = Number(price);
  if (!priceNum || Number.isNaN(priceNum) || priceNum <= 0) return "Price on Request";
  if (priceNum >= 10000000) return `₹${(priceNum / 10000000).toFixed(priceNum % 10000000 === 0 ? 0 : 1)} Cr`;
  if (priceNum >= 100000) return `₹${(priceNum / 100000).toFixed(priceNum % 100000 === 0 ? 0 : 1)} Lakh`;
  return `₹${priceNum.toLocaleString("en-IN")}`;
};

const mapApiProperty = (property, filters = {}) => {
  const bestPlan = property.description?.floorPlans?.[0] || {};
  const price = Number(property.description?.price || bestPlan.price || 0);
  return {
    _id: String(property._id || ""),
    slug: property.description?.slug || "",
    category: getEntityName(property.description?.category),
    title: property.description?.title || "JameenWallah Property",
    location:
      [
        getEntityName(property.location?.area),
        getEntityName(property.location?.city),
      ]
        .filter(Boolean)
        .join(", ") ||
      property.location?.address ||
      property.location?.nearBy ||
      "Gurugram",
    bed: property.details?.bhk || filters.bed || "",
    price,
    priceDisplay: formatPriceDisplay(price),
    sqft:
      property.details?.sizeInSqFt ||
      property.details?.totalAreaInSqFt ||
      bestPlan.superBuiltUpArea ||
      bestPlan.carpetArea ||
      0,
    image: property.media?.images?.[0] || "/images/listings/g1-1.jpg",
    propertyType: getEntityName(property.description?.propertyType),
  };
};

async function fetchPropertiesFromApi(filters = {}) {
  const query = new URLSearchParams({ limit: "50", page: "1" });
  if (filters.location) query.set("search", filters.location);
  if (filters.propertyType) query.set("propertyType", filters.propertyType);

  const response = await fetch(`${API_BASE_URL}/frontend/api/properties?${query.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Property API returned ${response.status}`);
  const payload = await response.json();
  let mapped = Array.isArray(payload?.data)
    ? payload.data.map((property) => mapApiProperty(property, filters))
    : [];

  if (filters.maxPrice) {
    mapped = mapped.filter((property) => !property.price || property.price <= filters.maxPrice);
  }

  return mapped
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
    .slice(0, 5);
}

/**
 * Helper to construct MongoDB query object matching the deep database schema
 */
function buildQuery(filters) {
  const query = {};

  if (filters.bed) query["details.bhk"] = { $regex: new RegExp(String(filters.bed), "i") };

  // If location is provided, search address, nearBy, or title
  if (filters.location) {
    query.$or = [
      { "location.address": { $regex: new RegExp(filters.location, "i") } },
      { "location.nearBy": { $regex: new RegExp(filters.location, "i") } },
      { "description.title": { $regex: new RegExp(filters.location, "i") } },
    ];
  } else {
    // Default fallback to "Gurgaon"
    query.$or = [
      { "location.address": { $regex: new RegExp("gurgaon|gurugram", "i") } },
      { "location.nearBy": { $regex: new RegExp("gurgaon|gurugram", "i") } },
      { "description.title": { $regex: new RegExp("gurgaon|gurugram", "i") } }
    ];
  }

  // maxPrice and propertyType omitted from DB query due to strict structural differences
  // maxPrice will be filtered in memory.
  return query;
}

/**
 * Fetches docs, maps them to UI-friendly format, and applies numeric filters
 */
async function fetchAndFormatProperties(filters) {
  const query = buildQuery(filters);
  const rawProperties = await Property.find(query).limit(50).lean();

  // Map Mongoose schema objects to expected flat UI format
  let mapped = rawProperties.map(p => {
    let bestPlan = p.description?.floorPlans?.[0] || {};
    return {
      _id: String(p._id),
      slug: p.description?.slug || "",
      category: p.description?.category || "",
      title: p.description?.title || "Jameenwallah Property",
      location: p.location?.address || p.location?.nearBy || "Gurugram",
      bed: p.details?.bhk || filters.bed || 3,
      price: bestPlan.price ? Number(bestPlan.price) : 0,
      priceDisplay: bestPlan.price ? `₹${(Number(bestPlan.price) / 10000000).toFixed(2)} Cr` : "Price on Request",
      sqft: bestPlan.carpetArea || 1000,
      image: p.media?.images?.[0] || '/images/listings/g1-1.jpg',
      propertyType: p.description?.propertyType
    };
  });

  // Filter for maxPrice in-memory
  if (filters.maxPrice) {
    mapped = mapped.filter(p => !p.price || p.price <= filters.maxPrice);
  }

  // Sort budget-friendly first, then limit top 5
  return mapped
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
    .slice(0, 5);
}

/**
 * Queries MongoDB for properties matching filters.
 * Implements budget-first relaxation if no exact matches are found.
 * Returns { properties, appliedFilters, isRelaxed, resultConfidence }
 */
export async function searchProperties(filters) {
  let isRelaxed = false;
  let resultConfidence = "high"; // Default for exact match
  let appliedFilters = { ...filters };

  try {
    let properties = await fetchPropertiesFromApi(filters);

    // --- Relaxation Logic (Budget First) ---
    if (properties.length === 0) {
      isRelaxed = true;
      resultConfidence = "medium";

      // Stage 1: Relax Budget (Increase maxPrice by 20%)
      if (filters.maxPrice) {
        const relaxedFilters = { ...filters, maxPrice: filters.maxPrice * 1.2 };
        appliedFilters = relaxedFilters;
        properties = await fetchPropertiesFromApi(relaxedFilters);
      }

      // Stage 2: If still no results, drop BHK constraint (Look for any BHK in location)
      if (properties.length === 0 && (filters.bed || filters.propertyType)) {
        resultConfidence = "low";
        const relaxedFilters = { 
          location: filters.location,
          maxPrice: filters.maxPrice ? filters.maxPrice * 1.2 : null 
        };
        appliedFilters = relaxedFilters;
        properties = await fetchPropertiesFromApi(relaxedFilters);
      }

      // Stage 3: Broadest Search (Location only)
      if (properties.length === 0 && filters.location) {
        resultConfidence = "low";
        const relaxedFilters = { location: filters.location };
        appliedFilters = relaxedFilters;
        properties = await fetchPropertiesFromApi(relaxedFilters);
      }
    }

    return { 
      properties, 
      appliedFilters, 
      isRelaxed,
      resultConfidence
    };
  } catch (error) {
    console.error("SearchProperties API error:", error);
  }

  try {
    await dbConnect();
    const properties = await fetchAndFormatProperties(filters);
    return {
      properties,
      appliedFilters,
      isRelaxed,
      resultConfidence: properties.length ? "medium" : "low",
    };
  } catch (error) {
    console.error("SearchProperties fallback error:", error);
    return { properties: [], appliedFilters: filters, isRelaxed: false, resultConfidence: "low" };
  }
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export const cleanText = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const getEntityName = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    const text = cleanText(value);
    return OBJECT_ID_RE.test(text) ? "" : text;
  }
  if (typeof value === "object") {
    return cleanText(value.name || value.title || value.label || value.slug || "");
  }
  return "";
};

export const parsePositiveNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  const match = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  const number = match ? Number(match[0]) : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const firstPositive = (...values) => {
  for (const value of values) {
    const number = parsePositiveNumber(value);
    if (number) return number;
  }
  return null;
};

export const formatPropertyLocation = (propertyOrLocation) => {
  const location = propertyOrLocation?.location || propertyOrLocation;
  if (!location) return "Location not specified";
  if (typeof location === "string") return cleanText(location) || "Location not specified";

  const parts = [
    getEntityName(location.area),
    getEntityName(location.city),
    getEntityName(location.state),
  ].filter(Boolean);

  if (parts.length) return parts.join(", ");

  const fallback = cleanText(location.address || location.nearBy);
  return fallback || "Location not specified";
};

const getFloorPlanSizes = (property) => {
  const plans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];
  return plans
    .flatMap((plan) => [plan?.superBuiltUpArea, plan?.builtUpArea, plan?.carpetArea, plan?.size])
    .map(parsePositiveNumber)
    .filter((number) => number && number >= 100);
};

const isRealDisplaySize = (number) => Number.isFinite(number) && number >= 100;

export const getSizeSqFt = (property) => {
  const direct = [
    property?.details?.sizeInSqFt,
    property?.details?.sizeInFt,
    property?.details?.area,
    property?.details?.areaInSqFt,
    property?.details?.builtUpArea,
    property?.details?.builtUpAreaInSqFt,
    property?.details?.superBuiltUpArea,
    property?.details?.superArea,
    property?.details?.carpetArea,
    property?.details?.plotArea,
    property?.details?.saleableArea,
    property?.details?.coveredArea,
    property?.details?.chargeableArea,
    property?.details?.totalAreaInSqFt,
    property?.description?.area,
    property?.description?.areaInSqFt,
    property?.description?.builtUpArea,
    property?.description?.superBuiltUpArea,
    property?.description?.carpetArea,
    property?.description?.plotArea,
    property?.description?.size,
    property?.description?.propertySize,
    property?.totalAreaInSqFt,
    property?.area,
    property?.areaInSqFt,
    property?.sizeInSqFt,
    property?.propertySize,
    property?.builtUpArea,
    property?.superBuiltUpArea,
    property?.carpetArea,
    property?.plotArea,
    property?.sqft,
    property?.maxSize,
    property?.minSize
  ]
    .map(parsePositiveNumber)
    .find(isRealDisplaySize);
  if (direct) return Math.round(direct);

  const floorPlanSizes = getFloorPlanSizes(property);
  return floorPlanSizes.length ? Math.round(Math.max(...floorPlanSizes)) : null;
};

export const formatSizeLabel = (property) => {
  const size = getSizeSqFt(property);
  return size ? `${new Intl.NumberFormat("en-IN").format(size)} Sqft` : "";
};

export const getBhkNumbers = (property) => {
  const floorPlans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];
  const floorPlanText = floorPlans
    .map((plan) => [plan?.title, plan?.name, plan?.type, plan?.configuration, plan?.bhk].filter(Boolean).join(" "))
    .join(" ");
  const source = cleanText(
    `${property?.details?.bhk || ""} ${property?.description?.propertyTypeText || ""} ${property?.description?.title || ""} ${floorPlanText}`
  );
  const matches = [...source.matchAll(/(\d+(?:\.\d+)?)\s*BHK\b/gi)]
    .map((match) => Number(match[1]))
    .filter((number) => Number.isFinite(number) && number > 0);
  return [...new Set(matches)];
};

export const getBedroomLabel = (property) => {
  const direct = firstPositive(
    property?.details?.bedrooms,
    property?.details?.bedroom,
    property?.details?.bed,
    property?.bedrooms,
    property?.bedroom,
    property?.bed
  );
  if (direct) return `${direct} Beds`;

  const bhkNumbers = getBhkNumbers(property);
  if (!bhkNumbers.length) return "";
  if (bhkNumbers.length === 1) return `${bhkNumbers[0]} Beds`;
  return `${Math.min(...bhkNumbers)}-${Math.max(...bhkNumbers)} Beds`;
};

export const getBathroomLabel = (property) => {
  const direct = firstPositive(
    property?.details?.bathrooms,
    property?.details?.bathroom,
    property?.details?.bath,
    property?.bathrooms,
    property?.bathroom,
    property?.bath
  );
  if (direct) return `${direct} Baths`;

  const bhkNumbers = getBhkNumbers(property);
  if (!bhkNumbers.length) return "";
  if (bhkNumbers.length === 1) return `${Math.max(1, Math.round(bhkNumbers[0]))} Baths`;
  return `${Math.max(1, Math.round(Math.min(...bhkNumbers)))}-${Math.max(1, Math.round(Math.max(...bhkNumbers)))} Baths`;
};

export const getCompactMeta = (property) =>
  [
    getBedroomLabel(property),
    getBathroomLabel(property),
    formatSizeLabel(property),
  ].filter(Boolean);

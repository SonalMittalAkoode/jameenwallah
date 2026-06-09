const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getUploadPath = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/images/") ? parsed.pathname : "";
  } catch {
    return "";
  }
};

const resolveBackendUpload = (path) =>
  `/api/media-image?path=${encodeURIComponent(path)}`;

const BLACKLISTED_IMAGE_SOURCE_PATTERN =
  /99acres|magicbricks|housing\.com|nobroker|no-broker|makaan|squareyards|commonfloor|proptiger|roofandfloor|nanubhaiproperty|axiomlandbase|comingkeys|addressofchoice|leasing\.net|bigcat|miro\.medium|medium\.com|i\.ytimg\.com|youtube\.com|alexandro\.in|kenrealty\.in|dlf-projects\.co|placehold\.co|placeholder\.com|via\.placeholder|dummyimage|dummy-image|no-image/i;

const UNCLEAN_PUBLIC_PROPERTY_IMAGE_PATTERN =
  /99acres|magicbricks|housing\.com|nobroker|no-broker|makaan|squareyards|commonfloor|proptiger|roofandfloor|nanubhaiproperty|axiomlandbase|comingkeys|addressofchoice|leasing\.net|bigcat|placehold\.co|placeholder\.com|via\.placeholder|dummyimage|dummy-image|no-image|broker|agent|phone|mobile|whatsapp|contact|call|tel:|watermark|banner|logo|team|avatar|profile|person|people|human|customer|client|testimonial/i;

const BROKEN_GOOGLE_IMAGE_TRANSFORM_PATTERN =
  /googleusercontent\.com\/(?:places|place-photos)\/[^?#]+=[^?#]*(?:-w1079|\b\d+x\d+\b)(?:$|[&#?])/i;

export const CLEAN_PROPERTY_FALLBACK_IMAGES = [
  "/images/listings/g1-1.webp",
  "/images/listings/g1-1.jpg",
  "/images/listings/g1-2.jpg",
  "/images/listings/g1-3.jpg",
  "/images/listings/g1-4.jpg",
  "/images/listings/g1-5.jpg",
  "/images/listings/g1-6.jpg",
  "/images/listings/city-listing-5.png",
  "/images/listings/city-listing-6.png",
  "/images/listings/city-listing-7.png",
  "/images/listings/city-listing-8.png",
  "/images/listings/city-listing-9.png",
];

export const isBlacklistedImageSource = (img) =>
  BLACKLISTED_IMAGE_SOURCE_PATTERN.test(String(img || "")) ||
  BROKEN_GOOGLE_IMAGE_TRANSFORM_PATTERN.test(String(img || ""));

export const getCleanPropertyFallbackImage = (seed = "") => {
  const raw = String(seed || "");
  const hash = raw.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CLEAN_PROPERTY_FALLBACK_IMAGES[hash % CLEAN_PROPERTY_FALLBACK_IMAGES.length];
};

export const isCleanPublicPropertyImageSource = (img) => {
  const value = String(img || "").trim();
  if (!value) return false;
  if (isBlacklistedImageSource(value)) return false;
  if (UNCLEAN_PUBLIC_PROPERTY_IMAGE_PATTERN.test(value)) return false;
  if (/^\/images\/(?:partners|builder-logos|team|agent|avatar|blog)\//i.test(value)) {
    return false;
  }
  return true;
};

/**
 * Resolves an image source by determining if it's a local static asset,
 * an external URL, or a dynamic backend upload.
 * 
 * @param {string} img - The image path or URL
 * @param {string} fallback - The fallback image path if img is missing
 * @returns {string} - The resolved image source
 */
export const resolveImageSrc = (img, fallback = "/images/listings/g1-1.jpg") => {
  if (Array.isArray(img)) {
    const firstUsable = img
      .map((item) => resolveImageSrc(getRawImageValue(item), ""))
      .find(Boolean);
    return firstUsable || fallback;
  }

  if (!img || typeof img !== "string") return fallback;
  
  const trimmedImg = img.trim();
  if (!trimmedImg) return fallback;
  if (isBlacklistedImageSource(trimmedImg)) return fallback;

  if (trimmedImg.startsWith("/api/") || trimmedImg.startsWith("/_next/")) {
    return trimmedImg;
  }

  // External URLs
  if (trimmedImg.startsWith("http://") || trimmedImg.startsWith("https://")) {
    const uploadPath = getUploadPath(trimmedImg);
    const configuredBase = trimTrailingSlash(API_BASE_URL);

    if (uploadPath && configuredBase && trimmedImg.startsWith(configuredBase)) {
      return resolveBackendUpload(uploadPath);
    }

    return trimmedImg;
  }

  // Detect uploaded files vs static demos
  // Static assets are in subdirectories: /images/architect/..., /images/lawyer/...
  // Dynamic uploads are directly in /images/: /images/1774866293746-file.jpg
  if (trimmedImg.startsWith("/images/")) {
    const pathAfterImages = trimmedImg.substring(8);
    if (pathAfterImages.startsWith("builder-logos/")) {
      return trimmedImg;
    }
    // If there's NO slash after /images/, it's a backend upload
    if (!pathAfterImages.includes("/")) {
      return resolveBackendUpload(trimmedImg);
    }
    // Otherwise it's a local static asset
    return trimmedImg;
  }

  // Any other direct path starting with / or something else that needs prefixing
  if (trimmedImg.startsWith("/")) {
    return trimmedImg;
  }
  
  return `${API_BASE_URL}/${trimmedImg}`;
};

export const getRawImageValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object") return "";

  return String(
    value.url ||
      value.src ||
      value.path ||
      value.image ||
      value.imageUrl ||
      value.photo ||
      value.photoUrl ||
      value.link ||
      value.secure_url ||
      value.location ||
      ""
  ).trim();
};

const uniqueValues = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = getRawImageValue(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getPropertyImageCandidates = (property) => {
  const media = property?.media || {};
  const floorPlans = Array.isArray(property?.description?.floorPlans)
    ? property.description.floorPlans
    : [];

  return uniqueValues([
    ...(Array.isArray(media.images) ? media.images : []),
    media.sitePlanImage,
    ...(Array.isArray(media.sitePlanImages) ? media.sitePlanImages : []),
    media.masterPlanImage,
    ...(Array.isArray(media.masterPlanImages) ? media.masterPlanImages : []),
    ...(Array.isArray(media.floorPlanImages) ? media.floorPlanImages : []),
    ...floorPlans.map((plan) => plan?.image),
    property?.image,
  ])
    .map(getRawImageValue)
    .filter(Boolean)
    .filter((image) => !isBlacklistedImageSource(image))
    .map((image) => resolveImageSrc(image, ""));
};

export const getPrimaryPropertyImage = (property, fallback = "/images/listings/g1-1.jpg") =>
  getPropertyImageCandidates(property)[0] || fallback;

export const proxyExternalPropertyImage = (image) => {
  const value = String(image || "").trim();
  if (!/^https?:\/\//i.test(value)) return value;
  return `/api/external-image?url=${encodeURIComponent(value)}`;
};

export const getCleanPropertyImageCandidates = (property) =>
  getPropertyImageCandidates(property)
    .filter(isCleanPublicPropertyImageSource)
    .map(proxyExternalPropertyImage);

export const getCleanPrimaryPropertyImage = (property, fallback = "") => {
  if (!property) return fallback || "";
  return (
    getCleanPropertyImageCandidates(property)[0] ||
    fallback ||
    getCleanPropertyFallbackImage(
      property?.description?.slug ||
        property?.description?.title ||
        property?._id ||
        property?.id ||
        ""
    )
  );
};

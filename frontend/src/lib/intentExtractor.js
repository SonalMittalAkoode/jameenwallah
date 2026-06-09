/**
 * A lightweight utility that uses regex to extract search filters from user messages.
 * Enhanced with rule-based intent detection and lightweight memory (last 5 messages).
 */

export function extractIntent(message, history = []) {
  const normalized = message.toLowerCase();

  // 1. Detect Intent (Rule-based)
  let intent = "buy"; // Default
  if (normalized.includes("invest")) intent = "investment";
  else if (normalized.includes("rent") || normalized.includes("lease")) intent = "rent";
  else if (normalized.includes("compare") || normalized.includes("difference") || normalized.includes("vs")) intent = "compare";

  // 2. Extract Memory from History (Last 5 user messages)
  const memory = extractMemory(history);

  // 3. Extract Filters from Current Message
  const currentFilters = parseFilters(normalized);

  // 4. Merge Filters (Current message takes precedence)
  const combinedFilters = {
    bed: currentFilters.bed || memory.bed || null,
    maxPrice: currentFilters.maxPrice || memory.maxPrice || null,
    location: currentFilters.location || memory.location || null,
    propertyType: currentFilters.propertyType || memory.propertyType || null,
  };

  return {
    intent,
    filters: combinedFilters,
    rawFilters: currentFilters, // For meta.appliedFilters later
  };
}

/**
 * Parses a string for property filters using regex
 */
function parseFilters(text) {
  const filters = {
    bed: null,
    maxPrice: null,
    location: null,
    propertyType: null,
  };

  // Extract BHK (Bedrooms)
  const bedMatch = text.match(/(\d+)\s*(?:bhk|bedroom|bed)/);
  if (bedMatch) filters.bed = parseInt(bedMatch[1], 10);

  // Extract Budget (Price)
  const crMatch = text.match(/(?:under|below|upto|within)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore)/);
  if (crMatch) {
    filters.maxPrice = parseFloat(crMatch[1]) * 10000000;
  } else {
    const lacMatch = text.match(/(?:under|below|upto|within)?\s*(\d+(?:\.\d+)?)\s*(?:l|lac|lakh)/);
    if (lacMatch) filters.maxPrice = parseFloat(lacMatch[1]) * 100000;
  }

  // Extract Locations
  const locations = [
    "gurgaon", "noida", "delhi", "faridabad", "ghaziabad",
    "dwarka expressway", "golf course road", "sohna road",
    "sector 50", "sector 65", "dlf", "m3m"
  ];
  for (const loc of locations) {
    if (text.includes(loc)) {
      filters.location = loc;
      break;
    }
  }

  // Extract Property Type
  if (text.includes("apartment") || text.includes("flat")) {
    filters.propertyType = "Apartments";
  } else if (text.includes("villa") || text.includes("house")) {
    filters.propertyType = "Villa";
  } else if (text.includes("office") || text.includes("shop")) {
    filters.propertyType = "Office";
  }

  return filters;
}

/**
 * Scans last 5 user messages for historical context
 */
function extractMemory(history) {
  const lastFiveUserMsgs = history
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => m.content.toLowerCase());

  const mergedMemory = {
    bed: null,
    maxPrice: null,
    location: null,
    propertyType: null,
  };

  // Iterate chronologically so newer messages overwrite older ones in memory
  for (const msg of lastFiveUserMsgs) {
    const parsed = parseFilters(msg);
    if (parsed.bed) mergedMemory.bed = parsed.bed;
    if (parsed.maxPrice) mergedMemory.maxPrice = parsed.maxPrice;
    if (parsed.location) mergedMemory.location = parsed.location;
    if (parsed.propertyType) mergedMemory.propertyType = parsed.propertyType;
  }

  return mergedMemory;
}

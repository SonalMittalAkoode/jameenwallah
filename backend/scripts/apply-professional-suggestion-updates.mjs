import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient, ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(backendDir, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");
const outputRoot = path.resolve(repoDir, "database-exports");

const VILLA_PATTERN = /\b(?:villa|villas)\b/i;
const TINY_NUMBER = 100000;

const cleanText = (value = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();

const titleCase = (value = "") =>
  cleanText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\b(?:Mg|Nh|Dlf|M3m|Aipl|Ild|Sco|It)\b/gi, (match) => match.toUpperCase());

const getRefName = (value, map) => {
  if (!value) return "";
  if (typeof value === "object" && !ObjectId.isValid(value)) {
    return cleanText(value.name || value.title || value.label || "");
  }
  return cleanText(map.get(String(value)) || "");
};

const asNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const displayPrice = (price) => {
  const value = asNumber(price);
  if (!value || value < TINY_NUMBER) return "Price on request";
  if (value >= 10000000) {
    return `₹${Number((value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 2)).toLocaleString("en-IN")} Cr`;
  }
  return `₹${Number((value / 100000).toFixed(value % 100000 === 0 ? 0 : 2)).toLocaleString("en-IN")} Lakh`;
};

const displaySize = (property) => {
  const direct = asNumber(property?.details?.sizeInSqFt || property?.details?.totalAreaInSqFt);
  if (direct >= 100) return `${Math.round(direct).toLocaleString("en-IN")} sq.ft.`;
  const floorPlans = property?.description?.floorPlans || [];
  const sizes = floorPlans
    .map((item) => asNumber(item?.superBuiltUpArea || item?.builtUpArea || item?.carpetArea))
    .filter((value) => value >= 100);
  if (!sizes.length) return "";
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  if (min === max) return `${Math.round(min).toLocaleString("en-IN")} sq.ft.`;
  return `${Math.round(min).toLocaleString("en-IN")} - ${Math.round(max).toLocaleString("en-IN")} sq.ft.`;
};

const inferType = (property, refs) => {
  const currentType = getRefName(property?.description?.propertyType, refs.propertyTypesById);
  if (currentType) return currentType;
  const source = [
    property?.description?.inferredPropertyType,
    property?.description?.title,
    property?.description?.description,
    property?.description?.slug,
  ]
    .filter(Boolean)
    .join(" ");

  const rules = [
    [/office|workspace|it park|corporate/i, "Office Space"],
    [/retail|shop|showroom|high street/i, "Retail Shop"],
    [/restaurant|food court|fine.?dining|f&b/i, "Restaurant Space"],
    [/\bbank\b|banking/i, "Bank Space"],
    [/\bsco\b/i, "SCO"],
    [/warehouse|logistics/i, "Warehouse"],
    [/industrial/i, "Industrial Building"],
    [/plot|land/i, "Plot"],
    [/builder floor|independent floor|floor\b/i, "Builder Floor"],
    [/apartment|residence|flat|\bbhk\b/i, "Apartment"],
    [/farm house|farmhouse/i, "Farm House"],
    [/independent building/i, "Independent Building"],
  ];
  return rules.find(([pattern]) => pattern.test(source))?.[1] || cleanText(property?.description?.inferredPropertyType) || "Property";
};

const normalizeTypeLabel = (value = "") => {
  const label = cleanText(value);
  const aliases = new Map([
    ["Office Spaces", "Office Space"],
    ["Retail Spaces", "Retail Space"],
    ["Apartments", "Apartment"],
    ["Commercial SCO Plots", "SCO Plot"],
    ["Commercial Office Spaces", "Commercial Office Space"],
    ["Commercial Shops", "Commercial Shop"],
  ]);
  return aliases.get(label) || label.replace(/\bSpaces\b/i, "Space").replace(/\bApartments\b/i, "Apartment");
};

const statusLabel = (value = "") => {
  const text = cleanText(value);
  const aliases = new Map([
    ["ready to sell", "Ready to Sell"],
    ["ready to move", "Ready to Move"],
    ["under construction", "Under Construction"],
    ["new launch", "New Launch"],
    ["completed", "Completed"],
  ]);
  return aliases.get(text.toLowerCase()) || titleCase(text);
};

const inferCategory = (typeLabel, property, refs) => {
  const current = getRefName(property?.description?.category, refs.categoriesById);
  if (current) return current;
  const source = `${typeLabel} ${property?.description?.title || ""} ${property?.description?.description || ""}`;
  if (/plot|land/i.test(source)) return "Plots";
  if (/office|retail|shop|showroom|commercial|bank|restaurant|sco|warehouse|industrial|it park/i.test(source)) {
    return "Commercial";
  }
  return "Residential";
};

const resolveLocation = (property, refs) => {
  const area = getRefName(property?.location?.area, refs.areasById);
  const city = getRefName(property?.location?.city, refs.citiesById);
  const state = getRefName(property?.location?.state, refs.statesById);
  const address = cleanText(property?.location?.address || property?.location?.inferredAddress || "");
  const zip = cleanText(property?.location?.zip || "");
  const locationLabel = [area, city].filter(Boolean).join(", ") || city || area || "a prime NCR location";
  const addressParts = [address, area, city, state, zip].filter(Boolean);
  const fullAddress = [...new Set(addressParts)].join(", ");
  return { area, city, state, zip, address, locationLabel, fullAddress };
};

const amenityIdsFor = (property, typeLabel, categoryLabel, amenities) => {
  const validAmenityIds = new Set(amenities.map((item) => String(item._id)));
  const existing = Array.isArray(property.amenities)
    ? property.amenities
        .filter(Boolean)
        .filter((item) => validAmenityIds.has(String(item)))
    : [];
  if (existing.length >= 4) return existing;

  const source = `${typeLabel} ${categoryLabel} ${property?.description?.title || ""}`.toLowerCase();
  const wanted = new Set(["24x7 security with CCTV", "Power backup", "High-speed elevators"]);
  if (/office|it park|commercial|bank|sco/.test(source)) {
    ["Grade A office specifications", "Centralized air-conditioning", "Access control system", "High-speed internet backbone", "Building Management System", "Conference rooms", "Multi-level parking"].forEach((item) => wanted.add(item));
  }
  if (/retail|shop|showroom|restaurant|food/.test(source)) {
    ["High-street retail frontage", "Multi-level parking", "Food court", "Cafeteria", "EV charging stations", "Fire detection & suppression system"].forEach((item) => wanted.add(item));
  }
  if (/apartment|residential|builder floor|bhk|residence/.test(source)) {
    ["Fully-equipped clubhouse", "Landscaped gardens", "Kids’ play area", "Fully equipped gymnasium", "Jogging track", "Access control system"].forEach((item) => wanted.add(item));
  }
  if (/plot|land/.test(source)) {
    ["Gated Community", "Boundary Wall", "24x7 security with CCTV"].forEach((item) => wanted.add(item));
  }

  const byTitle = new Map(amenities.map((item) => [cleanText(item.title || item.name).toLowerCase(), item._id]));
  const selected = [...existing.map((item) => (ObjectId.isValid(item) ? item : item?._id)).filter(Boolean)];
  for (const title of wanted) {
    const id = byTitle.get(title.toLowerCase());
    if (id && !selected.some((value) => String(value) === String(id))) selected.push(id);
  }
  return selected.slice(0, 12);
};

const buildProfessionalDescription = ({ property, typeLabel, categoryLabel, location, builderName, amenityTitles }) => {
  const title = cleanText(property?.description?.title || "This property");
  const price = displayPrice(property?.description?.price);
  const size = displaySize(property);
  const status = cleanText(property?.details?.propertyStatus || property?.status || "");
  const ownership = cleanText(property?.details?.ownershipType || "");
  const nearby = cleanText(property?.location?.nearBy || "");
  const config = cleanText(property?.details?.bhk || property?.description?.configuration || "");
  const displayType = normalizeTypeLabel(typeLabel);
  const audience =
    categoryLabel === "Commercial"
      ? "brands, occupiers and investors"
      : categoryLabel === "Plots"
        ? "buyers and investors"
        : "homebuyers and investors";
  const intro = `${title} is a professionally curated ${displayType.toLowerCase()} listing in ${location.locationLabel}. ${builderName ? `Developed by ${builderName}, it ` : "It "}is positioned for ${audience} who want clear location visibility, practical specifications and a dependable NCR real estate advisory process.`;

  const facts = [
    price !== "Price on request" ? `The current pricing visibility is ${price}` : "Pricing is available on request",
    size ? `size visibility is ${size}` : "",
    config ? `configuration visibility includes ${config}` : "",
    status ? `status is ${statusLabel(status)}` : "",
    ownership ? `ownership is listed as ${ownership}` : "",
  ].filter(Boolean);

  const paragraphTwo = `Key listing details have been normalized for easier comparison: ${facts.join(", ")}. The page is maintained with independent review of price, size, possession, amenities, floor plans and SEO metadata so the public listing stays consistent with the admin database.`;

  const amenityLine = amenityTitles.length
    ? `Important amenities and specifications include ${amenityTitles.slice(0, 8).join(", ")}.`
    : "Amenities and specifications should be reviewed against the latest project inventory before final commercial discussion.";

  const locationLine = `${nearby ? `Connectivity highlights include ${nearby}. ` : ""}${location.fullAddress ? `The mapped address is ${location.fullAddress}. ` : ""}This gives users a clearer route, neighbourhood and micro-market context before enquiry.`;

  const categoryLine =
    categoryLabel === "Commercial"
      ? "For commercial users, the main evaluation points are frontage, access, parking, catchment quality, operational flexibility and long-term corridor demand."
      : categoryLabel === "Plots"
        ? "For plot buyers, the main evaluation points are location, access, development controls, neighbourhood growth and document verification."
        : "For residential buyers, the main evaluation points are configuration, liveability, possession visibility, builder credibility and everyday connectivity.";

  return [intro, paragraphTwo, `${amenityLine} ${locationLine}`, categoryLine].map(cleanText).join("\n\n");
};

const trimMeta = (value, max = 155) => {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

const run = async () => {
  await fs.mkdir(outputRoot, { recursive: true });
  const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
  const client = new MongoClient(runtime.mongoUri);
  await client.connect();
  const db = client.db(runtime.dbName || "bigCat");
  const [properties, propertyTypes, categories, cities, states, areas, builders, amenities] = await Promise.all([
    db.collection("properties").find({}).toArray(),
    db.collection("propertytypes").find({}).toArray(),
    db.collection("categories").find({}).toArray(),
    db.collection("cities").find({}).toArray(),
    db.collection("states").find({}).toArray(),
    db.collection("areas").find({}).toArray(),
    db.collection("builders").find({}).toArray(),
    db.collection("amenities").find({}).toArray(),
  ]);

  const refs = {
    propertyTypesById: new Map(propertyTypes.map((item) => [String(item._id), item.name || ""])),
    categoriesById: new Map(categories.map((item) => [String(item._id), item.name || ""])),
    citiesById: new Map(cities.map((item) => [String(item._id), item.name || ""])),
    statesById: new Map(states.map((item) => [String(item._id), item.name || ""])),
    areasById: new Map(areas.map((item) => [String(item._id), item.name || ""])),
    buildersById: new Map(builders.map((item) => [String(item._id), item.title || item.name || ""])),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    scanned: properties.length,
    softRemovedVillas: 0,
    updatedProperties: 0,
    fields: {},
    samples: [],
  };

  const amenityTitleById = new Map(amenities.map((item) => [String(item._id), item.title || item.name || ""]));

  for (const property of properties) {
    const source = [
      getRefName(property?.description?.propertyType, refs.propertyTypesById),
      property?.description?.title,
      property?.description?.slug,
      property?.description?.inferredPropertyType,
    ].filter(Boolean).join(" ");

    if (property.status === "verified" && VILLA_PATTERN.test(source)) {
      const result = await db.collection("properties").updateOne(
        { _id: property._id },
        {
          $set: {
            status: "pending",
            "internalReview.hiddenFromPublicReason": "Removed from active database listings: villa inventory excluded for production showcase.",
            "internalReview.hiddenFromPublicAt": new Date(),
            "internalReview.professionalSuggestionSource": "apply-professional-suggestion-updates",
          },
        }
      );
      if (result.modifiedCount) report.softRemovedVillas += 1;
      continue;
    }

    if (property.status !== "verified") continue;

    const typeLabel = normalizeTypeLabel(inferType(property, refs));
    const categoryLabel = inferCategory(typeLabel, property, refs);
    const location = resolveLocation(property, refs);
    const builderName = getRefName(property?.description?.builder, refs.buildersById);
    const nextAmenityIds = amenityIdsFor(property, typeLabel, categoryLabel, amenities);
    const amenityTitles = nextAmenityIds.map((id) => amenityTitleById.get(String(id))).filter(Boolean);
    const nextDescription = buildProfessionalDescription({
      property,
      typeLabel,
      categoryLabel,
      location,
      builderName,
      amenityTitles,
    });
    const title = cleanText(property?.description?.title || "Property");
    const metaTitle = trimMeta(`${title} | ${location.area || location.city || "NCR"} ${typeLabel} | JameenWallah`, 90);
    const metaDescription = trimMeta(
      `${title} in ${location.locationLabel}. View ${displayPrice(property?.description?.price)}, ${displaySize(property) || "latest size details"}, amenities, floor plans, address and enquiry support.`
    );
    const mapQuery = location.fullAddress || [title, location.locationLabel, "India"].filter(Boolean).join(", ");
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

    const set = {
      "description.description": nextDescription,
      "description.metaTitle": metaTitle,
      "description.metaDescription": metaDescription,
      "description.inferredPropertyType": typeLabel,
      "description.inferredCategory": categoryLabel,
      "location.mapQuery": mapQuery,
      "location.googleMapsUrl": googleMapsUrl,
      "internalReview.professionalSuggestionAppliedAt": new Date(),
      "internalReview.professionalSuggestionSource": "local-suggestion-service-derived-from-current-fields",
    };
    const unset = {};

    if (location.fullAddress) {
      set["location.inferredAddress"] = location.fullAddress;
      set["location.fullAddress"] = location.fullAddress;
    }
    if (nextAmenityIds.length && nextAmenityIds.length !== (property.amenities || []).length) {
      set.amenities = nextAmenityIds;
    }
    if (asNumber(property?.description?.price) > 0 && asNumber(property?.description?.price) < TINY_NUMBER) {
      unset["description.price"] = "";
      set["internalReview.priceCorrectionReason"] = "Removed impossible sub-100000 sale price during professional suggestion update.";
    }
    if (!cleanText(property?.description?.paymentPlan) || /admin to verify|click to open|undefined/i.test(property?.description?.paymentPlan || "")) {
      set["description.paymentPlan"] = "Not listed";
    }

    const changed = [];
    for (const [key, value] of Object.entries(set)) {
      const before = key.split(".").reduce((cursor, part) => cursor?.[part], property);
      const beforeComparable = Array.isArray(before) ? before.map(String).join("|") : cleanText(before);
      const afterComparable = Array.isArray(value) ? value.map(String).join("|") : cleanText(value);
      if (beforeComparable !== afterComparable) changed.push(key);
    }
    changed.push(...Object.keys(unset));
    if (!changed.length) continue;

    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    await db.collection("properties").updateOne({ _id: property._id }, update);
    report.updatedProperties += 1;
    for (const key of changed) report.fields[key] = (report.fields[key] || 0) + 1;
    if (report.samples.length < 20) {
      report.samples.push({
        _id: String(property._id),
        customId: property.details?.customId || property.customId || "",
        slug: property.description?.slug || "",
        title,
        changed,
      });
    }
  }

  const after = {
    verifiedProperties: await db.collection("properties").countDocuments({ status: "verified" }),
    verifiedVillaTextMatches: await db.collection("properties").countDocuments({
      status: "verified",
      $or: [
        { "description.title": VILLA_PATTERN },
        { "description.slug": VILLA_PATTERN },
        { "description.inferredPropertyType": VILLA_PATTERN },
      ],
    }),
    tinyPrices: await db.collection("properties").countDocuments({
      status: "verified",
      "description.price": { $gt: 0, $lt: TINY_NUMBER },
    }),
    missingAmenities: await db.collection("properties").countDocuments({
      status: "verified",
      $or: [{ amenities: { $exists: false } }, { amenities: { $size: 0 } }],
    }),
    missingMaps: await db.collection("properties").countDocuments({
      status: "verified",
      $or: [{ "location.googleMapsUrl": { $exists: false } }, { "location.googleMapsUrl": "" }],
    }),
  };
  report.after = after;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportDir = path.join(outputRoot, `professional-suggestion-update-${timestamp}`);
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(path.join(reportDir, "professional_suggestion_update_report.json"), JSON.stringify(report, null, 2));
  await fs.writeFile(
    path.join(reportDir, "professional_suggestion_update_samples.csv"),
    [
      "_id,customId,slug,title,changedFields",
      ...report.samples.map((sample) =>
        [sample._id, sample.customId, sample.slug, sample.title, sample.changed.join("; ")]
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n")
  );

  await client.close();
  console.log(JSON.stringify({ reportDir, ...report }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

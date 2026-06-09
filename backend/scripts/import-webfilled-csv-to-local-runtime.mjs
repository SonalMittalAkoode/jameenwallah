import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EJSON, ObjectId } from "bson";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(backendDir, "..");
const runtimeFile = path.join(backendDir, ".local-stack-runtime.json");
const defaultImportDir = path.join(
  repoDir,
  "local-imports/final-merged-1674-plus-builder-db-webfilled"
);
const mongoCsvPath =
  process.argv[2] || path.join(defaultImportDir, "combined_jameenwallah_mongo_export_2161_webfilled.csv");
const sourceCsvPath =
  process.argv[3] || path.join(defaultImportDir, "combined_sale_only_all_properties_2161_webfilled.csv");

const VALID_PROPERTY_STATUSES = new Set(["pending", "verified", "assigned", "rejected", "sold"]);
const VALID_PARKING = new Set([
  "Open",
  "Covered",
  "Reserved",
  "Visitor",
  "Basement",
  "Street",
  "Truck",
  "Not Available",
]);
const VALID_FACING = new Set([
  "north",
  "south",
  "east",
  "west",
  "north-east",
  "north-west",
  "south-east",
  "south-west",
]);
const VALID_FURNISHING = new Set(["Furnished", "Semi-Furnished", "Unfurnished"]);
const VALID_OWNERSHIP = new Set([
  "Freehold",
  "Leasehold",
  "Co-operative",
  "Share of Freehold",
  "Government Lease",
  "Pending",
]);
const VALID_PROPERTY_STATUS = new Set([
  "Ready to Move",
  "Under Construction",
  "Completed",
  "New Launch",
  "Delayed",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((entry) => entry.length && entry.some((value) => String(value || "").trim()))
    .map((entry) =>
      Object.fromEntries(headers.map((header, index) => [header, entry[index] ?? ""]))
    );
}

function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "item";
}

function uniqueRefSlug(name, id) {
  return slugify(`${name}-${String(id).slice(-6)}`);
}

function clean(value) {
  const text = String(value ?? "").trim();
  if (!text || /^n\/a$/i.test(text) || /^null$/i.test(text) || /^undefined$/i.test(text)) return "";
  return text;
}

function asObjectId(value) {
  const text = clean(value);
  return /^[0-9a-fA-F]{24}$/.test(text) ? new ObjectId(text) : null;
}

function asNumber(value) {
  const text = clean(value);
  if (!text) return undefined;
  const number = Number(String(text).replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : undefined;
}

function asInteger(value) {
  const number = asNumber(value);
  return number === undefined ? undefined : Math.trunc(number);
}

function asDate(value) {
  const text = clean(value);
  if (!text) return new Date();
  const date = new Date(text.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function pickEnum(value, validValues, fallback = undefined) {
  const text = clean(value);
  if (!text) return fallback;
  if (validValues.has(text)) return text;
  const normalized = text
    .replace(/^ready to sell$/i, "Ready to Move")
    .replace(/^semi furnished$/i, "Semi-Furnished")
    .replace(/^not available$/i, "Not Available");
  return validValues.has(normalized) ? normalized : fallback;
}

function parseIdList(value) {
  return clean(value)
    .split("|")
    .map((entry) => asObjectId(entry))
    .filter(Boolean);
}

function parseMaybeJsonArray(value) {
  const text = clean(value);
  if (!text) return [];
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed = EJSON.parse(text, { relaxed: false });
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }
  return text
    .split("|")
    .map((entry) => clean(entry))
    .filter(Boolean);
}

function propertyFromRow(row) {
  const id = asObjectId(row._id);
  if (!id) throw new Error(`Invalid _id for row ${row.customId || row.slug}`);

  const category = asObjectId(row.category_id);
  const propertyType = asObjectId(row.propertyType_id);
  const builder = asObjectId(row.builder_id);
  const state = asObjectId(row.state_id);
  const city = asObjectId(row.city_id);
  const area = asObjectId(row.area_id);
  const images = [1, 2, 3, 4, 5]
    .map((index) => clean(row[`image_url_${index}`]))
    .filter(Boolean);
  const floorPlanImages = parseMaybeJsonArray(row.floorPlanImages).filter((item) => typeof item === "string");
  const floorPlans = parseMaybeJsonArray(row.floorPlans).map((plan) => {
    if (!plan || typeof plan !== "object") return plan;
    return {
      ...plan,
      superBuiltUpArea: asNumber(plan.superBuiltUpArea),
    };
  }).filter((plan) => plan && typeof plan === "object");
  const details = {
    customId: clean(row.customId),
    sizeInSqFt: asNumber(row.sizeInSqFt),
    totalAreaInSqFt: asNumber(row.totalAreaInSqFt),
    rooms: asInteger(row.rooms),
    bedrooms: asInteger(row.bedrooms),
    bathrooms: clean(row.bathrooms),
    bhk: clean(row.bhk),
    parking: pickEnum(row.parking, VALID_PARKING),
    numberOfParkings: asInteger(row.numberOfParkings),
    totalFloors: asInteger(row.totalFloors),
    totalTowers: asInteger(row.totalTowers),
    possessionDate: clean(row.possessionDate),
    completionDate: clean(row.completionDate),
    basement: clean(row.basement),
    balcony: asInteger(row.balcony),
    facing: pickEnum(String(row.facing || "").toLowerCase(), VALID_FACING),
    furnishingStatus: pickEnum(row.furnishingStatus, VALID_FURNISHING),
    ownershipType: pickEnum(row.ownershipType, VALID_OWNERSHIP),
    propertyStatus: pickEnum(row.propertyStatus, VALID_PROPERTY_STATUS),
  };

  Object.keys(details).forEach((key) => details[key] === undefined && delete details[key]);

  const status = pickEnum(row.status, VALID_PROPERTY_STATUSES, "verified");

  return {
    _id: id,
    personalDetails: {
      name: clean(row.personal_name),
      email: clean(row.personal_email),
      phoneNumber: clean(row.personal_phoneNumber),
    },
    description: {
      title: clean(row.title),
      slug: clean(row.slug).toLowerCase(),
      metaTitle: clean(row.metaTitle),
      metaDescription: clean(row.metaDescription),
      description: clean(row.description),
      category,
      propertyType,
      builder,
      price: asNumber(row.price),
      paymentPlan: clean(row.paymentPlan),
      reraApproved: pickEnum(row.reraApproved, new Set(["Yes", "No"])),
      reraNumber: clean(row.reraNumber),
      featuredProperty: pickEnum(row.featuredProperty, new Set(["Yes", "No"])),
      floorPlans,
    },
    media: {
      images,
      floorPlanImages,
      videoLink: clean(row.videoLink),
      virtualTour: clean(row.virtualTour),
      sitePlanImage: clean(row.sitePlanImage),
      masterPlanImage: clean(row.masterPlanImage),
    },
    location: {
      address: clean(row.address),
      state,
      city,
      area,
      zip: clean(row.zip),
      nearBy: clean(row.nearBy),
      mapEmbedCode: clean(row.mapEmbedCode),
    },
    details,
    amenities: parseIdList(row.amenities),
    externalSource: {
      googleMapsPlaceId: clean(row.googleMapsPlaceId),
      googleMapsPlaceName: clean(row.googleMapsPlaceName),
      googleMapsPlaceAddress: clean(row.googleMapsPlaceAddress),
      googleMapsUrl: clean(row.googleMapsUrl),
      importedFrom: "final-merged-1674-plus-builder-db-webfilled",
    },
    createdBy: "admin",
    status,
    rejectionReason: null,
    assignedAgent: [],
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function sourceMap(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const id = clean(row.mongo_id);
    if (id) map.set(id, row);
  });
  return map;
}

function refDocs(properties, sourceById) {
  const refs = {
    categories: new Map(),
    propertytypes: new Map(),
    builders: new Map(),
    states: new Map(),
    cities: new Map(),
  };

  properties.forEach((property) => {
    const source = sourceById.get(String(property._id)) || {};
    const categoryId = property.description.category;
    if (categoryId) {
      const name = clean(source.category) || "Imported";
      refs.categories.set(String(categoryId), {
        _id: categoryId,
        name,
        slug: uniqueRefSlug(name, categoryId),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const typeId = property.description.propertyType;
    if (typeId) {
      const name = clean(source.property_type) || "Imported Property Type";
      refs.propertytypes.set(String(typeId), {
        _id: typeId,
        name,
        category: categoryId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const builderId = property.description.builder;
    if (builderId) {
      const title = clean(source.builder_name) || "Independent";
      refs.builders.set(String(builderId), {
        _id: builderId,
        title,
        slug: uniqueRefSlug(title, builderId),
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const stateId = property.location.state;
    if (stateId) {
      const name = clean(source.state) || "Haryana";
      refs.states.set(String(stateId), {
        _id: stateId,
        name,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const cityId = property.location.city;
    if (cityId) {
      const name = clean(source.city) || "Gurgaon";
      refs.cities.set(String(cityId), {
        _id: cityId,
        name,
        state: stateId,
        status: "active",
        isTrending: "deactive",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return refs;
}

async function upsertRefCollection(db, collectionName, docs) {
  if (!docs.length) return { collectionName, upserted: 0 };
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));
  const result = await db.collection(collectionName).bulkWrite(ops, { ordered: false });
  return { collectionName, upserted: result.upsertedCount || 0 };
}

const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
const [mongoCsv, sourceCsv] = await Promise.all([
  fs.readFile(mongoCsvPath, "utf8"),
  fs.readFile(sourceCsvPath, "utf8"),
]);
const rows = parseCsv(mongoCsv);
const sourceRows = parseCsv(sourceCsv);
const properties = rows.map(propertyFromRow);
const sourceById = sourceMap(sourceRows);
const refs = refDocs(properties, sourceById);

const client = new MongoClient(runtime.mongoUri);
await client.connect();
const db = client.db(runtime.dbName || "bigCat");

const propertyCollection = db.collection("properties");
await propertyCollection.deleteMany({});
if (properties.length) {
  await propertyCollection.insertMany(properties, { ordered: false });
}

const refResults = [];
for (const [collectionName, docsById] of Object.entries(refs)) {
  refResults.push(await upsertRefCollection(db, collectionName, [...docsById.values()]));
}

await client.close();

const statusCounts = properties.reduce((acc, property) => {
  acc[property.status] = (acc[property.status] || 0) + 1;
  return acc;
}, {});
const imageCounts = properties.reduce((acc, property) => {
  const key = String(property.media.images.length);
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log(
  JSON.stringify(
    {
      importedProperties: properties.length,
      mongoCsvPath,
      sourceCsvPath,
      statusCounts,
      imageCounts,
      refs: refResults,
    },
    null,
    2
  )
);

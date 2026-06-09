import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deserialize } from "bson";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir =
  process.argv[2] ||
  path.resolve(__dirname, "../../../tmp-bigcat-backup/bigCat");
const outputFile =
  process.argv[3] ||
  path.resolve(__dirname, "../src/data/aiSuggestionStagingDataset.json");

const collectionNames = [
  "properties",
  "categories",
  "propertytypes",
  "builders",
  "cities",
  "states",
  "areas",
  "amenities",
];

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.toHexString === "function") return value.toHexString();
  return String(value);
}

function normalizeValue(value) {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (typeof value?.toHexString === "function") return value.toHexString();
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
    );
  }
  return value;
}

async function readCollection(name) {
  const filePath = path.join(sourceDir, `${name}.bson`);
  const buffer = await fs.readFile(filePath);
  const docs = [];
  let offset = 0;

  while (offset < buffer.length) {
    const size = buffer.readInt32LE(offset);
    const slice = buffer.subarray(offset, offset + size);
    docs.push(normalizeValue(deserialize(slice)));
    offset += size;
  }

  return docs;
}

function indexById(list) {
  return new Map(list.map((item) => [normalizeId(item._id), item]));
}

function pickObject(source, keys) {
  return Object.fromEntries(
    keys
      .filter((key) => source?.[key] !== undefined && source?.[key] !== null)
      .map((key) => [key, source[key]])
  );
}

function resolveRef(map, value, projector) {
  const record = map.get(normalizeId(value));
  if (!record) return value || "";
  return projector(record);
}

function resolveArea(areaMap, property) {
  const rawArea = property?.location?.area;
  if (!rawArea) return undefined;
  return resolveRef(areaMap, rawArea, (item) =>
    pickObject(item, ["_id", "name", "city", "status"])
  );
}

function mapProperty(property, lookups) {
  const {
    categoryMap,
    propertyTypeMap,
    builderMap,
    cityMap,
    stateMap,
    areaMap,
    amenityMap,
  } = lookups;

  const amenityNames = Array.isArray(property.amenities)
    ? property.amenities
        .map((id) => amenityMap.get(normalizeId(id))?.name)
        .filter(Boolean)
    : [];

  return {
    _id: normalizeId(property._id),
    status: property.status || "verified",
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    description: {
      ...pickObject(property.description, [
        "title",
        "slug",
        "metaTitle",
        "metaDescription",
        "description",
        "price",
        "paymentPlan",
        "reraApproved",
        "reraNumber",
        "featuredProperty",
      ]),
      category: resolveRef(categoryMap, property.description?.category, (item) =>
        pickObject(item, ["_id", "name", "slug"])
      ),
      propertyType: resolveRef(
        propertyTypeMap,
        property.description?.propertyType,
        (item) => pickObject(item, ["_id", "name", "category"])
      ),
      builder: resolveRef(builderMap, property.description?.builder, (item) =>
        pickObject(item, ["_id", "title", "slug"])
      ),
      floorPlans: Array.isArray(property.description?.floorPlans)
        ? property.description.floorPlans.map((plan) =>
            pickObject(plan, [
              "_id",
              "unitType",
              "carpetArea",
              "builtUpArea",
              "superBuiltUpArea",
              "price",
              "image",
            ])
          )
        : [],
    },
    media: {
      ...pickObject(property.media, [
        "videoLink",
        "virtualTour",
        "sitePlanImage",
        "masterPlanImage",
      ]),
      images: Array.isArray(property.media?.images)
        ? property.media.images.slice(0, 6)
        : [],
      floorPlanImages: Array.isArray(property.media?.floorPlanImages)
        ? property.media.floorPlanImages.slice(0, 6)
        : [],
    },
    location: {
      ...pickObject(property.location, ["address", "zip", "nearBy", "mapEmbedCode"]),
      state: resolveRef(stateMap, property.location?.state, (item) =>
        pickObject(item, ["_id", "name"])
      ),
      city: resolveRef(cityMap, property.location?.city, (item) =>
        pickObject(item, ["_id", "name", "image"])
      ),
      area: resolveArea(areaMap, property),
    },
    details: pickObject(property.details, [
      "sizeInSqFt",
      "bhk",
      "bathrooms",
      "customId",
      "parking",
      "totalFloors",
      "totalTowers",
      "possessionDate",
      "completionDate",
      "basement",
      "balcony",
      "facing",
      "furnishingStatus",
      "ownershipType",
      "propertyStatus",
      "shellStatus",
      "washroomAvailability",
      "pantryAvailability",
    ]),
    amenities: amenityNames,
    personalDetails: pickObject(property.personalDetails, ["name", "email"]),
  };
}

async function main() {
  const collections = Object.fromEntries(
    await Promise.all(
      collectionNames.map(async (name) => [name, await readCollection(name)])
    )
  );

  const lookups = {
    categoryMap: indexById(collections.categories),
    propertyTypeMap: indexById(collections.propertytypes),
    builderMap: indexById(collections.builders),
    cityMap: indexById(collections.cities),
    stateMap: indexById(collections.states),
    areaMap: indexById(collections.areas),
    amenityMap: indexById(collections.amenities),
  };

  const dataset = collections.properties.map((property) =>
    mapProperty(property, lookups)
  );

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(dataset, null, 2));
  console.log(
    `Generated ${dataset.length} serverless AI staging records at ${outputFile}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");

const VILLA_PATTERN = /\b(?:villa|villas)\b/i;

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value.name || value.title || "";
  return String(value);
};

const isVillaLike = (property, propertyTypesById = new Map()) => {
  const propertyTypeId = String(property?.description?.propertyType || "");
  const propertyTypeName = propertyTypesById.get(propertyTypeId) || getName(property?.description?.propertyType);
  const source = [
    propertyTypeName,
    property?.description?.inferredPropertyType,
    property?.description?.title,
    property?.description?.slug,
    property?.description?.description,
  ]
    .filter(Boolean)
    .join(" ");

  return VILLA_PATTERN.test(source);
};

const run = async () => {
  const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
  const client = new MongoClient(runtime.mongoUri);
  await client.connect();

  const db = client.db("bigCat");
  const propertyTypes = await db.collection("propertytypes").find({}).toArray();
  const propertyTypesById = new Map(propertyTypes.map((item) => [String(item._id), item.name || ""]));
  const properties = await db.collection("properties").find({}).toArray();

  const villaIds = properties
    .filter((property) => property.status === "verified" && isVillaLike(property, propertyTypesById))
    .map((property) => property._id);

  let modifiedCount = 0;
  if (villaIds.length) {
    const result = await db.collection("properties").updateMany(
      { _id: { $in: villaIds } },
      {
        $set: {
          status: "pending",
          "internalReview.hiddenFromPublicReason": "Removed from public listings: villa inventory excluded by local QA policy.",
          "internalReview.hiddenFromPublicAt": new Date(),
        },
      }
    );
    modifiedCount = result.modifiedCount || 0;
  }

  const remainingVerifiedVillaCount = await db.collection("properties").countDocuments({
    status: "verified",
    $or: [
      { "description.title": VILLA_PATTERN },
      { "description.slug": VILLA_PATTERN },
      { "description.description": VILLA_PATTERN },
      { "description.inferredPropertyType": VILLA_PATTERN },
    ],
  });

  await client.close();

  console.log(
    JSON.stringify(
      {
        scanned: properties.length,
        villaRecordsMatched: villaIds.length,
        modifiedCount,
        remainingVerifiedVillaTextMatches: remainingVerifiedVillaCount,
      },
      null,
      2
    )
  );
};

await run();

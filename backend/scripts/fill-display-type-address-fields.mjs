import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongodb from "mongodb";

const { MongoClient } = mongodb;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const EMPTY_TEXT_PATTERN = /^(?:n\/?a|na|none|null|undefined|not listed|not specified|property type not specified|location not specified)$/i;

const cleanText = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text || EMPTY_TEXT_PATTERN.test(text) || OBJECT_ID_PATTERN.test(text)) return "";
  return text;
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "object") return cleanText(value.name || value.title || value.label);
  return cleanText(value);
};

const titleText = (property) => cleanText(property?.description?.title || property?.title);

const searchText = (property) =>
  [
    titleText(property),
    property?.description?.description,
    property?.details?.bhk,
    getName(property?.description?.category),
    getName(property?.description?.propertyType),
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const idText = (value) => {
  if (!value) return "";
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const lookupName = (map, value) => map.get(idText(value)) || "";

const inferPropertyType = (property, propertyTypesById = new Map()) => {
  const mappedType = lookupName(propertyTypesById, property?.description?.propertyType);
  const explicit = mappedType || getName(property?.description?.propertyType) || cleanText(property?.propertyType);
  if (explicit) return explicit;

  const existingInferred = cleanText(property?.description?.inferredPropertyType);
  if (existingInferred) return existingInferred;

  const source = searchText(property);
  if (/\b(?:sco|shop-cum-office)\b/i.test(source)) return "SCO";
  if (/\b(?:office|workspace|it park|business park)\b/i.test(source)) return "Office Space";
  if (/\b(?:shop|retail|showroom|mall|high street)\b/i.test(source)) return "Retail Shop";
  if (/\brestaurant|food court|f&b|fnb\b/i.test(source)) return "Restaurant Space";
  if (/\bbank\b/i.test(source)) return "Bank Space";
  if (/\bwarehouse|industrial|factory\b/i.test(source)) return "Industrial Property";
  if (/\bplot|plots\b/i.test(source)) return "Plot";
  if (/\bfarm\s*house\b/i.test(source)) return "Farm House";
  if (/\bvilla\b/i.test(source)) return "Villa";
  if (/\bpenthouse\b/i.test(source)) return "Penthouse";
  if (/\bbuilder\s*floors?|independent\s*floors?|floors?\b/i.test(source)) return "Builder Floor";
  if (/\b(?:apartment|flat|residence|residential|bhk)\b/i.test(source)) return "Apartment";
  if (/\bcommercial\b/i.test(source)) return "Commercial Space";
  return "Property";
};

const inferCategory = (property, propertyType, categoriesById = new Map()) => {
  const mappedCategory = lookupName(categoriesById, property?.description?.category);
  const explicit = mappedCategory || getName(property?.description?.category);
  if (explicit) return explicit;

  const existingInferred = cleanText(property?.description?.inferredCategory);
  if (existingInferred) return existingInferred;

  const source = `${propertyType} ${searchText(property)}`;
  if (/\b(?:office|retail|shop|showroom|sco|commercial|bank|warehouse|industrial|restaurant|food court|it park)\b/i.test(source)) {
    return "Commercial";
  }
  if (/\b(?:plot|plots)\b/i.test(source)) return "Plots";
  if (/\b(?:apartment|flat|residence|residential|bhk|villa|penthouse|floor|farm house)\b/i.test(source)) {
    return "Residential";
  }
  return "Property";
};

const cityAliases = {
  gurgaon: "Gurugram",
  gurugram: "Gurugram",
  delhi: "Delhi",
  noida: "Noida",
  goa: "Goa",
  mumbai: "Mumbai",
  thane: "Thane",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  lucknow: "Lucknow",
};

const stateForCity = {
  Gurugram: "Haryana",
  Noida: "Uttar Pradesh",
  Delhi: "Delhi",
  Goa: "Goa",
  Mumbai: "Maharashtra",
  Thane: "Maharashtra",
  Bengaluru: "Karnataka",
  Lucknow: "Uttar Pradesh",
};

const inferAddressFromText = (property) => {
  const source = [titleText(property), property?.description?.description].map(cleanText).join(" ");
  const sector = source.match(/\bsector[\s-]*([0-9]{1,3}[a-z]?)\b/i)?.[0]?.replace(/\s+/g, " ");
  const cityMatch = Object.keys(cityAliases).find((cityName) =>
    new RegExp(`\\b${cityName}\\b`, "i").test(source)
  );
  const city = cityMatch ? cityAliases[cityMatch] : "";
  const state = city ? stateForCity[city] : "";
  if (sector && city) return [sector, city, state, "India"].filter(Boolean).join(", ");
  if (city) return [city, state, "India"].filter(Boolean).join(", ");
  const title = titleText(property);
  return title ? `${title}, India` : "";
};

const directionsUrl = (query) =>
  query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : "";

const set = (update, key, value) => {
  if (cleanText(value)) update.$set[key] = value;
};

const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
const client = new MongoClient(runtime.mongoUri);
await client.connect();

const db = client.db(runtime.dbName || "bigCat");
const properties = db.collection("properties");
const propertyTypes = await db.collection("propertytypes").find({}).toArray();
const categories = await db.collection("categories").find({}).toArray();
const propertyTypesById = new Map(propertyTypes.map((item) => [String(item._id), cleanText(item.name)]));
const categoriesById = new Map(categories.map((item) => [String(item._id), cleanText(item.name)]));
const cursor = properties.find({});

let scanned = 0;
let updated = 0;
let typeFilled = 0;
let categoryFilled = 0;
let addressFilled = 0;
let mapsFilled = 0;

for await (const property of cursor) {
  scanned += 1;
  const inferredPropertyType = inferPropertyType(property, propertyTypesById);
  const inferredCategory = inferCategory(property, inferredPropertyType, categoriesById);
  const bestAddress =
    cleanText(property?.location?.address) ||
    cleanText(property?.externalSource?.googleMapsPlaceAddress) ||
    cleanText(property?.location?.inferredAddress) ||
    inferAddressFromText(property);
  const mapQuery =
    cleanText(property?.location?.mapQuery) ||
    bestAddress ||
    titleText(property);
  const bestMapsUrl = directionsUrl(mapQuery);

  const update = { $set: {} };
  if (cleanText(property?.description?.inferredPropertyType) !== inferredPropertyType) {
    set(update, "description.inferredPropertyType", inferredPropertyType);
    typeFilled += 1;
  }
  if (cleanText(property?.description?.inferredCategory) !== inferredCategory) {
    set(update, "description.inferredCategory", inferredCategory);
    categoryFilled += 1;
  }
  if (!cleanText(property?.location?.address)) {
    set(update, "location.address", bestAddress);
    addressFilled += 1;
  }
  set(update, "location.inferredAddress", bestAddress);
  set(update, "location.mapQuery", mapQuery);
  set(update, "location.googleMapsUrl", bestMapsUrl);
  if (cleanText(mapQuery) || cleanText(bestMapsUrl)) mapsFilled += 1;

  if (Object.keys(update.$set).length) {
    await properties.updateOne({ _id: property._id }, update);
    updated += 1;
  }
}

await client.close();

console.log(
  JSON.stringify(
    { scanned, updated, typeFilled, categoryFilled, addressFilled, mapsFilled },
    null,
    2
  )
);

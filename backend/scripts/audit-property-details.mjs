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
const PLACEHOLDER_PATTERN =
  /\b(?:n\/a|na|unknown|undefined|null|click to open|admin to verify|to verify|not updated|test data)\b/i;
const GOOGLE_IMAGE_PATTERN = /^https:\/\/lh3\.googleusercontent\.com\//i;
const FIRST_PARTY_PLACE_IMAGE_PATTERN = /^\/api\/place-photo\?placeId=/i;

const text = (value = "") => String(value || "").replace(/\s+/g, " ").trim();
const num = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};
const isObjectIdLike = (value) => ObjectId.isValid(String(value || ""));

const add = (issues, severity, field, message, value = "") => {
  issues.push({ severity, field, message, value: typeof value === "string" ? value.slice(0, 240) : value });
};

const makeCsv = (rows) => {
  const headers = ["_id", "customId", "slug", "title", "status", "severity", "field", "message", "value"];
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
};

const run = async () => {
  await fs.mkdir(outputRoot, { recursive: true });
  const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
  const client = new MongoClient(runtime.mongoUri);
  await client.connect();
  const db = client.db(runtime.dbName || "bigCat");

  const [properties, propertyTypes, categories, amenities, cities, states, areas, builders] = await Promise.all([
    db.collection("properties").find({}).toArray(),
    db.collection("propertytypes").find({}).toArray(),
    db.collection("categories").find({}).toArray(),
    db.collection("amenities").find({}).toArray(),
    db.collection("cities").find({}).toArray(),
    db.collection("states").find({}).toArray(),
    db.collection("areas").find({}).toArray(),
    db.collection("builders").find({}).toArray(),
  ]);

  const refSets = {
    propertyType: new Set(propertyTypes.map((item) => String(item._id))),
    category: new Set(categories.map((item) => String(item._id))),
    amenity: new Set(amenities.map((item) => String(item._id))),
    city: new Set(cities.map((item) => String(item._id))),
    state: new Set(states.map((item) => String(item._id))),
    area: new Set(areas.map((item) => String(item._id))),
    builder: new Set(builders.map((item) => String(item._id))),
  };

  const duplicateCustomIds = new Map();
  const duplicateSlugs = new Map();
  for (const property of properties) {
    const customId = text(property?.details?.customId || property?.customId);
    const slug = text(property?.description?.slug);
    if (customId) duplicateCustomIds.set(customId, (duplicateCustomIds.get(customId) || 0) + 1);
    if (slug) duplicateSlugs.set(slug, (duplicateSlugs.get(slug) || 0) + 1);
  }

  const issueRows = [];
  const cleanRows = [];
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  const byField = {};

  for (const property of properties) {
    const issues = [];
    const title = text(property?.description?.title);
    const slug = text(property?.description?.slug);
    const customId = text(property?.details?.customId || property?.customId);
    const status = text(property?.status);
    const isVerified = status === "verified";
    const description = text(property?.description?.description);
    const metaTitle = text(property?.description?.metaTitle);
    const metaDescription = text(property?.description?.metaDescription);
    const type = property?.description?.propertyType;
    const category = property?.description?.category;
    const builder = property?.description?.builder;
    const images = Array.isArray(property?.media?.images) ? property.media.images.filter(Boolean) : [];
    const propertyTypeText = text(property?.description?.inferredPropertyType);
    const hardVillaSource = [title, slug, propertyTypeText].join(" ");

    if (!customId) add(issues, "critical", "details.customId", "Missing property custom ID");
    else if (duplicateCustomIds.get(customId) > 1) add(issues, "medium", "details.customId", "Duplicate custom ID; kept unchanged per instruction", customId);

    if (!slug) add(issues, "critical", "description.slug", "Missing slug");
    else if (duplicateSlugs.get(slug) > 1) add(issues, "high", "description.slug", "Duplicate slug can break public route identity", slug);

    if (!title) add(issues, "critical", "description.title", "Missing title");
    if (title && PLACEHOLDER_PATTERN.test(title)) add(issues, "high", "description.title", "Title contains placeholder text", title);
    if (isVerified && VILLA_PATTERN.test(hardVillaSource)) add(issues, "critical", "villa-removal", "Verified listing still appears to be villa inventory", hardVillaSource);

    if (!description || description.length < 220) add(issues, isVerified ? "high" : "medium", "description.description", "Description is missing or too short", description);
    if (description && PLACEHOLDER_PATTERN.test(description)) add(issues, "medium", "description.description", "Description contains internal placeholder text", description.match(PLACEHOLDER_PATTERN)?.[0] || "");

    if (!metaTitle || metaTitle.length < 20) add(issues, "medium", "description.metaTitle", "SEO title is missing or too short", metaTitle);
    if (metaTitle.length > 95) add(issues, "low", "description.metaTitle", "SEO title is long and may truncate", metaTitle);
    if (!metaDescription || metaDescription.length < 70) add(issues, "medium", "description.metaDescription", "SEO description is missing or too short", metaDescription);
    if (metaDescription.length > 170) add(issues, "low", "description.metaDescription", "SEO description is long and may truncate", metaDescription);

    if (!type || !isObjectIdLike(type) || !refSets.propertyType.has(String(type))) add(issues, "high", "description.propertyType", "Missing or invalid property type reference", String(type || ""));
    if (!category || !isObjectIdLike(category) || !refSets.category.has(String(category))) add(issues, "high", "description.category", "Missing or invalid category reference", String(category || ""));
    if (builder && (!isObjectIdLike(builder) || !refSets.builder.has(String(builder)))) add(issues, "low", "description.builder", "Builder reference does not resolve", String(builder || ""));
    if (!propertyTypeText) add(issues, "low", "description.inferredPropertyType", "Missing normalized display property type");
    if (!text(property?.description?.inferredCategory)) add(issues, "low", "description.inferredCategory", "Missing normalized display category");

    const price = num(property?.description?.price);
    if (isVerified && price > 0 && price < 100000) add(issues, "high", "description.price", "Suspicious tiny price value", price);
    const size = num(property?.details?.sizeInSqFt);
    if (isVerified && size > 0 && size < 100) add(issues, "high", "details.sizeInSqFt", "Suspicious tiny area value", size);
    const totalArea = num(property?.details?.totalAreaInSqFt);
    if (isVerified && totalArea > 0 && totalArea < 100) add(issues, "high", "details.totalAreaInSqFt", "Suspicious tiny total area value", totalArea);

    const location = property?.location || {};
    if (!text(location.address) && !text(location.inferredAddress) && isVerified) add(issues, "high", "location.address", "Missing visible address");
    if (!text(location.googleMapsUrl)) add(issues, "medium", "location.googleMapsUrl", "Missing Google Maps URL");
    if (text(location.googleMapsUrl) && !/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/i.test(location.googleMapsUrl)) {
      add(issues, "low", "location.googleMapsUrl", "Maps URL does not use exact search format", location.googleMapsUrl);
    }
    if (location.city && (!isObjectIdLike(location.city) || !refSets.city.has(String(location.city)))) add(issues, "medium", "location.city", "City reference does not resolve", String(location.city));
    if (location.state && (!isObjectIdLike(location.state) || !refSets.state.has(String(location.state)))) add(issues, "medium", "location.state", "State reference does not resolve", String(location.state));
    if (location.area && (!isObjectIdLike(location.area) || !refSets.area.has(String(location.area)))) add(issues, "low", "location.area", "Area reference does not resolve", String(location.area));

    const amenityIds = Array.isArray(property.amenities) ? property.amenities.filter(Boolean) : [];
    if (isVerified && !amenityIds.length) add(issues, "high", "amenities", "Verified listing has no amenities");
    const invalidAmenities = amenityIds.filter((id) => !isObjectIdLike(id) || !refSets.amenity.has(String(id)));
    if (invalidAmenities.length) add(issues, "medium", "amenities", "Amenities include invalid references", invalidAmenities.map(String).join("; "));

    if (isVerified && !images.length) add(issues, "high", "media.images", "Verified listing has no images");
    const invalidImages = images.filter((url) => {
      const value = String(url || "");
      return !/^https?:\/\//i.test(value) && !FIRST_PARTY_PLACE_IMAGE_PATTERN.test(value);
    });
    if (invalidImages.length) add(issues, "medium", "media.images", "Images include non-URL values", invalidImages.join("; "));
    if (images.length > 0 && images.every((url) => GOOGLE_IMAGE_PATTERN.test(String(url)))) {
      add(issues, "low", "media.images", "Images are Google-hosted only; visually review for property accuracy", `${images.length} image(s)`);
    }

    if (!issues.length) {
      cleanRows.push({ _id: String(property._id), customId, slug, title, status });
    }

    for (const issue of issues) {
      bySeverity[issue.severity] += 1;
      byField[issue.field] = (byField[issue.field] || 0) + 1;
      issueRows.push({
        _id: String(property._id),
        customId,
        slug,
        title,
        status,
        ...issue,
      });
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportDir = path.join(outputRoot, `property-detail-audit-${timestamp}`);
  await fs.mkdir(reportDir, { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    scanned: properties.length,
    cleanProperties: cleanRows.length,
    issueProperties: new Set(issueRows.map((row) => row._id)).size,
    issueCount: issueRows.length,
    bySeverity,
    byField,
    duplicateCustomIdGroups: [...duplicateCustomIds.entries()].filter(([, count]) => count > 1),
    duplicateSlugGroups: [...duplicateSlugs.entries()].filter(([, count]) => count > 1),
  };

  await fs.writeFile(path.join(reportDir, "property_detail_audit_summary.json"), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(reportDir, "property_detail_audit_issues.csv"), `${makeCsv(issueRows)}\n`);
  await fs.writeFile(path.join(reportDir, "property_detail_audit_clean.csv"), `${makeCsv(cleanRows)}\n`);
  await client.close();

  console.log(JSON.stringify({ reportDir, ...report }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

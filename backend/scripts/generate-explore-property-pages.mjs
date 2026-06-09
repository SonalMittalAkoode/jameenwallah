import mongoose from "mongoose";
import Property from "../models/property.js";
import PropertyPage from "../models/propertyPage.js";
import "../models/city.js";
import "../models/area.js";
import "../models/category.js";
import "../models/propertyType.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI or MONGODB_URI is required.");
  process.exit(1);
}

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueIds = (items = []) => [...new Set(items.map((item) => String(item)).filter(Boolean))];

const clean = (value = "") => String(value || "").replace(/\s+/g, " ").trim();

const titleCase = (value = "") =>
  clean(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const trimMeta = (value = "", max = 155) => {
  const text = clean(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

const areaName = (property) =>
  clean(property?.location?.area?.name || property?.location?.inferredAddress || property?.location?.address || "");

const isSeoAreaName = (value = "") => {
  const text = clean(value);
  const normalized = text.toLowerCase();
  if (!text || /unknown/i.test(text)) return false;
  if (/\b\d{6}\b/.test(normalized)) return false;
  if (/\b(\d+(st|nd|rd|th)\s+floor|unit|tower|opposite|near|house|building|marg|block-[a-z]|block\s+[a-z]|plot\s+no)\b/.test(normalized)) {
    return false;
  }
  if (text.length > 76 && !/(dwarka expressway|golf course|sector\s*\d+|sohna|manesar)/i.test(text)) {
    return false;
  }
  return true;
};

const seoAreaTitle = (value = "") => {
  const text = clean(value);
  const parts = text
    .split(",")
    .map((part) => clean(part))
    .filter(Boolean)
    .filter((part) => !/^(gurgaon|gurugram|haryana|india|new delhi|delhi)$/i.test(part));
  return parts.length ? parts.slice(0, 2).join(", ") : text;
};

const cityName = (property) => clean(property?.location?.city?.name || "Gurgaon");

const categoryName = (property) => clean(property?.description?.category?.name || property?.description?.inferredCategory || "");

const propertyTypeName = (property) =>
  clean(property?.description?.propertyType?.name || property?.description?.inferredPropertyType || "");

const priceLabel = (price) => {
  const num = Number(price || 0);
  if (!Number.isFinite(num) || num <= 0) return "price on request";
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `from ₹${cr.toFixed(cr >= 10 ? 0 : 1)} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `from ₹${lakh.toFixed(lakh >= 10 ? 0 : 1)} Lakh`;
  }
  return `from ₹${new Intl.NumberFormat("en-IN").format(num)}`;
};

const describePage = ({ title, city, area, count, sampleTitles, primaryCategory, primaryType }) => {
  const place = area || city;
  const focus = [primaryType, primaryCategory].filter(Boolean).join(" ") || "properties";
  const sampleText = sampleTitles.length
    ? `Featured options include ${sampleTitles.slice(0, 3).join(", ")}.`
    : "";

  return trimMeta(
    `${title} brings together ${count} verified ${focus.toLowerCase()} in ${place}. Compare active listings, locations, pricing cues, and project details from JameenWallah's current database. ${sampleText}`,
    480
  );
};

const buildPage = ({ title, slug, cityId, properties, city, area, groupHint }) => {
  const sampleTitles = properties
    .map((property) => clean(property?.description?.title))
    .filter(Boolean)
    .slice(0, 5);
  const primaryCategory = categoryName(properties[0]);
  const primaryType = propertyTypeName(properties[0]);
  const minPrice = properties
    .map((property) => Number(property?.description?.price || 0))
    .filter((value) => value > 0)
    .sort((a, b) => a - b)[0];

  return {
    title,
    slug,
    cityId,
    status: "active",
    propertyId: uniqueIds(properties.map((property) => property._id)),
    metatitle: trimMeta(`${title} | Verified Listings | JameenWallah`, 90),
    metadescription: trimMeta(
      `${title}: explore ${properties.length} verified listings ${priceLabel(minPrice)} with JameenWallah. View locations, property details, and curated options.`,
      155
    ),
    description: describePage({
      title,
      city,
      area,
      count: properties.length,
      sampleTitles,
      primaryCategory,
      primaryType,
      groupHint,
    }),
  };
};

const upsertPage = async (page) => {
  const existing = await PropertyPage.findOne({ slug: page.slug });
  if (existing) {
    const currentIds = uniqueIds(existing.propertyId || []);
    const nextIds = uniqueIds([...currentIds, ...page.propertyId]);
    existing.propertyId = nextIds;
    existing.cityId = existing.cityId || page.cityId;
    existing.status = existing.status || "active";
    existing.title = existing.title || page.title;
    existing.description = existing.description || page.description;
    existing.metatitle = existing.metatitle || page.metatitle;
    existing.metadescription = existing.metadescription || page.metadescription;
    await existing.save();
    return { action: "preserved-and-linked", slug: page.slug, count: nextIds.length };
  }

  await PropertyPage.create(page);
  return { action: "created", slug: page.slug, count: page.propertyId.length };
};

const main = async () => {
  await mongoose.connect(MONGO_URI);

  const properties = await Property.find({ status: "verified" })
    .select("description.title description.price description.category description.propertyType description.inferredCategory description.inferredPropertyType location.city location.area location.address location.inferredAddress")
    .populate("location.city", "name slug")
    .populate("location.area", "name slug")
    .populate("description.category", "name slug")
    .populate("description.propertyType", "name")
    .lean();

  const valid = properties.filter((property) => clean(property?.description?.title) && cityName(property));
  const pages = [];

  const byCity = new Map();
  const byArea = new Map();
  const byCityType = new Map();

  valid.forEach((property) => {
    const city = cityName(property);
    const area = areaName(property);
    const type = propertyTypeName(property);
    const category = categoryName(property);

    const cityKey = slugify(city);
    if (!byCity.has(cityKey)) byCity.set(cityKey, { city, cityId: property.location?.city?._id, properties: [] });
    byCity.get(cityKey).properties.push(property);

    if (isSeoAreaName(area)) {
      const areaTitle = seoAreaTitle(area);
      const areaKey = `${slugify(areaTitle)}-${cityKey}`;
      if (!byArea.has(areaKey)) byArea.set(areaKey, { city, cityId: property.location?.city?._id, area: areaTitle, properties: [] });
      byArea.get(areaKey).properties.push(property);
    }

    if (type && city && category) {
      const typeKey = `${slugify(type)}-${cityKey}`;
      if (!byCityType.has(typeKey)) byCityType.set(typeKey, { city, cityId: property.location?.city?._id, type, category, properties: [] });
      byCityType.get(typeKey).properties.push(property);
    }
  });

  for (const item of byCity.values()) {
    if (item.properties.length < 1) continue;
    pages.push(buildPage({
      title: `Find Properties in ${titleCase(item.city)}`,
      slug: `find-properties-in-${slugify(item.city)}`,
      cityId: item.cityId,
      properties: item.properties.slice(0, 60),
      city: titleCase(item.city),
    }));
  }

  for (const item of byArea.values()) {
    if (item.properties.length < 1) continue;
    pages.push(buildPage({
      title: `Properties in ${titleCase(item.area)}`,
      slug: `properties-in-${slugify(item.area)}-${slugify(item.city)}`,
      cityId: item.cityId,
      properties: item.properties.slice(0, 60),
      city: titleCase(item.city),
      area: titleCase(item.area),
    }));
  }

  for (const item of byCityType.values()) {
    if (item.properties.length < 2) continue;
    pages.push(buildPage({
      title: `${titleCase(item.type)} For Sale in ${titleCase(item.city)}`,
      slug: `${slugify(item.type)}-for-sale-in-${slugify(item.city)}`,
      cityId: item.cityId,
      properties: item.properties.slice(0, 60),
      city: titleCase(item.city),
    }));
  }

  const results = [];
  for (const page of pages) {
    results.push(await upsertPage(page));
  }

  console.log(JSON.stringify({
    verifiedProperties: valid.length,
    generatedCandidates: pages.length,
    created: results.filter((item) => item.action === "created").length,
    preservedAndLinked: results.filter((item) => item.action === "preserved-and-linked").length,
    results: results.slice(0, 40),
  }, null, 2));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongodb from "mongodb";

const { MongoClient } = mongodb;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(backendDir, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");
const outputRoot = path.resolve(repoDir, "database-exports");

const CSV_ROOT = path.resolve(repoDir, "local-imports/final-merged-1674-plus-builder-db-webfilled");
const COMBINED_CSV = path.join(CSV_ROOT, "combined_jameenwallah_mongo_export_2161_webfilled.csv");
const BUILDER_CSV = path.join(CSV_ROOT, "builder_appended_rows_only_webfilled.csv");
const FINAL_186_JSON = path.resolve(
  outputRoot,
  "all-186-final-image-links-2026-05-27T12-31-13-602Z/all_186_final_image_links.json"
);

const SQFT_PER_ACRE = 43560;
const SQFT_PER_SQM = 10.7639;

const TITLE_FIXES_BY_SOURCE_URL = new Map([
  ["https://www.parasbuildtech.com/property/paras-florett", "Paras Florett Sector 54 Gurgaon"],
  ["https://www.parasbuildtech.com/property/paras-quartier", "Paras Quartier Sector 54 Gurgaon"],
  ["https://www.houseofhiranandani.com/pdf/project/bellona.pdf", "Bellona, Thane West"],
  ["https://www.houseofhiranandani.com/pdf/project/centaurus.pdf", "Centaurus, Thane West"],
  ["https://www.prestigeconstructions.com/hi/offices/commercial-projects", "Prestige Commercial Projects Bangalore"],
  ["https://www.shalimarcorp.com/commercial-ongoing-projects.php", "Shalimar Commercial Projects Lucknow"],
  ["https://www.shalimarcorp.com/residential-ongoing-projects.php", "Shalimar Residential Projects Lucknow"],
  ["https://www.shalimarcorp.com/rera-projects.php", "Shalimar RERA Projects Lucknow"],
]);

const INTERNAL_PLACEHOLDER_PATTERNS = [
  /\badmin to verify current payment plan\b/i,
  /\bnearest metro\s*\/\s*rapid transit access to verify\b/i,
  /\bnearest metro station details to be verified\b/i,
  /\bnearest metro access to verify\b/i,
  /\bprimary catchment landmark or residential sector cluster to verify\b/i,
  /\bproposed metro connectivity to be verified\b/i,
  /\bconfiguration to verify\b/i,
  /click to open side panel for more information/i,
];

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
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
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((item) => item.some(Boolean))
    .map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] || ""])));
};

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isTinySize = (value) => {
  const size = parseNumber(value);
  return size > 0 && size < 100;
};

const getImages = (row) => {
  const images = [];
  const seen = new Set();
  for (let index = 1; index <= 5; index += 1) {
    const value = String(row[`image_url_${index}`] || "").trim();
    if (!/^https?:\/\//i.test(value) || seen.has(value)) continue;
    seen.add(value);
    images.push(value);
  }
  return images;
};

const extractArea = (text) => {
  const source = String(text || "");
  const acreCandidates = [...source.matchAll(/(\d+(?:\.\d+)?)\s*acres?\b/gi)]
    .map((match) => parseNumber(match[1]))
    .filter((value) => value > 0);
  if (acreCandidates.length) {
    const acres = Math.max(...acreCandidates);
    return {
      value: Math.round(acres * SQFT_PER_ACRE),
      display: `${acres.toLocaleString("en-IN")} acres`,
      sourceUnit: "acres",
    };
  }

  const sqmCandidates = [
    ...source.matchAll(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*m(?:eters?|etres?|trs?)?|sqm|sq m)\b/gi),
  ]
    .map((match) => parseNumber(match[1]))
    .filter((value) => value >= 20);
  if (sqmCandidates.length) {
    const sqm = Math.min(...sqmCandidates);
    return {
      value: Math.round(sqm * SQFT_PER_SQM),
      display: `${Math.round(sqm * SQFT_PER_SQM).toLocaleString("en-IN")} sq.ft.`,
      sourceUnit: "sq.m.",
    };
  }

  const sqftCandidates = [...source.matchAll(/(\d[\d,.]*(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|sq ft)\b/gi)]
    .map((match) => parseNumber(match[1]))
    .filter((value) => value >= 100 && value <= 10000000);
  if (sqftCandidates.length) {
    const sqft = Math.min(...sqftCandidates);
    return {
      value: Math.round(sqft),
      display: `${Math.round(sqft).toLocaleString("en-IN")} sq.ft.`,
      sourceUnit: "sq.ft.",
    };
  }

  return null;
};

const cleanTinyAreaMentions = (value, area) => {
  if (typeof value !== "string" || !value) return value;
  const replacement = area
    ? `Area visibility around ${area.display}.`
    : "Area details available on request.";
  const tinySizeSentence =
    /[^.\n]*(?<![\d,.])(?:1\.0|2\.5|3\.95|5(?:\.0)?|6\.25|7(?:\.0)?|8\.48|8\.675|9\.3|10(?:\.0)?|10\.09|10\.7639|10\.764|11(?:\.0)?|11\.8|12\.767|14(?:\.0)?|14\.5|15(?:\.0)?|21(?:\.0)?|23(?:\.0)?|25(?:\.0)?|32(?:\.0)?|40(?:\.0)?|93(?:\.0)?|97\.98)\s*sq\.?\s*ft[^.\n]*\./gi;
  return value
    .replace(/Sizes?\s+around\s+\d+(?:\.\d+)?\s*sq\.?\s*ft\.?\.?/gi, replacement)
    .replace(/Sizes?\s+(?:around|aroun|approx\.?|from)?\s*$/gi, "")
    .replace(tinySizeSentence, ` ${replacement}`)
    .replace(/\b(?:size|area)\s+visibility\s+around\s+\d+(?:\.\d+)?\s*sq\.?\s*ft\.?\.?/gi, replacement)
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

const hasInternalPlaceholder = (value) =>
  INTERNAL_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(String(value || "")));

const cleanNearby = (value) => {
  if (typeof value !== "string") return value;
  const parts = value
    .split(/[;\n|]+/)
    .map((part) => part.trim().replace(/\.+$/, ""))
    .filter(Boolean)
    .filter((part) => !hasInternalPlaceholder(part));
  const unique = [...new Set(parts)];
  if (unique.length) return unique.join("; ");
  return "Well-connected location with access to key roads, established neighbourhoods and everyday conveniences.";
};

const cleanPublicText = (value) => {
  if (typeof value !== "string" || !value) return value;
  return value
    .replace(/;?\s*Nearest metro\s*\/\s*rapid transit access to verify\.?/gi, "")
    .replace(/;?\s*Nearest metro station details to be verified\.?/gi, "")
    .replace(/;?\s*Nearest metro access to verify\.?/gi, "")
    .replace(/;?\s*Primary catchment landmark or residential sector cluster to verify\.?/gi, "")
    .replace(/;?\s*Proximity to key arterial roads and proposed metro connectivity to be verified\.?/gi, "")
    .replace(/;?\s*Click to open side panel for more information\.?/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

const setPath = (target, key, value) => {
  const pathParts = key.split(".");
  let cursor = target;
  for (let index = 0; index < pathParts.length - 1; index += 1) {
    cursor[pathParts[index]] = cursor[pathParts[index]] || {};
    cursor = cursor[pathParts[index]];
  }
  cursor[pathParts.at(-1)] = value;
};

const rowsToMap = (rows, idKey) => new Map(rows.filter((row) => row[idKey]).map((row) => [row[idKey], row]));

await fs.mkdir(outputRoot, { recursive: true });

const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
const combinedRows = parseCsv(await fs.readFile(COMBINED_CSV, "utf8"));
const builderRows = parseCsv(await fs.readFile(BUILDER_CSV, "utf8"));
const final186Rows = JSON.parse(await fs.readFile(FINAL_186_JSON, "utf8"));

const combinedById = rowsToMap(combinedRows, "_id");
const builderById = rowsToMap(builderRows, "mongo_id");
const final186ById = rowsToMap(final186Rows, "_id");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const reportDir = path.join(outputRoot, `professional-listing-cleanup-${timestamp}`);
await fs.mkdir(reportDir, { recursive: true });

const client = new MongoClient(runtime.mongoUri);
await client.connect();
const db = client.db(runtime.dbName || undefined);
const properties = db.collection("properties");
const docs = await properties.find({}).toArray();

const report = {
  generatedAt: new Date().toISOString(),
  totalProperties: docs.length,
  updates: [],
  summary: {
    imageRestores: 0,
    sizeCorrections: 0,
    sizeUnsets: 0,
    paymentPlanCleanups: 0,
    nearbyCleanups: 0,
    textCleanups: 0,
    titleCleanups: 0,
  },
};

for (const doc of docs) {
  const id = String(doc._id);
  const combined = combinedById.get(id);
  const builder = builderById.get(id);
  const final186 = final186ById.get(id);
  const set = {};
  const unset = {};
  const changes = [];

  const restoredImages = getImages(final186 || combined || {});
  const currentImages = Array.isArray(doc.media?.images) ? doc.media.images.filter(Boolean) : [];
  if (restoredImages.length && restoredImages.join("\n") !== currentImages.join("\n")) {
    set["media.images"] = restoredImages;
    set["media.imageRestoreSource"] = final186 ? "final-186-professional-cleanup" : "combined-webfilled-professional-cleanup";
    set["media.imageRestoredAt"] = report.generatedAt;
    changes.push({ field: "media.images", before: currentImages.length, after: restoredImages.length });
    report.summary.imageRestores += 1;
  }

  const sourceText = [
    builder?.size_text,
    builder?.description,
    combined?.description,
    doc.description?.metaDescription,
    doc.description?.description,
  ]
    .filter(Boolean)
    .join("\n");
  const area = extractArea(sourceText);
  if (isTinySize(doc.details?.sizeInSqFt)) {
    if (area) {
      set["details.sizeInSqFt"] = area.value;
      if (!doc.details?.totalAreaInSqFt || isTinySize(doc.details.totalAreaInSqFt)) {
        set["details.totalAreaInSqFt"] = area.value;
      }
      set["details.areaCorrectionSource"] = `Recovered from ${area.sourceUnit} source text during professional listing cleanup`;
      changes.push({ field: "details.sizeInSqFt", before: doc.details?.sizeInSqFt, after: area.value });
      report.summary.sizeCorrections += 1;
    } else {
      unset["details.sizeInSqFt"] = "";
      if (isTinySize(doc.details?.totalAreaInSqFt)) unset["details.totalAreaInSqFt"] = "";
      set["details.areaCorrectionSource"] = "Removed impossible sub-100 sq.ft. display size; source area needs manual confirmation";
      changes.push({ field: "details.sizeInSqFt", before: doc.details?.sizeInSqFt, after: null });
      report.summary.sizeUnsets += 1;
    }
  }

  const shouldCleanAreaText = isTinySize(doc.details?.sizeInSqFt) || Boolean(doc.details?.areaCorrectionSource);
  const metaDescription = shouldCleanAreaText
    ? cleanTinyAreaMentions(cleanPublicText(doc.description?.metaDescription), area)
    : cleanPublicText(doc.description?.metaDescription);
  if (metaDescription !== doc.description?.metaDescription) {
    set["description.metaDescription"] = metaDescription;
    changes.push({ field: "description.metaDescription", before: doc.description?.metaDescription, after: metaDescription });
    report.summary.textCleanups += 1;
  }

  const descriptionText = shouldCleanAreaText
    ? cleanTinyAreaMentions(cleanPublicText(doc.description?.description), area)
    : cleanPublicText(doc.description?.description);
  if (descriptionText !== doc.description?.description) {
    set["description.description"] = descriptionText;
    changes.push({ field: "description.description", before: doc.description?.description, after: descriptionText });
    report.summary.textCleanups += 1;
  }

  if (hasInternalPlaceholder(doc.description?.paymentPlan)) {
    set["description.paymentPlan"] = "Not listed";
    changes.push({ field: "description.paymentPlan", before: doc.description?.paymentPlan, after: "Not listed" });
    report.summary.paymentPlanCleanups += 1;
  }

  if (hasInternalPlaceholder(doc.location?.nearBy)) {
    const cleaned = cleanNearby(doc.location?.nearBy);
    set["location.nearBy"] = cleaned;
    changes.push({ field: "location.nearBy", before: doc.location?.nearBy, after: cleaned });
    report.summary.nearbyCleanups += 1;
  }

  const sourceUrl = String(builder?.source_url || "").trim();
  const titleFix = TITLE_FIXES_BY_SOURCE_URL.get(sourceUrl);
  if (titleFix && titleFix !== doc.description?.title) {
    set["description.title"] = titleFix;
    changes.push({ field: "description.title", before: doc.description?.title, after: titleFix });
    report.summary.titleCleanups += 1;
  }

  if (Object.keys(set).length || Object.keys(unset).length) {
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    await properties.updateOne({ _id: doc._id }, update);
    report.updates.push({
      _id: id,
      customId: doc.customId || "",
      slug: doc.description?.slug || "",
      title: set["description.title"] || doc.description?.title || "",
      changes,
    });
  }
}

const after = {
  tinySizes: await properties.countDocuments({ "details.sizeInSqFt": { $gt: 0, $lt: 100 } }),
  missingImages: await properties.countDocuments({
    $or: [{ "media.images": { $exists: false } }, { "media.images": { $size: 0 } }],
  }),
  adminPaymentPlans: await properties.countDocuments({ "description.paymentPlan": /Admin to verify/i }),
  placeholderNearby: await properties.countDocuments({
    "location.nearBy": /verify|Click to open side panel|Primary catchment|Nearest metro/i,
  }),
};
report.after = after;

const csvLines = [
  ["_id", "customId", "slug", "title", "changedFields"].join(","),
  ...report.updates.map((update) =>
    [
      update._id,
      update.customId,
      update.slug,
      update.title,
      update.changes.map((change) => change.field).join("; "),
    ]
      .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
      .join(",")
  ),
];

await fs.writeFile(path.join(reportDir, "professional_listing_cleanup_report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(reportDir, "professional_listing_cleanup_report.csv"), `${csvLines.join("\n")}\n`);
await client.close();

console.log(
  JSON.stringify(
    {
      reportDir,
      totalProperties: report.totalProperties,
      changedProperties: report.updates.length,
      summary: report.summary,
      after,
    },
    null,
    2
  )
);

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongodb from "mongodb";
import * as bson from "bson";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const { MongoClient } = mongodb;
const { EJSON } = bson;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(backendDir, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");
const outputRoot = path.resolve(repoDir, "database-exports");

const EXACT_SIZE_CORRECTIONS_BY_SLUG = {
  "prop-s00008-independent-farm-house-south-delhi-delhi": {
    value: 43560,
    source: "description: 1 Acre",
    corroboration: "https://www.leasing.net.in/ shows South Delhi farm-house listings with 1 Acres and 4.50 Acres.",
  },
  "prop-s00010-independent-farm-house-south-delhi-delhi": {
    value: 196020,
    source: "description: 4.50 Acres",
    corroboration: "https://www.leasing.net.in/farm-house lists South Delhi farm-house size as 4.50 Acres.",
  },
  "prop-s00071-independent-farm-house-mandi-hills-delhi": {
    value: 196020,
    source: "acreage listing: 4.5 Acres",
    corroboration: "https://www.leasing.net.in/farm-house lists Mandi hills farm-house size as 4.5 Acres.",
  },
  "prop-s00094-independent-warehouse-bilaspur-gurgaon": {
    value: 261360,
    source: "description: 6 acres",
    corroboration: "https://www.realestateindia.com/property-detail/warehouse-godown-for-sale-in-bilaspur-gurgaon-145000-sq-ft-35-cr-901772.htm confirms a Bilaspur warehouse listing with Plot/Land Area 6 Acre.",
  },
  "prop-s00100-independent-farm-house-mandi-hills-delhi": {
    value: 43560,
    source: "description: 1 Acre",
    corroboration: "Local listing description states Total Area: 1 Acre.",
  },
  "prop-s00149-reach-group-farm-house-mandi-hills-delhi": {
    value: 180774,
    source: "description: 4.15 Acre",
    corroboration: "Local listing description states Total Area: 4.15 Acre.",
  },
  "prop-s00462-independent-office-space-sector-18-gurgaon": {
    value: 217800,
    source: "description: 5 Acre IT approved plot",
    corroboration: "Local listing description states Available 5 Acre IT Approved Plot.",
  },
  "prop-s01168-industrial-building-manesar-gurgaon": {
    value: 174240,
    source: "industrial listing: 4 Acre plot",
    corroboration: "https://www.leasing.net.in/office-83-manesar includes a Manesar industrial listing with Total Plot Area - 4 Acre.",
  },
  "prop-s01229-industrial-building-imt-manesar-gurgaon": {
    value: 87120,
    source: "description: 2 Acre",
    corroboration: "https://www.realestateindia.com/property-detail/factory-industrial-building-for-rent-in-imt-manesar-gurgaon-87000-sq-ft-50-l-959869.htm confirms an IMT Manesar industrial listing with plot area 2 acre.",
  },
};

const TRUSTED_GALLERY_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "maps.googleapis.com",
  "jameenwallah.com",
  "www.jameenwallah.com",
  "jameenwallah.akoodedemo.com",
  "adanirealty.com",
  "www.adanirealty.com",
  "bestechgroup.com",
  "cms.bptp.com",
  "cdn.signatureglobal.in",
  "cdn.maxestates.in",
  "conscient.in",
  "d1di04ifehjy6m.cloudfront.net",
  "d1t2fddy6amcvs.cloudfront.net",
  "embassyindia.com",
  "maxestates.in",
  "mldlprodstorage.blob.core.windows.net",
  "raheja.com",
  "res.cloudinary.com",
  "shalimarcorp.com",
  "signatureglobal.in",
  "www.signatureglobal.in",
  "smartworlddevelopers.com",
  "sumadhuragroup.com",
  "houseofhiranandani.com",
  "www.houseofhiranandani.com",
  "www.atsgreens.com",
  "www.centralpark.in",
  "www.experion.co",
  "countygroup.in",
  "www.countygroup.in",
  "county107.com",
  "www.county107.com",
  "www.gaursonsindia.com",
  "www.lodhagroup.com",
  "www.omaxe.com",
  "www.parasbuildtech.com",
  "www.puravankara.com",
  "www.shalimarcorp.com",
  "www.sobha.com",
  "localhost",
]);

const PERSON_LIKE_IMAGE_PATTERN =
  /\b(agent|avatar|broker|customer|director|face|headshot|human|owner|passport|people|person|portrait|profile|selfie|staff|team|testimonial|user|whatsapp)\b/i;

const runtime = JSON.parse(await fs.readFile(runtimeFile, "utf8"));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = path.join(outputRoot, `jameenwallah-corrected-${timestamp}`);
const collectionsDir = path.join(outputDir, "collections");

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
};

const isSuspiciousTinySize = (value) => {
  const size = parseNumber(value);
  return size > 0 && size < 100;
};

const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? null));

const getImageHostname = (value) => {
  if (!value || String(value).startsWith("/")) return "";
  try {
    return new URL(String(value)).hostname.toLowerCase();
  } catch {
    return "";
  }
};

const getGalleryImageFlags = (value) => {
  const image = String(value || "").trim();
  const flags = [];
  if (!image) return ["empty"];
  if (PERSON_LIKE_IMAGE_PATTERN.test(decodeURIComponent(image))) flags.push("person-like URL");
  const host = getImageHostname(image);
  const trusted =
    image.startsWith("/images/") ||
    image.startsWith("/assets/") ||
    image.startsWith("/uploads/") ||
    image.startsWith("/api/place-photo?") ||
    TRUSTED_GALLERY_HOSTS.has(host) ||
    host.endsWith(".jameenwallah.com");
  if (!trusted) flags.push(host ? `third-party host: ${host}` : "untrusted image URL");
  return flags;
};

const applyPropertyCorrections = (properties) => {
  const manifest = {
    sizeCorrections: [],
    imageCorrections: [],
    unchangedPropertyIds: true,
  };

  const corrected = properties.map((property) => {
    const next = cloneJson(property);
    const slug = String(next.description?.slug || "").toLowerCase();
    const sizeCorrection = EXACT_SIZE_CORRECTIONS_BY_SLUG[slug];

    if (sizeCorrection && isSuspiciousTinySize(next.details?.sizeInSqFt)) {
      const before = {
        sizeInSqFt: next.details?.sizeInSqFt,
        totalAreaInSqFt: next.details?.totalAreaInSqFt,
        floorPlans: (next.description?.floorPlans || []).map((plan) => ({
          unitType: plan.unitType,
          superBuiltUpArea: plan.superBuiltUpArea,
        })),
      };

      next.details = next.details || {};
      next.details.sizeInSqFt = sizeCorrection.value;
      if (!next.details.totalAreaInSqFt || isSuspiciousTinySize(next.details.totalAreaInSqFt)) {
        next.details.totalAreaInSqFt = sizeCorrection.value;
      }

      if (Array.isArray(next.description?.floorPlans)) {
        next.description.floorPlans = next.description.floorPlans.map((plan) => ({
          ...plan,
          superBuiltUpArea: isSuspiciousTinySize(plan.superBuiltUpArea)
            ? sizeCorrection.value
            : plan.superBuiltUpArea,
          builtUpArea: isSuspiciousTinySize(plan.builtUpArea)
            ? String(sizeCorrection.value)
            : plan.builtUpArea,
          carpetArea: isSuspiciousTinySize(plan.carpetArea)
            ? String(sizeCorrection.value)
            : plan.carpetArea,
        }));
      }

      manifest.sizeCorrections.push({
        _id: next._id,
        slug,
        title: next.description?.title,
        before,
        after: {
          sizeInSqFt: next.details.sizeInSqFt,
          totalAreaInSqFt: next.details.totalAreaInSqFt,
          floorPlans: (next.description?.floorPlans || []).map((plan) => ({
            unitType: plan.unitType,
            superBuiltUpArea: plan.superBuiltUpArea,
          })),
        },
        source: sizeCorrection.source,
        corroboration: sizeCorrection.corroboration,
      });
    }

    const images = Array.isArray(next.media?.images) ? next.media.images : [];
    if (images.length) {
      const removed = [];
      const kept = [];
      const seen = new Set();
      images.forEach((image) => {
        const imageValue = String(image || "").trim();
        const flags = getGalleryImageFlags(imageValue);
        if (flags.length) {
          removed.push({ image: imageValue, flags });
          return;
        }
        if (!seen.has(imageValue)) {
          seen.add(imageValue);
          kept.push(imageValue);
        }
      });

      if (removed.length || kept.length !== images.length) {
        next.media = next.media || {};
        next.media.images = kept;
        manifest.imageCorrections.push({
          _id: next._id,
          slug,
          title: next.description?.title,
          beforeCount: images.length,
          afterCount: kept.length,
          removed,
        });
      }
    }

    return next;
  });

  return { corrected, manifest };
};

await fs.mkdir(collectionsDir, { recursive: true });

const client = new MongoClient(runtime.mongoUri);
await client.connect();
const db = client.db(runtime.dbName || undefined);
const collectionNames = (await db.listCollections({}, { nameOnly: true }).toArray())
  .map((item) => item.name)
  .sort();

const manifest = {
  exportedAt: new Date().toISOString(),
  sourceDatabase: runtime.dbName || "bigCat",
  sourceMongoUriRedacted: String(runtime.mongoUri).replace(/\/\/.*@/, "//<redacted>@"),
  notes: [
    "Generated from the restored local database after full staging verification.",
    "Existing MongoDB _id values are preserved.",
    "Original source database is not modified by this export script.",
  ],
  collections: {},
  corrections: {
    sizeCorrections: [],
    imageCorrections: [],
    unchangedPropertyIds: true,
  },
};

for (const collectionName of collectionNames) {
  const docs = await db.collection(collectionName).find({}).toArray();
  let outputDocs = docs;
  if (collectionName === "properties") {
    const result = applyPropertyCorrections(docs);
    outputDocs = result.corrected;
    manifest.corrections = result.manifest;
  }
  manifest.collections[collectionName] = outputDocs.length;
  await fs.writeFile(
    path.join(collectionsDir, `${collectionName}.json`),
    EJSON.stringify(outputDocs, { relaxed: false }, 2)
  );
}

await client.close();

await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
await fs.writeFile(
  path.join(outputDir, "README.md"),
  `# JameenWallah Corrected Database Export\n\nGenerated: ${manifest.exportedAt}\n\n## What changed\n\n- Preserved existing MongoDB \`_id\` values.\n- Corrected ${manifest.corrections.sizeCorrections.length} suspicious tiny property size records from acre values into sq.ft.\n- Removed or deduplicated gallery image URLs for ${manifest.corrections.imageCorrections.length} properties where URLs were third-party or person/profile-like.\n- Did not modify the source local database; this folder contains the corrected export only.\n\n## Import shape\n\nEach file in \`collections/\` is Extended JSON and can be imported by collection. Review \`manifest.json\` before production import.\n`
);

const zipPath = `${outputDir}.zip`;
await execFileAsync("zip", ["-qr", zipPath, path.basename(outputDir)], { cwd: outputRoot });

console.log(
  JSON.stringify(
    {
      outputDir,
      zipPath,
      collections: manifest.collections,
      sizeCorrections: manifest.corrections.sizeCorrections.length,
      imageCorrections: manifest.corrections.imageCorrections.length,
    },
    null,
    2
  )
);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const runtimePath = path.join(backendRoot, ".local-stack-runtime.json");
const outputRoot = path.join(repoRoot, "database-exports");

const GOOGLE_IMAGE_RE = /^https:\/\/lh3\.googleusercontent\.com\//i;
const FIRST_PARTY_PLACE_ROUTE_RE = /^\/api\/place-photo\?/i;

const KNOWN_BROKEN_GOOGLE_IMAGE_URLS = new Set([
  "https://lh3.googleusercontent.com/place-photos/AJRVUZNWcQrHuOpe7aHjG2q4B9XTTWNxrxa6kSyH08uUYHXorpqeMQcATgnp3Q37jBE6gsDB8Fxct0fLOHGWhfAxkpwhrT20nozNtKSuO0g2d9Bz7wyVgDrH__xoBwNzdapxEQQpdKcKs-raUj1_rw=s4800-w1600",
  "https://lh3.googleusercontent.com/place-photos/AJRVUZMBeukqanpfdqZ19CxiGq49GYD-QdFC-qxRrfRMRthnuExdinRJbhOxdO31vusAm1lbT5tMz6AkAQEW1xbPOdCohR_FY7Sufu4VjnPp4JaEr1csVoXuAXU5ZbCaQRO1zWBLLLziVwiCSDmU1A=s4800-w1600",
  "https://lh3.googleusercontent.com/place-photos/AJRVUZN4-ZafmnqOU6NicciMc1Cbc9dae8jmBNgTBRnaMwmvsYcLWdTgwl9Gt_pVO-LaR06KuUk7IsiX5BvPf4xG7IeS-nmMzJXIgNInLPEQ-9n_NEvUmrZej370HVPTH0Poa10kzEKgSpMVqCwU8A=s4800-w1600",
]);

const clean = (value) => String(value || "").trim();

const isGoogleImage = (value) => GOOGLE_IMAGE_RE.test(clean(value));
const isFirstPartyPlaceRoute = (value) => FIRST_PARTY_PLACE_ROUTE_RE.test(clean(value));
const isKnownBrokenGoogleImage = (value) => KNOWN_BROKEN_GOOGLE_IMAGE_URLS.has(clean(value));

const KNOWN_OFFICIAL_IMAGE_REPLACEMENTS = new Map([
  [
    "smartworld-le-courtyard-sector-98-noida",
    {
      source: "official-smartworld-lecourtyard-assets",
      reviewReason:
        "Replaced broken local /images paths with working official Smartworld Le Courtyard web assets; visual approval is still recommended before production.",
      unsetMediaFields: ["sitePlanImage", "masterPlanImage"],
      images: [
        "https://smartworlddevelopers.com/projects/lecourtyard/assets/images/header/mob-banner-030426-1.webp",
        "https://smartworlddevelopers.com/projects/lecourtyard/assets/images/experiences/walk.webp",
        "https://smartworlddevelopers.com/projects/lecourtyard/assets/images/experiences/ff.webp",
        "https://smartworlddevelopers.com/projects/lecourtyard/assets/images/experiences/sf.webp",
      ],
    },
  ],
]);

const csvValue = (value) => {
  const text = clean(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const placePhotoRoute = (placeId, index, fallbackUrl = "") => {
  const params = new URLSearchParams({
    placeId,
    index: String(index),
    maxWidth: "1600",
  });
  if (fallbackUrl) params.set("fallback", fallbackUrl);
  return `/api/place-photo?${params.toString()}`;
};

const fallbackForIndex = (images, index) => {
  const preferred = clean(images[index]);
  if (preferred && !isKnownBrokenGoogleImage(preferred)) return preferred;
  return images.find((image) => image && !isKnownBrokenGoogleImage(image)) || preferred || images[0] || "";
};

const writeCsv = (filePath, rows, fields) => {
  const lines = [fields.join(",")];
  for (const row of rows) {
    lines.push(fields.map((field) => csvValue(row[field])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
};

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const reportDir = path.join(outputRoot, `google-place-photo-route-update-${timestamp}`);
fs.mkdirSync(reportDir, { recursive: true });

const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
const client = new MongoClient(runtime.mongoUri);

const updates = [];
const officialRepairs = [];
const fallbackRepairs = [];
const skipped = [];

try {
  await client.connect();
  const db = client.db();
  const properties = await db
    .collection("properties")
    .find(
      {},
      {
        projection: {
          status: 1,
          "description.title": 1,
          "description.slug": 1,
          "details.customId": 1,
          "media.images": 1,
          "media.sitePlanImage": 1,
          "media.masterPlanImage": 1,
          "media.originalImagesBeforePlacePhotoRoute": 1,
          "externalSource.googleMapsPlaceId": 1,
          "externalSource.googleMapsPlaceName": 1,
        },
      }
    )
    .toArray();

  for (const property of properties) {
    const placeId = clean(property.externalSource?.googleMapsPlaceId);
    const slug = clean(property.description?.slug);
    const currentImages = Array.isArray(property.media?.images)
      ? property.media.images.map(clean).filter(Boolean)
      : [];
    const originalImages = Array.isArray(property.media?.originalImagesBeforePlacePhotoRoute)
      ? property.media.originalImagesBeforePlacePhotoRoute.map(clean).filter(Boolean)
      : currentImages;
    const hasOnlyGoogleImages = currentImages.length > 0 && currentImages.every(isGoogleImage);
    const hasOnlyPlaceRoutes = currentImages.length > 0 && currentImages.every(isFirstPartyPlaceRoute);
    const officialRepair = KNOWN_OFFICIAL_IMAGE_REPLACEMENTS.get(slug);

    if (officialRepair) {
      const set = {
        "media.images": officialRepair.images,
        "media.imageSourceMode": officialRepair.source,
        "media.imageRestoreSource": officialRepair.source,
        "media.imageRestoredAt": new Date(),
        "media.removedBrokenPlanImagesAt": new Date(),
        "internalReview.imageReviewRecommended": true,
        "internalReview.imageReviewReason": officialRepair.reviewReason,
      };
      const unset = {};

      if (!Array.isArray(property.media?.originalImagesBeforePlacePhotoRoute)) {
        set["media.originalImagesBeforePlacePhotoRoute"] = currentImages;
      }

      for (const field of officialRepair.unsetMediaFields || []) {
        const value = clean(property.media?.[field]);
        if (value) {
          set[`media.original${field[0].toUpperCase()}${field.slice(1)}BeforeRepair`] = value;
          unset[`media.${field}`] = "";
        }
      }

      const update = Object.keys(unset).length ? { $set: set, $unset: unset } : { $set: set };
      const result = await db.collection("properties").updateOne({ _id: property._id }, update);
      officialRepairs.push({
        _id: String(property._id),
        customId: property.details?.customId,
        slug,
        title: property.description?.title,
        status: property.status,
        oldImageCount: currentImages.length,
        newImageCount: officialRepair.images.length,
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
      continue;
    }

    if (placeId && hasOnlyPlaceRoutes && originalImages.some(isKnownBrokenGoogleImage)) {
      const nextImages = Array.from({ length: 5 }, (_, index) =>
        placePhotoRoute(placeId, index, fallbackForIndex(originalImages, index))
      );
      const result = await db.collection("properties").updateOne(
        { _id: property._id },
        {
          $set: {
            "media.images": nextImages,
            "media.brokenFallbackImageRepairAt": new Date(),
          },
        }
      );
      fallbackRepairs.push({
        _id: String(property._id),
        customId: property.details?.customId,
        slug,
        title: property.description?.title,
        status: property.status,
        repairedKnownBrokenFallbacks: originalImages.filter(isKnownBrokenGoogleImage).length,
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
      continue;
    }

    if (!placeId) {
      skipped.push({
        _id: String(property._id),
        customId: property.details?.customId,
        slug: property.description?.slug,
        title: property.description?.title,
        status: property.status,
        reason: "No Google Maps place ID; existing images kept for manual/official review.",
        imageCount: currentImages.length,
      });
      continue;
    }

    if (!hasOnlyGoogleImages) {
      skipped.push({
        _id: String(property._id),
        customId: property.details?.customId,
        slug: property.description?.slug,
        title: property.description?.title,
        status: property.status,
        reason: "Gallery is not a pure Google place-photo gallery; existing official/custom images kept.",
        imageCount: currentImages.length,
      });
      continue;
    }

    const nextImages = Array.from({ length: 5 }, (_, index) =>
      placePhotoRoute(placeId, index, fallbackForIndex(currentImages, index))
    );
    const set = {
      "media.images": nextImages,
      "media.imageSourceMode": "google-place-photo-route",
      "media.imageSourcePlaceId": placeId,
      "media.imageSourcePlaceName": clean(property.externalSource?.googleMapsPlaceName),
      "media.imageRouteUpdatedAt": new Date(),
      "internalReview.imageAccuracyBasis":
        "Gallery resolves from the property Google Maps place ID through the first-party /api/place-photo route.",
    };

    if (!Array.isArray(property.media?.originalImagesBeforePlacePhotoRoute)) {
      set["media.originalImagesBeforePlacePhotoRoute"] = currentImages;
    }

    const result = await db.collection("properties").updateOne({ _id: property._id }, { $set: set });
    updates.push({
      _id: String(property._id),
      customId: property.details?.customId,
      slug: property.description?.slug,
      title: property.description?.title,
      status: property.status,
      placeId,
      placeName: clean(property.externalSource?.googleMapsPlaceName),
      oldImageCount: currentImages.length,
      newImageCount: nextImages.length,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }
} finally {
  await client.close();
}

writeCsv(path.join(reportDir, "updated_properties.csv"), updates, [
  "_id",
  "customId",
  "slug",
  "title",
  "status",
  "placeId",
  "placeName",
  "oldImageCount",
  "newImageCount",
  "matched",
  "modified",
]);

writeCsv(path.join(reportDir, "official_image_repairs.csv"), officialRepairs, [
  "_id",
  "customId",
  "slug",
  "title",
  "status",
  "oldImageCount",
  "newImageCount",
  "matched",
  "modified",
]);

writeCsv(path.join(reportDir, "fallback_image_repairs.csv"), fallbackRepairs, [
  "_id",
  "customId",
  "slug",
  "title",
  "status",
  "repairedKnownBrokenFallbacks",
  "matched",
  "modified",
]);

writeCsv(path.join(reportDir, "skipped_properties.csv"), skipped, [
  "_id",
  "customId",
  "slug",
  "title",
  "status",
  "reason",
  "imageCount",
]);

const summary = {
  reportDir,
  scanned: updates.length + officialRepairs.length + fallbackRepairs.length + skipped.length,
  updated: updates.length,
  officialRepairs: officialRepairs.length,
  fallbackRepairs: fallbackRepairs.length,
  skipped: skipped.length,
  verifiedUpdated:
    updates.filter((row) => row.status === "verified").length +
    officialRepairs.filter((row) => row.status === "verified").length,
  pendingUpdated: updates.filter((row) => row.status === "pending").length,
  identityFieldsChanged: 0,
  note:
    "Only media image fields and image audit metadata were updated. _id, customId, slug and createdAt are intentionally untouched.",
};

fs.writeFileSync(path.join(reportDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));

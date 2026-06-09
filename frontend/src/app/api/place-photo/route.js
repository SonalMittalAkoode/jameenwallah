import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const FALLBACK_IMAGE = "/images/listings/g1-1.jpg";

const getGoogleKey = () =>
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  "";

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

const fallbackImage = async (fallbackUrl = "") => {
  if (fallbackUrl) {
    try {
      const response = await fetch(fallbackUrl, { cache: "no-store" });
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.startsWith("image/")) {
        return new NextResponse(await response.arrayBuffer(), {
          status: 200,
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      }
    } catch {
      // Fall through to the local asset.
    }
  }

  const fallbackPath = path.join(process.cwd(), "public", FALLBACK_IMAGE);
  const data = await fs.readFile(fallbackPath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "content-type": contentTypeFor(fallbackPath),
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
};

const getPhotoName = async (placeId, index, apiKey) => {
  const response = await fetch(`${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "photos.name",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return "";

  const payload = await response.json();
  const photos = Array.isArray(payload?.photos) ? payload.photos : [];
  return photos[index]?.name || photos[0]?.name || "";
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId") || "";
  const fallback = searchParams.get("fallback") || "";
  const index = Number.parseInt(searchParams.get("index") || "0", 10) || 0;
  const apiKey = getGoogleKey();

  if (!placeId || !apiKey) {
    return fallbackImage(fallback);
  }

  try {
    const photoName = await getPhotoName(placeId, index, apiKey);
    if (!photoName) return fallbackImage(fallback);

    const mediaUrl = new URL(`${GOOGLE_PLACES_DETAILS_URL}/${photoName}/media`);
    mediaUrl.searchParams.set("maxWidthPx", "1200");
    mediaUrl.searchParams.set("key", apiKey);

    const response = await fetch(mediaUrl, {
      redirect: "follow",
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.startsWith("image/")) {
      return fallbackImage(fallback);
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return fallbackImage(fallback);
  }
}

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_IMAGE = "/images/listings/g1-1.jpg";

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

const fallbackImage = async () => {
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url") || "";

  let targetUrl;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return fallbackImage();
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return fallbackImage();
  }

  try {
    const response = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 JameenWallah Image Proxy",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.startsWith("image/")) {
      return fallbackImage();
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return fallbackImage();
  }
}

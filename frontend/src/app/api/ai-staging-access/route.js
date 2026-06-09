import { NextResponse } from "next/server";
import {
  AI_STAGING_ACCESS_COOKIE,
  AI_STAGING_ADMIN_PATH,
  getAiStagingAccessCookieValue,
  getAiStagingAccessSecret,
  isLocalHostRequest,
} from "@/lib/aiStagingAccess";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  const secret = getAiStagingAccessSecret();
  const formData = await request.formData();
  const providedKey = String(formData.get("accessKey") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || AI_STAGING_ADMIN_PATH);

  if (!secret) {
    const isLocal = await isLocalHostRequest();
    if (isLocal) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.redirect(new URL(`${redirectTo}?error=disabled`, request.url));
  }

  if (providedKey !== secret) {
    return NextResponse.redirect(new URL(`${redirectTo}?error=invalid`, request.url));
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(AI_STAGING_ACCESS_COOKIE, getAiStagingAccessCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE(request) {
  const redirectTo = new URL(AI_STAGING_ADMIN_PATH, request.url);
  const response = NextResponse.redirect(redirectTo);
  response.cookies.set(AI_STAGING_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

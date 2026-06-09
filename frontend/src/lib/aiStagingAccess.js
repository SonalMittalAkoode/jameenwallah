import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

export const AI_STAGING_ACCESS_COOKIE = "ai_staging_access";
export const AI_STAGING_ADMIN_PATH = "/cmsadminlogin/ai-suggestion-staging";
export const AI_STAGING_PRODUCTION_ORIGINS = [
  "https://jameenwallah.akoodedemo.com",
  "https://jameenwallah.com",
];
export const AI_STAGING_STAGED_ORIGIN = "https://jameenwallah.vercel.app";

const CMS_AUTH_HOSTS = new Set([
  "jameenwallah.akoodedemo.com",
  "www.jameenwallah.akoodedemo.com",
  "jameenwallah.com",
  "www.jameenwallah.com",
  "jameenwallah.vercel.app",
]);

const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

export const getAiStagingAccessSecret = () =>
  String(process.env.AI_STAGING_ACCESS_KEY || "").trim();

export const getAiStagingAccessCookieValue = () => {
  const secret = getAiStagingAccessSecret();
  return secret ? hashValue(secret) : "";
};

export const isLocalHostRequest = async () => {
  const headerStore = await headers();
  const host = headerStore.get("host") || "";
  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host.startsWith("[::1]:")
  );
};

export const isCmsAuthenticatedHostRequest = async () => {
  const headerStore = await headers();
  const host = (headerStore.get("host") || "").split(":")[0].toLowerCase();
  return CMS_AUTH_HOSTS.has(host);
};

export const hasAiStagingAccess = async () => {
  const secret = getAiStagingAccessSecret();
  const localRequest = await isLocalHostRequest();

  if (!secret) {
    return localRequest || (await isCmsAuthenticatedHostRequest());
  }

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(AI_STAGING_ACCESS_COOKIE)?.value || "";
  return accessCookie === getAiStagingAccessCookieValue();
};

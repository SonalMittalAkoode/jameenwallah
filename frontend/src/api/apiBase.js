const DEPLOYMENT_HOSTS = new Set([
  "jameenwallah.akoodedemo.com",
  "www.jameenwallah.akoodedemo.com",
  "jameenwallah.com",
  "www.jameenwallah.com",
  "jameenwallah.vercel.app",
]);

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const isLocalApiBase = (value) =>
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(String(value || ""));

const shouldProxyProductionBrowserApi = () => {
  if (typeof window === "undefined") return false;
  return DEPLOYMENT_HOSTS.has(window.location.hostname);
};

export const getApiBaseUrl = (fallback = "http://localhost:5000") => {
  const configured = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (shouldProxyProductionBrowserApi() && (!configured || isLocalApiBase(configured))) {
    return "/api/ai-staging-backend";
  }

  return configured || fallback;
};

export const getAdminApiBaseUrl = (fallback = "http://localhost:5000/admin") => {
  const configuredAdmin = trimTrailingSlash(process.env.NEXT_PUBLIC_ADMIN_API_URL);
  const configuredApi = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (
    shouldProxyProductionBrowserApi() &&
    (!configuredAdmin || isLocalApiBase(configuredAdmin)) &&
    (!configuredApi || isLocalApiBase(configuredApi))
  ) {
    return "/api/ai-staging-backend/admin";
  }

  return configuredAdmin || (configuredApi ? `${configuredApi}/admin` : fallback);
};

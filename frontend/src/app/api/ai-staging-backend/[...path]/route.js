import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTION_BACKEND_URL = "https://jameenwallahapi.akoodedemo.com";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getBackendBaseUrl = () =>
  trimTrailingSlash(
    process.env.AI_STAGING_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      PRODUCTION_BACKEND_URL
  );

const buildTargetUrl = (request, pathSegments = []) => {
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(`${getBackendBaseUrl()}/${pathSegments.join("/")}`);
  targetUrl.search = sourceUrl.search;
  return targetUrl;
};

const buildForwardHeaders = (request) => {
  const headers = new Headers();
  const passthroughHeaders = [
    "authorization",
    "content-type",
    "accept",
    "x-api-key",
  ];

  passthroughHeaders.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  });

  return headers;
};

const proxyRequest = async (request, context) => {
  const params = await context.params;
  const pathSegments = params?.path || [];
  const backendPath = pathSegments.join("/");
  const isAdminPath = backendPath.startsWith("admin/api/");
  const isAdminAuthPath = backendPath.startsWith("admin/api/auth/");

  if (isAdminPath && !isAdminAuthPath && !request.headers.get("authorization")) {
    return NextResponse.json(
      { status: "error", message: "Admin API proxy requests require an authenticated admin token." },
      { status: 401 }
    );
  }

  const targetUrl = buildTargetUrl(request, pathSegments);
  const method = request.method.toUpperCase();

  let response;
  try {
    response = await fetch(targetUrl, {
      method,
      headers: buildForwardHeaders(request),
      body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Backend proxy failed to reach ${targetUrl.origin}.`,
        detail: error?.message || "Unknown proxy error",
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

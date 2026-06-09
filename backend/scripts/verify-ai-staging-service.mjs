import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");
const execFileAsync = promisify(execFile);

const SOURCE_PROPERTY_SLUG = "sobha-crescent-sector-63a-gurgaon";
const VERIFICATION_MARKER_PATTERN =
  /\b(?:BLOG MARKER|VISIBLE BLOG INDEX DETAIL|VISIBLE BLOG TITLE|UI BLOG TITLE|AI STAGING BLOG)\s+\d+(?:\s+\d+)?\s*/gi;
const SITE_CONTENT_VERIFICATION_MARKER_PATTERN =
  /\b(?:AI STAGING|QA SITE CONTENT) [A-Z][A-Z0-9 _-]* \d+(?: \d+)?\b/gi;
const PROPERTY_VERIFICATION_MARKER_PATTERN =
  /\b(?:AI STAGING PROPERTY|QA Layout|QA Payment|QA Possession)\s+\d+(?:\s+connectivity)?\s*/gi;

async function readRuntime() {
  const raw = await fs.readFile(runtimeFile, "utf8");
  return JSON.parse(raw);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    text,
    data,
  };
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function toId(value) {
  if (!value) return null;
  if (typeof value === "object") {
    return value._id || null;
  }
  return value;
}

function marker(label, stamp) {
  return `AI STAGING ${label} ${stamp}`;
}

function stripVerificationMarkers(value) {
  return String(value || "")
    .replace(VERIFICATION_MARKER_PATTERN, "")
    .replace(SITE_CONTENT_VERIFICATION_MARKER_PATTERN, "")
    .replace(PROPERTY_VERIFICATION_MARKER_PATTERN, "")
    .replace(/<p>\s*<\/p>\s*/gi, "")
    .replace(/\s*;\s*(?=;|$)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripMarkersDeep(value) {
  if (typeof value === "string") return stripVerificationMarkers(value);
  if (Array.isArray(value)) return value.map(stripMarkersDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, stripMarkersDeep(entry)])
    );
  }
  return value;
}

function siteContentMarker(label, stamp, index) {
  return `QA SITE CONTENT ${label} ${stamp} ${index + 1}`;
}

function formatPriceInLakhsCrores(price) {
  const priceNum = Number(price);
  if (!priceNum || Number.isNaN(priceNum) || priceNum <= 0) return null;
  if (priceNum >= 10000000) {
    const crores = priceNum / 10000000;
    const formattedCrores = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(1);
    return `₹${formattedCrores} ${crores === 1 ? "Crore" : "Crores"}`;
  }
  if (priceNum >= 100000) {
    const lakhs = priceNum / 100000;
    const formattedLakhs = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${formattedLakhs} ${lakhs === 1 ? "Lakh" : "Lakhs"}`;
  }
  return `₹${priceNum.toLocaleString("en-IN")}`;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractTitle(html) {
  const match = String(html || "").match(/<title>([^<]*)<\/title>/i);
  return decodeHtml(match?.[1] || "").trim();
}

function extractMetaDescription(html) {
  const match = String(html || "").match(
    /<meta\s+name="description"\s+content="([^"]*)"/i
  );
  return decodeHtml(match?.[1] || "").trim();
}

async function verifyBasicRoutes() {
  const checks = [
    ["backend health", "http://localhost:5001/health", 200],
    ["admin staging", "http://localhost:3000/cmsadminlogin/ai-suggestion-staging", 200],
    ["admin staging plural alias", "http://localhost:3000/cmsadminlogin/ai-suggestions-staging", 200],
    ["public staging hidden", "http://localhost:3000/ai-suggestion-staging", 404],
    ["home", "http://localhost:3000/", 200],
    ["about", "http://localhost:3000/about", 200],
    ["blog", "http://localhost:3000/blog", 200],
    ["properties", "http://localhost:3000/properties", 200],
    ["contact", "http://localhost:3000/contact", 200],
    ["partner", "http://localhost:3000/become-partner", 200],
    ["legal services", "http://localhost:3000/lawyer", 200],
    ["financial services", "http://localhost:3000/financer", 200],
    ["architecture services", "http://localhost:3000/architect", 200],
    ["chartered accountant services", "http://localhost:3000/chartered-accountant", 200],
    ["property management services", "http://localhost:3000/property-management-services", 200],
    ["site content home frontend", "http://localhost:5001/frontend/api/site-content/home", 200],
    ["site content about frontend", "http://localhost:5001/frontend/api/site-content/about", 200],
    ["site content contact frontend", "http://localhost:5001/frontend/api/site-content/contact", 200],
    ["site content partner frontend", "http://localhost:5001/frontend/api/site-content/partner", 200],
    ["site content footer frontend", "http://localhost:5001/frontend/api/site-content/footer", 200],
    ["site content legal frontend", "http://localhost:5001/frontend/api/site-content/legal", 200],
    ["site content finance frontend", "http://localhost:5001/frontend/api/site-content/finance", 200],
    ["site content architecture frontend", "http://localhost:5001/frontend/api/site-content/architecture", 200],
    ["site content ca frontend", "http://localhost:5001/frontend/api/site-content/chartered-accountant", 200],
    ["site content pms frontend", "http://localhost:5001/frontend/api/site-content/property-management", 200],
  ];

  for (const [label, url, expectedStatus] of checks) {
    const response = await request(url);
    expect(
      response.status === expectedStatus,
      `${label} expected ${expectedStatus}, got ${response.status}`
    );
  }
}

async function verifyPropertyFlow(runtime, stamp) {
  const apiBase = `http://localhost:${runtime.port}`;
  const authHeaders = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };

  const sourcePublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(sourcePublic.ok, `Failed to fetch source property ${SOURCE_PROPERTY_SLUG}`);

  const source = sourcePublic.data?.data;
  expect(source?._id, "Source property payload is missing an id");

  const sourceAdmin = await request(`${apiBase}/admin/api/property/${source._id}`, {
    headers: authHeaders,
  });
  expect(sourceAdmin.ok, "Failed to fetch source property from admin API");

  const sourceAdminData = sourceAdmin.data?.data;
  const assignedAgentIds = Array.isArray(sourceAdminData?.assignedAgent)
    ? sourceAdminData.assignedAgent.map((agent) => toId(agent)).filter(Boolean)
    : [];
  const amenityCatalog = await request(`${apiBase}/frontend/api/amenities`);
  expect(amenityCatalog.ok, "Failed to fetch amenity catalog");
  const amenityIndex = new Map(
    (amenityCatalog.data?.data || []).map((item) => [String(item?.title || "").trim(), toId(item)])
  );

  const originalTitle = stripVerificationMarkers(sourceAdminData?.description?.title);
  const originalDescription = stripVerificationMarkers(sourceAdminData?.description?.description);
  const originalMetaTitle = stripVerificationMarkers(sourceAdminData?.description?.metaTitle);
  const originalMetaDescription = stripVerificationMarkers(sourceAdminData?.description?.metaDescription);
  const originalAddress = stripVerificationMarkers(sourceAdminData?.location?.address);
  const originalNearBy = stripVerificationMarkers(sourceAdminData?.location?.nearBy);
  const originalPaymentPlan = stripVerificationMarkers(sourceAdminData?.description?.paymentPlan);
  const originalPropertyStatus = stripVerificationMarkers(sourceAdminData?.details?.propertyStatus);
  const originalPossessionDate = stripVerificationMarkers(sourceAdminData?.details?.possessionDate);
  const originalAmenities = Array.isArray(sourceAdminData?.amenities)
    ? sourceAdminData.amenities.map((item) => toId(item)).filter(Boolean)
    : [];
  const originalFloorPlans = Array.isArray(sourceAdminData?.description?.floorPlans)
    ? sourceAdminData.description.floorPlans
    : [];
  const originalPriceValue = Number(sourceAdminData?.description?.price || 0);
  const nextPriceValue = originalPriceValue + 100000;
  const propertyMarker = marker("PROPERTY", stamp);
  const statusMarker =
    originalPropertyStatus === "New Launch" ? "Under Construction" : "New Launch";
  const possessionMarker = `QA Possession ${stamp}`;
  const paymentPlanMarker = `QA Payment ${stamp}`;
  const layoutMarker = `QA Layout ${stamp}`;
  const amenityMarkerTitle =
    amenityIndex.get("ATM facility") ? "ATM facility" : amenityIndex.get("Cafeteria") ? "Cafeteria" : null;
  expect(amenityMarkerTitle, "Amenity catalog is missing the expected verification titles");
  const updatedAmenityIds = Array.from(
    new Set([originalAmenities[0], amenityIndex.get(amenityMarkerTitle)].filter(Boolean))
  );
  const updatePayload = {
    assignedAgent: assignedAgentIds,
    description: {
      title: `${originalTitle} ${propertyMarker}`.trim(),
      description: `${originalDescription}\n\n${propertyMarker}`,
      metaTitle: `${originalMetaTitle} [${stamp}]`,
      metaDescription: `${originalMetaDescription} ${propertyMarker}`.trim(),
    },
  };

  if (
    originalTitle !== (sourceAdminData?.description?.title || "") ||
    originalDescription !== (sourceAdminData?.description?.description || "") ||
    originalMetaTitle !== (sourceAdminData?.description?.metaTitle || "") ||
    originalMetaDescription !== (sourceAdminData?.description?.metaDescription || "") ||
    originalAddress !== (sourceAdminData?.location?.address || "") ||
    originalNearBy !== (sourceAdminData?.location?.nearBy || "") ||
    originalPaymentPlan !== (sourceAdminData?.description?.paymentPlan || "") ||
    originalPropertyStatus !== (sourceAdminData?.details?.propertyStatus || "") ||
    originalPossessionDate !== (sourceAdminData?.details?.possessionDate || "")
  ) {
    const cleanupResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        assignedAgent: assignedAgentIds,
        description: {
          title: originalTitle,
          description: originalDescription,
          metaTitle: originalMetaTitle,
          metaDescription: originalMetaDescription,
          paymentPlan: originalPaymentPlan,
        },
        location: {
          address: originalAddress,
          nearBy: originalNearBy,
        },
        details: {
          propertyStatus: originalPropertyStatus,
          possessionDate: originalPossessionDate,
        },
      }),
    });
    expect(cleanupResult.ok, "Failed to clean stale property verification markers");
  }

  const descriptionUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify(updatePayload),
  });
  expect(
    descriptionUpdateResult.ok,
    `Property description update failed: ${JSON.stringify(descriptionUpdateResult.data)}`
  );

  const updatedDescriptionPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedDescriptionPublic.ok, "Updated property was not returned by public API");
  expect(
    String(updatedDescriptionPublic.data?.data?.description?.description || "").includes(propertyMarker),
    "Updated property description marker was not reflected in the public API"
  );
  expect(
    String(updatedDescriptionPublic.data?.data?.description?.title || "").includes(propertyMarker),
    "Updated property title marker was not reflected in the public API"
  );
  expect(
    String(updatedDescriptionPublic.data?.data?.description?.metaDescription || "").includes(propertyMarker),
    "Updated property meta description was not reflected in the public API"
  );

  const descriptionPage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(descriptionPage.ok, "Updated property page did not load");
  expect(
    descriptionPage.text.includes(propertyMarker),
    "Updated property marker was not reflected in frontend HTML"
  );
  expect(
    extractTitle(descriptionPage.text) === `${originalMetaTitle} [${stamp}] || JameenWallah`,
    "Updated property meta title was not reflected in frontend HTML"
  );
  expect(
    extractMetaDescription(descriptionPage.text) === `${originalMetaDescription} ${propertyMarker}`.trim(),
    "Updated property meta description was not reflected in frontend HTML"
  );

  const nearbyMarker = `${propertyMarker} connectivity`;
  const nearbyUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      location: {
        address: `${originalAddress} ${propertyMarker} address`.trim(),
        nearBy: `${originalNearBy}; ${nearbyMarker}`,
      },
    }),
  });
  expect(nearbyUpdateResult.ok, "Failed to update nearby highlights");

  const updatedNearbyPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedNearbyPublic.ok, "Updated property was not returned after nearby update");
  expect(
    String(updatedNearbyPublic.data?.data?.location?.nearBy || "").includes(nearbyMarker),
    "Updated nearby marker was not reflected in the public API"
  );
  expect(
    String(updatedNearbyPublic.data?.data?.location?.address || "").includes(propertyMarker),
    "Updated address marker was not reflected in the public API"
  );

  const updatedFloorPlans = originalFloorPlans.map((plan) => ({
    ...plan,
    price: String(nextPriceValue),
  }));

  const priceUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        price: nextPriceValue,
        floorPlans: updatedFloorPlans,
      },
    }),
  });
  expect(priceUpdateResult.ok, "Failed to update price field independently");

  const updatedPricePublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedPricePublic.ok, "Updated property was not returned after price update");
  expect(
    Number(updatedPricePublic.data?.data?.description?.price || 0) === nextPriceValue,
    "Updated base price was not reflected in the public API"
  );
  const updatedPricePage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedPricePage.ok, "Updated price page did not load");
  expect(
    updatedPricePage.text.includes(formatPriceInLakhsCrores(nextPriceValue)),
    "Updated listing price was not reflected in frontend HTML"
  );

  const detailsUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      details: {
        propertyStatus: statusMarker,
        possessionDate: possessionMarker,
      },
      description: {
        paymentPlan: paymentPlanMarker,
      },
    }),
  });
  expect(detailsUpdateResult.ok, "Failed to update property status/possession/payment plan");

  const updatedDetailsPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedDetailsPublic.ok, "Updated property was not returned after status update");
  expect(
    updatedDetailsPublic.data?.data?.details?.propertyStatus === statusMarker,
    "Updated property status was not reflected in the public API"
  );
  expect(
    updatedDetailsPublic.data?.data?.details?.possessionDate === possessionMarker,
    "Updated possession date was not reflected in the public API"
  );
  expect(
    updatedDetailsPublic.data?.data?.description?.paymentPlan === paymentPlanMarker,
    "Updated payment plan was not reflected in the public API"
  );

  const updatedDetailsPage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedDetailsPage.ok, "Updated details page did not load");
  expect(updatedDetailsPage.text.includes(statusMarker), "Updated property status was not reflected in frontend HTML");
  expect(updatedDetailsPage.text.includes(possessionMarker), "Updated possession date was not reflected in frontend HTML");
  expect(updatedDetailsPage.text.includes(paymentPlanMarker), "Updated payment plan was not reflected in frontend HTML");

  const amenitiesUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      amenities: updatedAmenityIds,
    }),
  });
  expect(amenitiesUpdateResult.ok, "Failed to update amenities");

  const updatedAmenitiesPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedAmenitiesPublic.ok, "Updated property was not returned after amenities update");
  expect(
    Array.isArray(updatedAmenitiesPublic.data?.data?.amenities) &&
      updatedAmenitiesPublic.data.data.amenities.some((item) => String(item?.title || "").trim() === amenityMarkerTitle),
    "Updated amenities were not reflected in the public API"
  );

  const updatedAmenitiesPage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedAmenitiesPage.ok, "Updated amenities page did not load");
  expect(updatedAmenitiesPage.text.includes(amenityMarkerTitle), "Updated amenity was not reflected in frontend HTML");

  const multipartAmenityForm = new FormData();
  multipartAmenityForm.append("amenities", JSON.stringify(originalAmenities));
  const multipartAmenitiesRestore = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${runtime.adminToken}`,
    },
    body: multipartAmenityForm,
  });
  expect(
    multipartAmenitiesRestore.ok,
    `Multipart amenities restore failed: ${JSON.stringify(multipartAmenitiesRestore.data)}`
  );

  const restoredMultipartAmenitiesPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(restoredMultipartAmenitiesPublic.ok, "Updated property was not returned after multipart amenities restore");
  const restoredMultipartAmenityIds = new Set(
    (restoredMultipartAmenitiesPublic.data?.data?.amenities || [])
      .map((item) => toId(item))
      .filter(Boolean)
  );
  expect(
    originalAmenities.every((id) => restoredMultipartAmenityIds.has(id)),
    "Multipart amenities restore was not reflected in the public API"
  );

  const updatedLayoutPlans = originalFloorPlans.map((plan, index) =>
    index === 0
      ? {
          ...plan,
          unitType: `${plan?.unitType || "Floor Plan"} ${layoutMarker}`,
        }
      : plan
  );

  const layoutsUpdateResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        floorPlans: updatedLayoutPlans,
      },
    }),
  });
  expect(layoutsUpdateResult.ok, "Failed to update floor plans");

  const updatedLayoutsPublic = await request(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedLayoutsPublic.ok, "Updated property was not returned after floor plan update");
  expect(
    String(updatedLayoutsPublic.data?.data?.description?.floorPlans?.[0]?.unitType || "").includes(layoutMarker),
    "Updated floor plan title was not reflected in the public API"
  );

  const updatedLayoutsPage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(updatedLayoutsPage.ok, "Updated layouts page did not load");
  expect(updatedLayoutsPage.text.includes(layoutMarker), "Updated floor plan title was not reflected in frontend HTML");

  const restoreDescriptionResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        title: originalTitle,
        description: originalDescription,
        metaTitle: originalMetaTitle,
        metaDescription: originalMetaDescription,
      },
    }),
  });
  expect(restoreDescriptionResult.ok, "Failed to restore property description");

  const restoreNearbyResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      location: {
        address: originalAddress,
        nearBy: originalNearBy,
      },
    }),
  });
  expect(restoreNearbyResult.ok, "Failed to restore nearby highlights");

  const restorePriceResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        price: originalPriceValue,
        floorPlans: originalFloorPlans,
      },
    }),
  });
  expect(restorePriceResult.ok, "Failed to restore price and floor plans");

  const restoreDetailsResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      details: {
        propertyStatus: originalPropertyStatus,
        possessionDate: originalPossessionDate,
      },
      description: {
        paymentPlan: originalPaymentPlan,
      },
    }),
  });
  expect(restoreDetailsResult.ok, "Failed to restore property status/possession/payment plan");

  const restoreAmenitiesResult = await request(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      amenities: originalAmenities,
    }),
  });
  expect(restoreAmenitiesResult.ok, "Failed to restore amenities");

  const restoredPage = await request(
    `http://localhost:3000/property/${encodeURIComponent(SOURCE_PROPERTY_SLUG)}`
  );
  expect(restoredPage.ok, "Restored property page did not load");
  expect(
    !restoredPage.text.includes(propertyMarker),
    "Property marker still visible after restore"
  );
}

async function verifySiteContentApiFlow(runtime, stamp, pageKey, checks) {
  const apiBase = `http://localhost:${runtime.port}`;
  const authHeaders = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };

  const current = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
    headers: authHeaders,
  });
  expect(current.ok, `Failed to fetch site content for ${pageKey}`);

  const original = stripMarkersDeep(current.data?.data);
  for (const [index, check] of checks.entries()) {
    const siteMarker = siteContentMarker(pageKey.toUpperCase(), stamp, index);
    const updateBody = {
      title: original.title,
      route: original.route,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      status: original.status,
      sections: structuredClone(original?.sections || {}),
    };

    if (check.kind === "meta") {
      const currentValue = updateBody[check.path];
      expect(typeof currentValue === "string", `${pageKey} field ${check.path} is not a string`);
      updateBody[check.path] = `${currentValue} ${siteMarker}`.trim();
    } else if (check.kind === "list") {
      const currentValue = check.path.reduce((acc, key) => acc?.[key], updateBody);
      const nextItems = Array.isArray(currentValue) ? currentValue : [];
      const sample = nextItems[0];
      let cursor = updateBody;
      for (let pathIndex = 0; pathIndex < check.path.length - 1; pathIndex += 1) {
        const key = check.path[pathIndex];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      if (typeof sample === "string") {
        cursor[check.path.at(-1)] = [...nextItems, `List verification ${siteMarker}`];
      } else if (sample?.label || sample?.href) {
        cursor[check.path.at(-1)] = [
          ...nextItems,
          { label: `Marker ${siteMarker}`, href: "/contact" },
        ];
      } else {
        cursor[check.path.at(-1)] = [
          ...nextItems,
          { ...(sample || {}), title: `Marker ${siteMarker}`, text: `List verification ${siteMarker}` },
        ];
      }
    } else {
      const currentValue = check.path.reduce((acc, key) => acc?.[key], updateBody);
      let cursor = updateBody;
      for (let pathIndex = 0; pathIndex < check.path.length - 1; pathIndex += 1) {
        const key = check.path[pathIndex];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      cursor[check.path.at(-1)] = `${typeof currentValue === "string" ? currentValue : ""} ${siteMarker}`.trim();
    }

    const updateResult = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(updateBody),
    });
    expect(updateResult.ok, `Failed to update site content for ${pageKey}:${check.kind}`);

    const frontendApiResponse = await request(`${apiBase}/frontend/api/site-content/${pageKey}`);
    expect(frontendApiResponse.ok, `${pageKey} frontend site-content API did not load`);
    expect(
      frontendApiResponse.text.includes(siteMarker),
      `${pageKey} frontend site-content API did not reflect marker for ${check.kind}:${check.path}`
    );

    const restoreResult = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: original.title,
        route: original.route,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        status: original.status,
        sections: original.sections,
      }),
    });
    expect(restoreResult.ok, `Failed to restore site content for ${pageKey}`);

    const restoredApiResponse = await request(`${apiBase}/frontend/api/site-content/${pageKey}`);
    expect(restoredApiResponse.ok, `${pageKey} frontend site-content API did not load after restore`);
    expect(
      !restoredApiResponse.text.includes(siteMarker),
      `${pageKey} marker still visible in frontend API after restore for ${check.kind}:${check.path}`
    );
  }
}

async function verifySiteContentFlow(runtime, stamp, pageKey, pageUrl, checks) {
  const apiBase = `http://localhost:${runtime.port}`;
  const authHeaders = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };

  const current = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
    headers: authHeaders,
  });
  expect(current.ok, `Failed to fetch site content for ${pageKey}`);

  const original = stripMarkersDeep(current.data?.data);
  for (const [index, check] of checks.entries()) {
    const siteMarker = siteContentMarker(pageKey.toUpperCase(), stamp, index);
    const updateBody = {
      title: original.title,
      route: original.route,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      status: original.status,
      sections: structuredClone(original?.sections || {}),
    };

    if (check.kind === "meta") {
      const currentValue = updateBody[check.path];
      expect(typeof currentValue === "string", `${pageKey} field ${check.path} is not a string`);
      updateBody[check.path] = `${currentValue} ${siteMarker}`.trim();
    } else if (check.kind === "list") {
      const currentValue = check.path.reduce((acc, key) => acc?.[key], updateBody);
      const nextItems = Array.isArray(currentValue) ? currentValue : [];
      const sample = nextItems[0];
      let cursor = updateBody;
      for (let pathIndex = 0; pathIndex < check.path.length - 1; pathIndex += 1) {
        const key = check.path[pathIndex];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      if (typeof sample === "string") {
        cursor[check.path.at(-1)] = [...nextItems, `List verification ${siteMarker}`];
      } else if (sample?.label || sample?.href) {
        cursor[check.path.at(-1)] = [
          ...nextItems,
          { label: `Marker ${siteMarker}`, href: "/contact" },
        ];
      } else {
        cursor[check.path.at(-1)] = [
          ...nextItems,
          { ...(sample || {}), title: `Marker ${siteMarker}`, text: `List verification ${siteMarker}` },
        ];
      }
    } else {
      const currentValue = check.path.reduce((acc, key) => acc?.[key], updateBody);
      let cursor = updateBody;
      for (let pathIndex = 0; pathIndex < check.path.length - 1; pathIndex += 1) {
        const key = check.path[pathIndex];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      cursor[check.path.at(-1)] = `${typeof currentValue === "string" ? currentValue : ""} ${siteMarker}`.trim();
    }

    const updateResult = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(updateBody),
    });
    expect(updateResult.ok, `Failed to update site content for ${pageKey}:${check.kind}`);

    const pageResponse = await request(pageUrl);
    expect(pageResponse.ok, `${pageKey} page did not load`);
    expect(
      pageResponse.text.includes(siteMarker),
      `${pageKey} page did not reflect marker for ${check.kind}:${check.path}`
    );

    const restoreResult = await request(`${apiBase}/admin/api/site-content/${pageKey}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: original.title,
        route: original.route,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        status: original.status,
        sections: original.sections,
      }),
    });
    expect(restoreResult.ok, `Failed to restore site content for ${pageKey}`);

    const restoredPage = await request(pageUrl);
    expect(restoredPage.ok, `${pageKey} page did not load after restore`);
    expect(
      !restoredPage.text.includes(siteMarker),
      `${pageKey} marker still visible after restore for ${check.kind}:${check.path}`
    );
  }
}

async function verifyBlogFlow(runtime, stamp) {
  const apiBase = `http://localhost:${runtime.port}`;
  const authHeaders = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };

  const blogList = await request(`${apiBase}/admin/api/blog`, {
    headers: authHeaders,
  });
  expect(blogList.ok, "Failed to fetch blogs from admin API");

  const blog = blogList.data?.data?.[0];
  expect(blog?._id, "No blog available for verification");

  const originalTitle = stripVerificationMarkers(blog.title);
  const originalDescription = stripVerificationMarkers(blog.description);
  const originalMetaTitle = stripVerificationMarkers(blog.metaTitle);
  const originalMetaDescription = stripVerificationMarkers(blog.metaDescription);
  const originalTags = Array.isArray(blog.tags)
    ? blog.tags.map(stripVerificationMarkers).filter(Boolean)
    : [];
  if (
    originalTitle !== blog.title ||
    originalDescription !== blog.description ||
    originalMetaTitle !== blog.metaTitle ||
    originalMetaDescription !== blog.metaDescription ||
    JSON.stringify(originalTags) !== JSON.stringify(blog.tags || [])
  ) {
    const cleanupResult = await request(`${apiBase}/admin/api/blog/${blog._id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: originalTitle,
        blogCategory: toId(blog.blogCategory),
        slug: blog.slug,
        source: blog.source || "",
        date: blog.date,
        description: originalDescription,
        tags: originalTags,
        metaTitle: originalMetaTitle,
        metaDescription: originalMetaDescription,
        status: blog.status || "active",
      }),
    });
    expect(cleanupResult.ok, "Failed to clean stale blog verification markers");
  }
  const blogChecks = [
    { key: "title" },
    { key: "description" },
    { key: "tags" },
    { key: "metaTitle" },
    { key: "metaDescription" },
  ];

  for (const [index, check] of blogChecks.entries()) {
    const blogMarker = `${marker("BLOG", stamp)} ${index + 1}`;
    const payload = {
      title: originalTitle,
      blogCategory: toId(blog.blogCategory),
      slug: blog.slug,
      source: blog.source || "",
      date: blog.date,
      description: originalDescription,
      tags: originalTags,
      metaTitle: originalMetaTitle,
      metaDescription: originalMetaDescription,
      status: blog.status || "active",
    };

    if (check.key === "title") {
      payload.title = `${originalTitle} ${blogMarker}`;
    } else if (check.key === "description") {
      payload.description = `<p>${blogMarker}</p>\n${originalDescription}`;
    } else if (check.key === "tags") {
      payload.tags = [blogMarker, ...originalTags.filter((tag) => tag !== blogMarker)];
    } else if (check.key === "metaTitle") {
      payload.metaTitle = `${originalMetaTitle} [${stamp}-${index + 1}]`;
    } else if (check.key === "metaDescription") {
      payload.metaDescription = `${originalMetaDescription} ${blogMarker}`.trim();
    }

    let verificationError = null;

    try {
      const updateResult = await request(`${apiBase}/admin/api/blog/${blog._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      expect(updateResult.ok, `Failed to update blog field ${check.key}: ${JSON.stringify(updateResult.data)}`);

      const blogPage = await request(`http://localhost:3000/blog/${encodeURIComponent(blog.slug)}`);
      expect(blogPage.ok, "Updated blog page did not load");

      if (check.key === "title") {
        expect(blogPage.text.includes(`${originalTitle} ${blogMarker}`), "Updated blog title was not reflected on the detail page");
        const blogIndexPage = await request("http://localhost:3000/blog");
        expect(blogIndexPage.ok, "Blog index page did not load");
        expect(blogIndexPage.text.includes(`${originalTitle} ${blogMarker}`), "Updated blog title was not reflected on the blog index page");
      }

      if (check.key === "description") {
        expect(blogPage.text.includes(blogMarker), "Updated blog marker was not reflected on the detail page");
        const blogIndexPage = await request("http://localhost:3000/blog");
        expect(blogIndexPage.ok, "Blog index page did not load");
        expect(blogIndexPage.text.includes(blogMarker), "Updated blog marker was not reflected on the blog index page");
      }

      if (check.key === "tags") {
        const blogIndexPage = await request("http://localhost:3000/blog");
        expect(blogIndexPage.ok, "Blog index page did not load");
        expect(blogIndexPage.text.includes(blogMarker), "Updated blog tag was not reflected on the blog index page");
      }

      if (check.key === "metaTitle") {
        expect(
          extractTitle(blogPage.text) === `${originalMetaTitle} [${stamp}-${index + 1}]`,
          "Updated blog meta title was not reflected on the detail page"
        );
      }

      if (check.key === "metaDescription") {
        expect(
          extractMetaDescription(blogPage.text) === `${originalMetaDescription} ${blogMarker}`.trim(),
          "Updated blog meta description was not reflected on the detail page"
        );
      }

      expect(
        blogPage.text.includes(
          "Latest real estate insights, investment tips, and market trends across Gurgaon, Noida, and Delhi NCR."
        ),
        "Blog detail related-posts subtitle is still using placeholder copy"
      );
    } catch (error) {
      verificationError = error;
    }

    const restoreResult = await request(`${apiBase}/admin/api/blog/${blog._id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: originalTitle,
        blogCategory: toId(blog.blogCategory),
        slug: blog.slug,
        source: blog.source || "",
        date: blog.date,
        description: originalDescription,
        tags: originalTags,
        metaTitle: originalMetaTitle,
        metaDescription: originalMetaDescription,
        status: blog.status || "active",
      }),
    });
    expect(restoreResult.ok, "Failed to restore blog");

    const restoredPage = await request(`http://localhost:3000/blog/${encodeURIComponent(blog.slug)}`);
    expect(restoredPage.ok, "Restored blog page did not load");
    expect(!restoredPage.text.includes(blogMarker), "Blog marker still visible after restore");

    if (verificationError) {
      throw verificationError;
    }
  }
}

async function main() {
  const runtime = await readRuntime();
  const stamp = Date.now();

  console.log(`Using local stack on port ${runtime.port}`);
  console.log(`Using local admin ${runtime.adminEmail}`);
  console.log(`Using local Mongo ${runtime.mongoUri}`);

  await verifyBasicRoutes();
  await verifySiteContentFlow(runtime, stamp, "home", "http://localhost:3000/", [
    { kind: "section", path: ["sections", "featured", "title"] },
    { kind: "section", path: ["sections", "featured", "description"] },
    { kind: "section", path: ["sections", "locations", "title"] },
    { kind: "section", path: ["sections", "locations", "description"] },
    { kind: "section", path: ["sections", "explore", "title"] },
    { kind: "section", path: ["sections", "explore", "description"] },
    { kind: "section", path: ["sections", "cityShowcase", "title"] },
    { kind: "section", path: ["sections", "cityShowcase", "description"] },
    { kind: "section", path: ["sections", "blog", "title"] },
    { kind: "section", path: ["sections", "blog", "description"] },
    { kind: "section", path: ["sections", "partners", "title"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "about", "http://localhost:3000/about", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "intro", "heading"] },
    { kind: "section", path: ["sections", "intro", "summary"] },
    { kind: "section", path: ["sections", "intro", "emphasis"] },
    { kind: "section", path: ["sections", "intro", "origin"] },
    { kind: "section", path: ["sections", "intro", "mission"] },
    { kind: "section", path: ["sections", "whatWeDo", "title"] },
    { kind: "list", path: ["sections", "whatWeDo", "items"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "contact", "http://localhost:3000/contact", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "intro", "title"] },
    { kind: "section", path: ["sections", "intro", "description"] },
    { kind: "list", path: ["sections", "intro", "benefits"] },
    { kind: "section", path: ["sections", "form", "title"] },
    { kind: "section", path: ["sections", "office", "title"] },
    { kind: "section", path: ["sections", "office", "description"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "partner", "http://localhost:3000/become-partner", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "heading"] },
    { kind: "section", path: ["sections", "hero", "description"] },
    { kind: "section", path: ["sections", "hero", "secondaryDescription"] },
    { kind: "section", path: ["sections", "form", "title"] },
    { kind: "section", path: ["sections", "whoCanPartner", "title"] },
    { kind: "section", path: ["sections", "whoCanPartner", "description"] },
    { kind: "list", path: ["sections", "whoCanPartner", "items"] },
    { kind: "section", path: ["sections", "benefits", "title"] },
    { kind: "section", path: ["sections", "benefits", "description"] },
    { kind: "list", path: ["sections", "benefits", "items"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "legal", "http://localhost:3000/lawyer", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "description"] },
    { kind: "section", path: ["sections", "services", "title"] },
    { kind: "section", path: ["sections", "services", "description"] },
    { kind: "list", path: ["sections", "services", "items"] },
    { kind: "section", path: ["sections", "whyUs", "title"] },
    { kind: "section", path: ["sections", "whyUs", "description"] },
    { kind: "list", path: ["sections", "whyUs", "items"] },
    { kind: "section", path: ["sections", "consultation", "title"] },
    { kind: "section", path: ["sections", "consultation", "description"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "finance", "http://localhost:3000/financer", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "desc"] },
    { kind: "section", path: ["sections", "services", "heading"] },
    { kind: "section", path: ["sections", "services", "subheading"] },
    { kind: "list", path: ["sections", "services", "items"] },
    { kind: "section", path: ["sections", "whyUs", "title"] },
    { kind: "list", path: ["sections", "whyUs", "features"] },
    { kind: "section", path: ["sections", "process", "title"] },
    { kind: "section", path: ["sections", "process", "desc"] },
    { kind: "list", path: ["sections", "process", "steps"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "architecture", "http://localhost:3000/architect", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "desc"] },
    { kind: "section", path: ["sections", "services", "heading"] },
    { kind: "section", path: ["sections", "services", "subheading"] },
    { kind: "list", path: ["sections", "services", "items"] },
    { kind: "section", path: ["sections", "whyUs", "title"] },
    { kind: "section", path: ["sections", "whyUs", "desc"] },
    { kind: "list", path: ["sections", "whyUs", "features"] },
    { kind: "section", path: ["sections", "process", "title"] },
    { kind: "section", path: ["sections", "process", "desc"] },
    { kind: "list", path: ["sections", "process", "steps"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentFlow(runtime, stamp, "chartered-accountant", "http://localhost:3000/chartered-accountant", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "desc"] },
    { kind: "section", path: ["sections", "services", "heading"] },
    { kind: "section", path: ["sections", "services", "subheading"] },
    { kind: "list", path: ["sections", "services", "items"] },
    { kind: "section", path: ["sections", "whyUs", "title"] },
    { kind: "section", path: ["sections", "whyUs", "desc"] },
    { kind: "list", path: ["sections", "whyUs", "features"] },
    { kind: "section", path: ["sections", "process", "title"] },
    { kind: "section", path: ["sections", "process", "desc"] },
    { kind: "list", path: ["sections", "process", "steps"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentApiFlow(runtime, stamp, "property-management", [
    { kind: "section", path: ["sections", "hero", "title"] },
    { kind: "section", path: ["sections", "hero", "description"] },
    { kind: "section", path: ["sections", "services", "title"] },
    { kind: "section", path: ["sections", "services", "description"] },
    { kind: "section", path: ["sections", "whyUs", "kicker"] },
    { kind: "section", path: ["sections", "whyUs", "title"] },
    { kind: "section", path: ["sections", "whyUs", "description"] },
    { kind: "list", path: ["sections", "whyUs", "items"] },
    { kind: "section", path: ["sections", "cta", "title"] },
    { kind: "section", path: ["sections", "cta", "description"] },
    { kind: "section", path: ["sections", "cta", "button"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifySiteContentApiFlow(runtime, stamp, "footer", [
    { kind: "section", path: ["sections", "services", "title"] },
    { kind: "list", path: ["sections", "services", "links"] },
    { kind: "meta", path: "metaTitle" },
    { kind: "meta", path: "metaDescription" },
  ]);
  await verifyBlogFlow(runtime, stamp);
  await verifyPropertyFlow(runtime, stamp);
  await execFileAsync(process.execPath, [path.resolve(__dirname, "verify-local-flow.mjs")], {
    cwd: backendDir,
  });

  console.log("");
  console.log("AI staging service verification summary");
  console.log("- Backend health: OK");
  console.log("- Admin staging route: OK");
  console.log("- Admin staging plural alias route: OK");
  console.log("- Public staging route hidden: OK");
  console.log("- Home page: OK");
  console.log("- About page: OK");
  console.log("- Blog index page: OK");
  console.log("- Properties page: OK");
  console.log("- Home site-content update + restore: OK");
  console.log("- About site-content update + restore: OK");
  console.log("- Contact, partner and server-rendered service-page site-content update + restore: OK");
  console.log("- Footer and property-management site-content API update + restore: OK");
  console.log("- Blog update + restore: OK");
  console.log("- Property field-level push/reflect/restore (content, SEO, price, status, payment, amenities, layouts, connectivity): OK");
  console.log("- Property insertion/update/restore via existing verifier: OK");
}

main().catch((error) => {
  console.error("AI staging service verification failed");
  console.error(error);
  process.exit(1);
});

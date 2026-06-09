import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");

const SOURCE_SLUG = "sobha-crescent-sector-63a-gurgaon";

async function readRuntime() {
  const raw = await fs.readFile(runtimeFile, "utf8");
  return JSON.parse(raw);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

function toId(value) {
  if (!value) return null;
  if (typeof value === "object" && value !== null) {
    return value._id || null;
  }
  return value;
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const runtime = await readRuntime();
  const apiBase = `http://localhost:${runtime.port}`;
  const authHeaders = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };

  console.log(`Using API base: ${apiBase}`);
  console.log(`Using local admin: ${runtime.adminEmail}`);

  const categories = await requestJson(`${apiBase}/frontend/api/categories`);
  expect(categories.ok, "Failed to fetch categories");

  const properties = await requestJson(
    `${apiBase}/frontend/api/properties?page=1&limit=3&sort=-createdAt`
  );
  expect(properties.ok, "Failed to fetch public properties");

  const sourcePublic = await requestJson(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_SLUG)}`
  );
  expect(sourcePublic.ok, `Failed to fetch source property ${SOURCE_SLUG}`);

  const source = sourcePublic.data?.data;
  expect(source?._id, "Source property payload is missing an id");

  const sourceAdmin = await requestJson(`${apiBase}/admin/api/property/${source._id}`, {
    headers: authHeaders,
  });
  expect(sourceAdmin.ok, "Failed to fetch source property from admin API");

  const sourceAdminData = sourceAdmin.data?.data;
  const assignedAgentIds = Array.isArray(sourceAdminData?.assignedAgent)
    ? sourceAdminData.assignedAgent.map((agent) => toId(agent)).filter(Boolean)
    : [];

  expect(assignedAgentIds.length > 0, "Source property has no assigned agent ids");

  const timestamp = Date.now();
  const createTitle = `Codex AI Demo Tower ${timestamp}`;
  const createSlug = `codex-ai-demo-tower-${timestamp}`;
  const createMetaTitle = `${createTitle} | AI Suggestion Staging Smoke Test`;
  const createMetaDescription =
    "This is a local smoke-test property created from the imported BigCat backup to verify admin insertion and website reflection.";

  const createPayload = {
    personalDetails: sourceAdminData.personalDetails || {},
    description: {
      ...sourceAdminData.description,
      title: createTitle,
      slug: createSlug,
      metaTitle: createMetaTitle,
      metaDescription: createMetaDescription,
      description:
        "AI Suggestion Staging created this local verification property to prove insertions and public reflection through the existing admin API.",
      price: Number(sourceAdminData?.description?.price || 0) + 123456,
      featuredProperty: "No",
      category: toId(sourceAdminData?.description?.category),
      propertyType: toId(sourceAdminData?.description?.propertyType),
      builder: toId(sourceAdminData?.description?.builder),
    },
    media: sourceAdminData.media || {},
    location: {
      ...sourceAdminData.location,
      state: toId(sourceAdminData?.location?.state),
      city: toId(sourceAdminData?.location?.city),
      area: toId(sourceAdminData?.location?.area),
    },
    details: {
      ...sourceAdminData.details,
      customId: `PROP-T${String(timestamp).slice(-5)}`,
    },
    amenities: Array.isArray(sourceAdminData?.amenities)
      ? sourceAdminData.amenities.map((item) => toId(item)).filter(Boolean)
      : [],
    assignedAgent: assignedAgentIds,
  };

  const createResult = await requestJson(`${apiBase}/admin/api/property/admin`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(createPayload),
  });
  expect(createResult.ok, `Property insertion failed: ${JSON.stringify(createResult.data)}`);

  const createdProperty = createResult.data?.data;
  expect(createdProperty?._id, "Created property response is missing an id");

  const createdPublic = await requestJson(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(createSlug)}`
  );
  expect(createdPublic.ok, "Inserted property was not returned by the public API");

  const createdPage = await fetch(`http://localhost:3000/property/${encodeURIComponent(createSlug)}`, {
    cache: "no-store",
  });
  const createdHtml = await createdPage.text();
  expect(createdPage.ok, "Inserted property page did not load on the frontend");
  expect(
    createdHtml.includes(createTitle) || createdHtml.includes(createMetaTitle),
    "Inserted property content was not reflected on the website page"
  );

  const originalMetaTitle = sourceAdminData?.description?.metaTitle || "";
  const originalMetaDescription = sourceAdminData?.description?.metaDescription || "";
  const originalDescription = sourceAdminData?.description?.description || "";
  const updatedMetaTitle = `${originalMetaTitle} [AI Verified Local Update]`;
  const updatedMetaDescription = `${originalMetaDescription} Local AI smoke test update applied successfully.`;
  const updatedDescription =
    `${originalDescription}\n\nAI staging smoke test reflection marker ${timestamp}.`;

  const updateResult = await requestJson(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        metaTitle: updatedMetaTitle,
        metaDescription: updatedMetaDescription,
        description: updatedDescription,
      },
    }),
  });
  expect(updateResult.ok, `Property update failed: ${JSON.stringify(updateResult.data)}`);

  const updatedPublic = await requestJson(
    `${apiBase}/frontend/api/properties/${encodeURIComponent(SOURCE_SLUG)}`
  );
  expect(updatedPublic.ok, "Updated property was not returned by public API");
  expect(
    updatedPublic.data?.data?.description?.metaTitle === updatedMetaTitle,
    "Updated meta title was not reflected in the public API"
  );
  expect(
    String(updatedPublic.data?.data?.description?.description || "").includes(
      `AI staging smoke test reflection marker ${timestamp}.`
    ),
    "Updated description was not reflected in the public API"
  );

  const updatedPage = await fetch(`http://localhost:3000/property/${encodeURIComponent(SOURCE_SLUG)}`, {
    cache: "no-store",
  });
  const updatedHtml = await updatedPage.text();
  expect(updatedPage.ok, "Updated property page did not load");
  expect(
    updatedHtml.includes(`AI staging smoke test reflection marker ${timestamp}.`),
    "Updated description was not reflected in the frontend HTML"
  );
  expect(
    updatedHtml.includes(updatedMetaTitle.replaceAll("&", "&amp;")),
    "Updated meta title was not reflected in the frontend HTML"
  );

  const restoreResult = await requestJson(`${apiBase}/admin/api/property/${source._id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      assignedAgent: assignedAgentIds,
      description: {
        metaTitle: originalMetaTitle,
        metaDescription: originalMetaDescription,
        description: originalDescription,
      },
    }),
  });
  expect(restoreResult.ok, "Failed to restore the source property after the smoke test");

  const deleteCreated = await requestJson(
    `${apiBase}/admin/api/property/${createdProperty._id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${runtime.adminToken}`,
      },
    }
  );
  expect(deleteCreated.ok, "Failed to delete the temporary inserted property");

  console.log("");
  console.log("Verification summary");
  console.log(`- Public categories endpoint: OK (${categories.data?.data?.length || 0} categories)`);
  console.log(`- Public properties endpoint: OK (${properties.data?.data?.length || 0} properties on sample page)`);
  console.log(`- Admin insertion: OK (${createdProperty._id})`);
  console.log(`- Inserted property slug: ${createSlug}`);
  console.log(`- Website reflection for insertion: OK (/property/${createSlug})`);
  console.log(`- Admin update: OK (${source._id})`);
  console.log(`- Website reflection for update: OK (/property/${SOURCE_SLUG})`);
  console.log(`- Source property restored: OK`);
  console.log(`- Temporary inserted property deleted: OK`);
}

main().catch((error) => {
  console.error("Verification failed");
  console.error(error);
  process.exit(1);
});

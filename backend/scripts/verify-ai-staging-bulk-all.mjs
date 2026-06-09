import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient, ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");

const SITE_PAGES = [
  { key: "home", route: "/" },
  { key: "about", route: "/about" },
  { key: "contact", route: "/contact" },
  { key: "partner", route: "/become-partner" },
  { key: "footer", route: "/" },
  { key: "legal", route: "/lawyer" },
  { key: "finance", route: "/financer" },
  { key: "architecture", route: "/architect" },
  { key: "chartered-accountant", route: "/chartered-accountant" },
  { key: "property-management", route: "/property-management-services" },
];

const SKIP_SITE_KEYS = new Set([
  "_id",
  "id",
  "pageKey",
  "route",
  "status",
  "icon",
  "href",
  "url",
  "src",
  "image",
  "alt",
  "slug",
  "createdAt",
  "updatedAt",
  "__v",
]);

function createStats() {
  return {
    properties: 0,
    propertyFields: 0,
    sitePages: 0,
    siteFields: 0,
    blogs: 0,
    blogFields: 0,
    pageLoads: 0,
  };
}

function id(value) {
  if (!value) return "";
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === "object") return String(value._id || "");
  return String(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function stableText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(stableText).join(" ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getPath(obj, dotPath) {
  return String(dotPath)
    .split(".")
    .reduce((cursor, key) => (cursor === undefined || cursor === null ? undefined : cursor[key]), obj);
}

function setPath(obj, dotPath, value) {
  const parts = String(dotPath).split(".");
  let cursor = obj;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    const nextKey = parts[index + 1];
    if (cursor[key] === undefined || cursor[key] === null) {
      cursor[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[parts.at(-1)] = value;
}

function flattenStringPaths(value, prefix = "") {
  if (typeof value === "string") return [[prefix, value]];
  if (!value || typeof value !== "object") return [];
  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  const paths = [];
  for (const [rawKey, child] of entries) {
    const key = String(rawKey);
    if (SKIP_SITE_KEYS.has(key)) continue;
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    paths.push(...flattenStringPaths(child, nextPrefix));
  }
  return paths;
}

function withMarker(value, marker) {
  const base = String(value || "").trim();
  return base ? `${base} ${marker}` : marker;
}

function nextPrice(original, index) {
  const parsed = Number(original);
  const base = Number.isFinite(parsed) && parsed > 0 ? parsed : 10000000;
  return base + 100000 + index;
}

function formatPriceInLakhsCrores(price) {
  const priceNum = Number(price);
  if (!priceNum || Number.isNaN(priceNum) || priceNum <= 0) return "";
  if (priceNum >= 10000000) {
    const crores = priceNum / 10000000;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(1);
    return `₹${formatted} ${crores === 1 ? "Crore" : "Crores"}`;
  }
  if (priceNum >= 100000) {
    const lakhs = priceNum / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${formatted} ${lakhs === 1 ? "Lakh" : "Lakhs"}`;
  }
  return `₹${priceNum.toLocaleString("en-IN")}`;
}

async function readRuntime() {
  return JSON.parse(await fs.readFile(runtimeFile, "utf8"));
}

async function request(url, options = {}) {
  const retries = options.retries ?? 2;
  let lastResult = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store", ...options });
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      const result = { ok: response.ok, status: response.status, text, data };
      lastResult = result;
      const retryable =
        response.status >= 500 &&
        /server monitor timeout|interrupted|ECONNRESET|ETIMEDOUT/i.test(text);
      if (!retryable || attempt === retries) return result;
    } catch (error) {
      lastResult = { ok: false, status: 0, text: error.message, data: error.message };
      if (attempt === retries) return lastResult;
    }
    await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  return lastResult;
}

function assertReflects(actual, expected) {
  if (expected === undefined) return true;
  if (typeof expected === "number") return Number(actual) === expected;
  if (Array.isArray(expected)) return stableText(actual).includes(stableText(expected[0] || ""));
  return stableText(actual).includes(stableText(expected));
}

function assertExactStringArray(actual, expected) {
  const actualList = Array.isArray(actual) ? actual.map((item) => String(item || "")) : [];
  const expectedList = Array.isArray(expected) ? expected.map((item) => String(item || "")) : [];
  return JSON.stringify(actualList) === JSON.stringify(expectedList);
}

async function snapshotCollections(db, names) {
  const snapshots = {};
  for (const name of names) {
    snapshots[name] = await db.collection(name).find({}).toArray();
  }
  return snapshots;
}

async function restoreCollections(db, snapshots) {
  for (const [name, docs] of Object.entries(snapshots)) {
    const collection = db.collection(name);
    await collection.deleteMany({});
    if (docs.length) {
      await collection.insertMany(docs);
    }
  }
}

function propertyFieldCases(property, amenityIds, marker, index) {
  const description = property.description || {};
  const details = property.details || {};
  const location = property.location || {};
  const currentFloorPlans = Array.isArray(description.floorPlans) ? description.floorPlans : [];
  const floorPlans = currentFloorPlans.length
    ? currentFloorPlans.map((plan, planIndex) =>
        planIndex === 0
          ? {
              ...cloneJson(plan),
              unitType: withMarker(plan.unitType || "Floor Plan", marker),
              price: String(nextPrice(description.price, index)),
            }
          : cloneJson(plan)
      )
    : [
        {
          unitType: `Bulk QA Floor Plan ${marker}`,
          carpetArea: "900",
          builtUpArea: "1000",
          superBuiltUpArea: Number(details.sizeInSqFt || 1000),
          price: String(nextPrice(description.price, index)),
          image: "",
        },
      ];
  const nextAmenityIds = Array.from(
    new Set([...amenityIds, ...(Array.isArray(property.amenities) ? property.amenities.map(id).filter(Boolean) : [])].filter(Boolean))
  ).slice(0, 8);
  const currentGalleryImages = Array.isArray(property.media?.images)
    ? property.media.images.map((item) => String(item || "")).filter(Boolean)
    : [];
  const nextGalleryImages = currentGalleryImages.length ? currentGalleryImages.slice(1) : [];
  const nextReraApproved = description.reraApproved === "Yes" ? "No" : "Yes";

  return [
    {
      label: "title",
      payload: { description: { title: withMarker(description.title || "Untitled Property", marker) } },
      apiPath: "description.title",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "description",
      payload: { description: { description: withMarker(description.description || "Property description", marker) } },
      apiPath: "description.description",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "price",
      payload: { description: { price: nextPrice(description.price, index) } },
      apiPath: "description.price",
      expected: nextPrice(description.price, index),
      htmlExpected: formatPriceInLakhsCrores(nextPrice(description.price, index)),
    },
    {
      label: "payment plan",
      payload: { description: { paymentPlan: withMarker(description.paymentPlan || "Construction linked", marker) } },
      apiPath: "description.paymentPlan",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "meta title",
      payload: { description: { metaTitle: withMarker(description.metaTitle || description.title || "Property", marker) } },
      apiPath: "description.metaTitle",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "meta description",
      payload: { description: { metaDescription: withMarker(description.metaDescription || description.title || "Property", marker) } },
      apiPath: "description.metaDescription",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "rera approved",
      payload: { description: { reraApproved: nextReraApproved, reraNumber: description.reraNumber || `RERA-${marker}` } },
      apiPath: "description.reraApproved",
      expected: nextReraApproved,
    },
    {
      label: "rera number",
      payload: { description: { reraApproved: "Yes", reraNumber: `RERA-${marker}` } },
      apiPath: "description.reraNumber",
      expected: marker,
    },
    {
      label: "configurations",
      payload: { details: { ...cloneJson(details), bhk: withMarker(details.bhk || "3 BHK", marker) } },
      apiPath: "details.bhk",
      expected: marker,
    },
    {
      label: "size",
      payload: { details: { ...cloneJson(details), sizeInSqFt: 111000 + index } },
      apiPath: "details.sizeInSqFt",
      expected: 111000 + index,
      htmlExpected: String(111000 + index),
    },
    {
      label: "possession",
      payload: { details: { ...cloneJson(details), possessionDate: withMarker(details.possessionDate || "2030", marker) } },
      apiPath: "details.possessionDate",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "facing",
      payload: { details: { ...cloneJson(details), facing: details.facing === "east" ? "west" : "east" } },
      apiPath: "details.facing",
      expected: details.facing === "east" ? "west" : "east",
      htmlExpected: details.facing === "east" ? "west" : "east",
    },
    {
      label: "ownership",
      payload: { details: { ...cloneJson(details), ownershipType: details.ownershipType === "Leasehold" ? "Freehold" : "Leasehold" } },
      apiPath: "details.ownershipType",
      expected: details.ownershipType === "Leasehold" ? "Freehold" : "Leasehold",
      htmlExpected: details.ownershipType === "Leasehold" ? "Freehold" : "Leasehold",
    },
    {
      label: "parking",
      payload: { details: { ...cloneJson(details), parking: details.parking === "Open" ? "Reserved" : "Open" } },
      apiPath: "details.parking",
      expected: details.parking === "Open" ? "Reserved" : "Open",
      htmlExpected: details.parking === "Open" ? "Reserved" : "Open",
    },
    {
      label: "property status",
      payload: {
        details: {
          ...cloneJson(details),
          propertyStatus: details.propertyStatus === "Ready to Move" ? "Under Construction" : "Ready to Move",
        },
      },
      apiPath: "details.propertyStatus",
      expected: details.propertyStatus === "Ready to Move" ? "Under Construction" : "Ready to Move",
      htmlExpected: details.propertyStatus === "Ready to Move" ? "Under Construction" : "Ready to Move",
    },
    {
      label: "address",
      payload: { location: { ...cloneJson(location), address: withMarker(location.address || "QA Address", marker) } },
      apiPath: "location.address",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "zip",
      payload: { location: { ...cloneJson(location), zip: String(990000 + index) } },
      apiPath: "location.zip",
      expected: String(990000 + index),
      htmlExpected: String(990000 + index),
    },
    {
      label: "nearby",
      payload: { location: { ...cloneJson(location), nearBy: withMarker(location.nearBy || "QA Nearby", marker) } },
      apiPath: "location.nearBy",
      expected: marker,
      htmlExpected: marker,
    },
    {
      label: "amenities",
      payload: { amenities: nextAmenityIds },
      apiPath: "amenities",
      expected: nextAmenityIds,
    },
    {
      label: "gallery images",
      payload: { media: { images: nextGalleryImages } },
      apiPath: "media.images",
      expected: nextGalleryImages,
      exactArray: true,
      skipPublicApi: true,
    },
    {
      label: "floor plans",
      payload: { description: { floorPlans } },
      apiPath: "description.floorPlans",
      expected: marker,
      htmlExpected: marker,
    },
  ];
}

async function verifyProperties({ apiBase, frontendBase, headers, db, markerRoot, stats, failures }) {
  const properties = await db.collection("properties").find({ status: "verified" }).sort({ createdAt: -1 }).toArray();
  const amenityDocs = await db.collection("amenities").find({}).limit(8).toArray();
  const amenityIds = amenityDocs.slice(0, 2).map((item) => id(item._id)).filter(Boolean);
  if (!amenityIds.length) {
    failures.push({ area: "property", message: "No amenities available for bulk amenity testing" });
    return;
  }

  stats.properties = properties.length;
  for (const [index, property] of properties.entries()) {
    const propertyId = id(property._id);
    const slug = property.description?.slug;
    const marker = `${markerRoot}-PROP-${index + 1}`;
    const cases = propertyFieldCases(property, amenityIds, marker, index);
    if (!slug) {
      failures.push({ area: "property", propertyId, field: "slug", message: "Missing slug; frontend reflection skipped" });
    }

    for (const testCase of cases) {
      try {
        const update = await request(`${apiBase}/admin/api/property/${propertyId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(testCase.payload),
        });
        if (!update.ok) {
          failures.push({ area: "property", propertyId, title: property.description?.title, field: testCase.label, status: update.status, body: update.data || update.text });
          continue;
        }

        const adminValue = getPath(update.data?.data, testCase.apiPath);
        const adminReflects = testCase.exactArray
          ? assertExactStringArray(adminValue, testCase.expected)
          : assertReflects(adminValue, testCase.expected);
        if (!adminReflects) {
          failures.push({ area: "property", propertyId, title: property.description?.title, field: testCase.label, message: "Admin API did not reflect expected value", actual: adminValue, expected: testCase.expected });
        }

        if (slug && !testCase.skipPublicApi) {
          const publicApi = await request(`${apiBase}/frontend/api/properties/${encodeURIComponent(slug)}`);
          if (!publicApi.ok) {
            failures.push({ area: "property", propertyId, title: property.description?.title, field: testCase.label, status: publicApi.status, message: "Public property API failed after update" });
          } else {
            const publicValue = getPath(publicApi.data?.data, testCase.apiPath);
            const publicReflects = testCase.exactArray
              ? assertExactStringArray(publicValue, testCase.expected)
              : assertReflects(publicValue, testCase.expected);
            if (!publicReflects) {
              failures.push({ area: "property", propertyId, title: property.description?.title, field: testCase.label, message: "Public property API did not reflect expected value", actual: publicValue, expected: testCase.expected });
            }
          }

          if (testCase.htmlExpected) {
            const page = await request(`${frontendBase}/property/${encodeURIComponent(slug)}`);
            stats.pageLoads += 1;
            if (!page.ok) {
              failures.push({ area: "property-page", propertyId, title: property.description?.title, field: testCase.label, status: page.status, message: "Property page failed after update" });
            } else if (!page.text.includes(testCase.htmlExpected)) {
              failures.push({ area: "property-page", propertyId, title: property.description?.title, field: testCase.label, message: "Property page did not include expected update", expected: testCase.htmlExpected });
            }
          }
        }

        stats.propertyFields += 1;
      } catch (error) {
        failures.push({ area: "property", propertyId, title: property.description?.title, field: testCase.label, message: error.message });
      }
    }

    if ((index + 1) % 10 === 0 || index + 1 === properties.length) {
      console.log(`Property bulk verification: ${index + 1}/${properties.length}`);
    }
  }
}

async function verifySiteContent({ apiBase, frontendBase, headers, markerRoot, stats, failures }) {
  for (const pageInfo of SITE_PAGES) {
    try {
      const current = await request(`${apiBase}/admin/api/site-content/${pageInfo.key}`, { headers });
      if (!current.ok) {
        failures.push({ area: "site", pageKey: pageInfo.key, status: current.status, message: "Admin site-content fetch failed" });
        continue;
      }
      stats.sitePages += 1;
      const data = current.data?.data || {};
      const candidatePaths = flattenStringPaths({
        title: data.title,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        sections: data.sections || {},
      });

      for (const [fieldIndex, [fieldPath]] of candidatePaths.entries()) {
        const marker = `${markerRoot}-SITE-${pageInfo.key}-${fieldIndex + 1}`;
        const payload = {
          title: data.title,
          route: data.route,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          status: data.status || "active",
          sections: cloneJson(data.sections || {}),
        };
        setPath(payload, fieldPath, withMarker(getPath(payload, fieldPath), marker));

        const update = await request(`${apiBase}/admin/api/site-content/${pageInfo.key}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
        if (!update.ok) {
          failures.push({ area: "site", pageKey: pageInfo.key, field: fieldPath, status: update.status, body: update.data || update.text });
          continue;
        }

        const frontendApi = await request(`${apiBase}/frontend/api/site-content/${pageInfo.key}`);
        if (!frontendApi.ok || !frontendApi.text.includes(marker)) {
          failures.push({ area: "site", pageKey: pageInfo.key, field: fieldPath, status: frontendApi.status, message: "Frontend site-content API did not reflect marker" });
        }

        stats.siteFields += 1;
      }

      const page = await request(`${frontendBase}${pageInfo.route}`);
      stats.pageLoads += 1;
      if (!page.ok) {
        failures.push({ area: "site-page", pageKey: pageInfo.key, route: pageInfo.route, status: page.status, message: "Site page failed after content updates" });
      }

      console.log(`Site content verification: ${pageInfo.key} (${candidatePaths.length} fields)`);
    } catch (error) {
      failures.push({ area: "site", pageKey: pageInfo.key, message: error.message });
    }
  }
}

async function verifyBlogs({ apiBase, frontendBase, headers, db, markerRoot, stats, failures }) {
  const blogs = await db.collection("blogs").find({ status: "active" }).sort({ date: -1 }).toArray();
  stats.blogs = blogs.length;
  for (const [index, blog] of blogs.entries()) {
    const blogId = id(blog._id);
    const marker = `${markerRoot}-BLOG-${index + 1}`;
    const categoryId = id(blog.blogCategory);
    const basePayload = {
      title: blog.title || "Untitled blog",
      blogCategory: categoryId,
      slug: blog.slug,
      source: blog.source || "",
      date: blog.date,
      description: blog.description || "<p>Blog description</p>",
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      metaTitle: blog.metaTitle || blog.title || "Blog",
      metaDescription: blog.metaDescription || blog.title || "Blog",
      status: blog.status || "active",
    };
    const cases = [
      { label: "title", payload: { ...basePayload, title: withMarker(basePayload.title, marker) }, apiPath: "title", expected: marker, htmlExpected: marker },
      { label: "description", payload: { ...basePayload, description: withMarker(basePayload.description, marker) }, apiPath: "description", expected: marker, htmlExpected: marker },
      { label: "tags", payload: { ...basePayload, tags: [marker, ...basePayload.tags] }, apiPath: "tags", expected: marker },
      { label: "meta title", payload: { ...basePayload, metaTitle: withMarker(basePayload.metaTitle, marker) }, apiPath: "metaTitle", expected: marker, htmlExpected: marker },
      { label: "meta description", payload: { ...basePayload, metaDescription: withMarker(basePayload.metaDescription, marker) }, apiPath: "metaDescription", expected: marker, htmlExpected: marker },
    ];

    for (const testCase of cases) {
      try {
        const update = await request(`${apiBase}/admin/api/blog/${blogId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(testCase.payload),
        });
        if (!update.ok) {
          failures.push({ area: "blog", blogId, title: blog.title, field: testCase.label, status: update.status, body: update.data || update.text });
          continue;
        }
        const adminValue = getPath(update.data?.data, testCase.apiPath);
        if (!assertReflects(adminValue, testCase.expected)) {
          failures.push({ area: "blog", blogId, title: blog.title, field: testCase.label, message: "Admin API did not reflect expected value", actual: adminValue, expected: testCase.expected });
        }

        const detail = await request(`${frontendBase}/blog/${encodeURIComponent(blog.slug)}`);
        stats.pageLoads += 1;
        if (!detail.ok) {
          failures.push({ area: "blog-page", blogId, title: blog.title, field: testCase.label, status: detail.status, message: "Blog detail page failed after update" });
        } else if (testCase.htmlExpected && !detail.text.includes(testCase.htmlExpected)) {
          failures.push({ area: "blog-page", blogId, title: blog.title, field: testCase.label, message: "Blog detail page did not include expected update", expected: testCase.htmlExpected });
        }

        stats.blogFields += 1;
      } catch (error) {
        failures.push({ area: "blog", blogId, title: blog.title, field: testCase.label, message: error.message });
      }
    }
    console.log(`Blog verification: ${index + 1}/${blogs.length}`);
  }
}

async function assertNoMarkers(db, markerRoot) {
  const collections = ["properties", "sitecontents", "blogs"];
  for (const name of collections) {
    const docs = await db.collection(name).find({}).toArray();
    if (JSON.stringify(docs).includes(markerRoot)) {
      throw new Error(`Restore failed: ${name} still contains ${markerRoot}`);
    }
  }
}

async function main() {
  const runtime = await readRuntime();
  const apiBase = `http://localhost:${runtime.port}`;
  const frontendBase = "http://localhost:3000";
  const markerRoot = `BULKAI-${Date.now()}`;
  const headers = {
    Authorization: `Bearer ${runtime.adminToken}`,
    "Content-Type": "application/json",
  };
  const stats = createStats();
  const failures = [];
  const client = new MongoClient(runtime.mongoUri);

  await client.connect();
  const db = client.db();
  const snapshots = await snapshotCollections(db, ["properties", "sitecontents", "blogs"]);
  console.log(`Snapshot saved in memory. Marker: ${markerRoot}`);

  try {
    const health = await request(`${apiBase}/health`);
    if (!health.ok) {
      throw new Error(`Backend health failed with ${health.status}`);
    }
    const adminPage = await request(`${frontendBase}/cmsadminlogin/ai-suggestion-staging?fresh=bulk-all`);
    if (!adminPage.ok) {
      throw new Error(`Admin staging page failed with ${adminPage.status}`);
    }

    await verifyProperties({ apiBase, frontendBase, headers, db, markerRoot, stats, failures });
    await verifySiteContent({ apiBase, frontendBase, headers, markerRoot, stats, failures });
    await verifyBlogs({ apiBase, frontendBase, headers, db, markerRoot, stats, failures });
  } finally {
    await restoreCollections(db, snapshots);
    await assertNoMarkers(db, markerRoot);
    await client.close();
    console.log("Bulk verification restore complete.");
  }

  console.log("AI staging bulk all-field verification summary");
  console.log(JSON.stringify(stats, null, 2));

  if (failures.length) {
    console.error("Failures:");
    console.error(JSON.stringify(failures.slice(0, 80), null, 2));
    throw new Error(`${failures.length} bulk verification failure(s) detected`);
  }

  console.log("All bulk property, site page and blog field checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

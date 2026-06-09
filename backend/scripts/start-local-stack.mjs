import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { deserialize } from "bson";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);
const backendDir = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(backendDir, "../..");
const defaultBackupDir = path.resolve(workspaceRoot, "tmp-bigcat-backup/bigCat");
const defaultSupplementalDir = path.resolve(
  workspaceRoot,
  "tmp-bigcat-backup/bigCat-sale-only-merge/bigCat"
);
const defaultImageUpdateOpsFile = path.resolve(
  workspaceRoot,
  "tmp-bigcat-backup/bigCat-leasing-merge/image_updates/existing_property_image_update_ops.json"
);
const defaultMapUpdateOpsFile = path.resolve(
  workspaceRoot,
  "tmp-bigcat-backup/bigCat-leasing-merge/image_updates/existing_property_map_update_ops.json"
);
const backupDir = path.resolve(
  workspaceRoot,
  process.env.LOCAL_STACK_BACKUP_DIR || defaultBackupDir
);
const runtimeFile = path.resolve(backendDir, ".local-stack-runtime.json");

const JWT_SECRET = process.env.JWT_SECRET || "local-bigcat-dev-secret";
const PORT = process.env.PORT || "5001";
const ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL || "aditi@akoode.in";

async function listBsonFiles(dir) {
  const files = await fs.readdir(dir);
  return files.filter((file) => file.endsWith(".bson")).sort();
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function readBsonDocuments(filePath) {
  const buffer = await fs.readFile(filePath);
  const docs = [];
  let offset = 0;

  while (offset < buffer.length) {
    const size = buffer.readInt32LE(offset);
    docs.push(deserialize(buffer.subarray(offset, offset + size)));
    offset += size;
  }

  return docs;
}

async function importBackup(client, dir) {
  const db = client.db("bigCat");
  const bsonFiles = await listBsonFiles(dir);
  const summary = [];

  for (const file of bsonFiles) {
    const collectionName = file.replace(/\.bson$/, "");
    const docs = await readBsonDocuments(path.join(dir, file));
    const collection = db.collection(collectionName);

    let insertedCount = 0;
    let duplicateCount = 0;

    if (docs.length) {
      try {
        const result = await collection.insertMany(docs, { ordered: false });
        insertedCount = result.insertedCount || 0;
      } catch (error) {
        if (error?.code === 11000 || error?.name === "MongoBulkWriteError") {
          insertedCount = error?.result?.result?.nInserted || error?.insertedCount || 0;
          duplicateCount = Math.max(docs.length - insertedCount, 0);
        } else {
          throw error;
        }
      }
    }

    summary.push({
      collectionName,
      count: docs.length,
      insertedCount,
      duplicateCount,
    });
  }

  return summary;
}

function reviveMongoJson(value) {
  if (Array.isArray(value)) return value.map(reviveMongoJson);
  if (!value || typeof value !== "object") return value;
  if (typeof value.$oid === "string") return new ObjectId(value.$oid);

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, reviveMongoJson(entry)])
  );
}

async function applyImageUpdateOps(client, opsPath) {
  const raw = await fs.readFile(opsPath, "utf8");
  const parsed = JSON.parse(raw);
  const operations = Array.isArray(parsed) ? parsed.map(reviveMongoJson) : [];

  if (!operations.length) {
    return { operations: 0, modifiedCount: 0, matchedCount: 0 };
  }

  const result = await client.db("bigCat").collection("properties").bulkWrite(operations, {
    ordered: false,
  });

  return {
    operations: operations.length,
    modifiedCount: result.modifiedCount || 0,
    matchedCount: result.matchedCount || 0,
  };
}

async function applyPropertyUpdateOps(client, opsPath) {
  const raw = await fs.readFile(opsPath, "utf8");
  const parsed = JSON.parse(raw);
  const operations = Array.isArray(parsed) ? parsed.map(reviveMongoJson) : [];

  if (!operations.length) {
    return { operations: 0, modifiedCount: 0, matchedCount: 0 };
  }

  const result = await client.db("bigCat").collection("properties").bulkWrite(operations, {
    ordered: false,
  });

  return {
    operations: operations.length,
    modifiedCount: result.modifiedCount || 0,
    matchedCount: result.matchedCount || 0,
  };
}

async function hideVillaInventory(client) {
  const db = client.db("bigCat");
  const villaPattern = /\b(?:villa|villas)\b/i;
  const propertyTypes = await db.collection("propertytypes").find({}).toArray();
  const villaTypeIds = propertyTypes
    .filter((item) => villaPattern.test(String(item.name || "")))
    .map((item) => item._id);

  const query = {
    status: "verified",
    $or: [
      ...(villaTypeIds.length ? [{ "description.propertyType": { $in: villaTypeIds } }] : []),
      { "description.title": villaPattern },
      { "description.slug": villaPattern },
      { "description.description": villaPattern },
      { "description.inferredPropertyType": villaPattern },
    ],
  };

  const result = await db.collection("properties").updateMany(query, {
    $set: {
      status: "pending",
      "internalReview.hiddenFromPublicReason": "Removed from public listings: villa inventory excluded by local QA policy.",
      "internalReview.hiddenFromPublicAt": new Date(),
    },
  });

  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  };
}

async function createAdminToken(client, email) {
  const admin = await client
    .db("bigCat")
    .collection("users")
    .findOne({ email, role: "admin" });

  if (!admin) {
    throw new Error(`Admin user not found for ${email}`);
  }

  return {
    email,
    id: String(admin._id),
    token: jwt.sign({ id: String(admin._id) }, JWT_SECRET, {
      expiresIn: "1d",
    }),
  };
}

async function main() {
  const supplementalDir =
    process.env.LOCAL_STACK_SUPPLEMENTAL_DIR
      ? path.resolve(workspaceRoot, process.env.LOCAL_STACK_SUPPLEMENTAL_DIR)
      : (await pathExists(defaultSupplementalDir))
        ? defaultSupplementalDir
        : null;
  const imageUpdateOpsFile =
    process.env.LOCAL_STACK_IMAGE_UPDATE_OPS
      ? path.resolve(workspaceRoot, process.env.LOCAL_STACK_IMAGE_UPDATE_OPS)
      : (await pathExists(defaultImageUpdateOpsFile))
        ? defaultImageUpdateOpsFile
        : null;
  const mapUpdateOpsFile =
    process.env.LOCAL_STACK_MAP_UPDATE_OPS
      ? path.resolve(workspaceRoot, process.env.LOCAL_STACK_MAP_UPDATE_OPS)
      : (await pathExists(defaultMapUpdateOpsFile))
        ? defaultMapUpdateOpsFile
        : null;

  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: "bigCat" },
  });
  const mongoUri = mongoServer.getUri("bigCat");
  const client = new MongoClient(mongoUri);
  await client.connect();

  const baseSummary = await importBackup(client, backupDir);
  const supplementalSummary = supplementalDir ? await importBackup(client, supplementalDir) : [];
  const imageUpdateSummary = imageUpdateOpsFile
    ? await applyImageUpdateOps(client, imageUpdateOpsFile)
    : null;
  const mapUpdateSummary = mapUpdateOpsFile
    ? await applyPropertyUpdateOps(client, mapUpdateOpsFile)
    : null;
  const villaHideSummary =
    process.env.LOCAL_STACK_KEEP_VILLAS === "1"
      ? { matchedCount: 0, modifiedCount: 0, skipped: true }
      : await hideVillaInventory(client);
  const admin = await createAdminToken(client, ADMIN_EMAIL);
  const runtime = {
    startedAt: new Date().toISOString(),
    mongoUri,
    port: Number(PORT),
    adminEmail: admin.email,
    adminId: admin.id,
    adminToken: admin.token,
    backupDir,
    supplementalDir,
    imageUpdateOpsFile,
    mapUpdateOpsFile,
    collections: {
      base: baseSummary,
      supplemental: supplementalSummary,
      imageUpdates: imageUpdateSummary,
      mapUpdates: mapUpdateSummary,
      villaPublicListingRemoval: villaHideSummary,
    },
  };

  await fs.writeFile(runtimeFile, `${JSON.stringify(runtime, null, 2)}\n`);
  const displayFillResult = await execFileAsync("node", ["scripts/fill-display-type-address-fields.mjs"], {
    cwd: backendDir,
  });
  const professionalCleanupResult = await execFileAsync("node", ["scripts/clean-professional-listing-fields.mjs"], {
    cwd: backendDir,
  });

  console.log(`Local Mongo started at ${mongoUri}`);
  console.log(
    `Imported base collections: ${baseSummary
      .map((entry) => `${entry.collectionName}:${entry.count}`)
      .join(", ")}`
  );
  if (supplementalSummary.length) {
    console.log(
      `Imported supplemental collections: ${supplementalSummary
        .map((entry) => `${entry.collectionName}:${entry.insertedCount}/${entry.count}`)
        .join(", ")}`
    );
  }
  if (imageUpdateSummary) {
    console.log(
      `Applied image update ops: ${imageUpdateSummary.modifiedCount}/${imageUpdateSummary.operations} modified`
    );
  }
  if (mapUpdateSummary) {
    console.log(
      `Applied map update ops: ${mapUpdateSummary.modifiedCount}/${mapUpdateSummary.operations} modified`
    );
  }
  if (villaHideSummary?.skipped) {
    console.log("Villa public listing removal skipped via LOCAL_STACK_KEEP_VILLAS=1");
  } else {
    console.log(
      `Removed villa inventory from public listings: ${villaHideSummary.modifiedCount}/${villaHideSummary.matchedCount} modified`
    );
  }
  console.log(`Filled display fields: ${displayFillResult.stdout.trim()}`);
  console.log(`Cleaned professional listing fields: ${professionalCleanupResult.stdout.trim()}`);
  console.log(`Local admin email: ${admin.email}`);
  console.log(`Local admin token: ${admin.token}`);
  console.log(`Runtime file: ${runtimeFile}`);

  const child = spawn("node", ["index.js"], {
    cwd: backendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT,
      API_BASE_URL: process.env.API_BASE_URL || `http://localhost:${PORT}`,
      JWT_SECRET,
      MONGO_URI: mongoUri,
      CORS_ALLOWED_ORIGINS: "http://localhost:3000",
    },
  });

  const shutdown = async (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
    await client.close().catch(() => {});
    await mongoServer.stop().catch(() => {});
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  child.on("exit", async (code) => {
    await client.close().catch(() => {});
    await mongoServer.stop().catch(() => {});
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

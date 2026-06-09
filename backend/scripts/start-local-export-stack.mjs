import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { EJSON } from "bson";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(backendDir, "..");
const defaultExportDir = path.resolve(
  repoDir,
  "database-exports/jameenwallah-horizontal-building-images-max-filled-export-2026-05-22T17-48-47"
);
const exportDir = path.resolve(process.env.LOCAL_STACK_EXPORT_DIR || defaultExportDir);
const collectionsDir = path.join(exportDir, "collections");
const runtimeFile = path.resolve(backendDir, ".local-export-stack-runtime.json");

const JWT_SECRET = process.env.JWT_SECRET || "local-jameenwallah-export-secret";
const PORT = process.env.PORT || "5001";
const ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL || "aditi@akoode.in";

async function listJsonCollections(dir) {
  const files = await fs.readdir(dir);
  return files.filter((file) => file.endsWith(".json")).sort();
}

async function importExport(client, dir) {
  const db = client.db("bigCat");
  const files = await listJsonCollections(dir);
  const summary = [];

  for (const file of files) {
    const collectionName = file.replace(/\.json$/, "");
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const docs = EJSON.parse(raw, { relaxed: false });
    const docsArray = Array.isArray(docs) ? docs : [];
    if (docsArray.length) {
      await db.collection(collectionName).insertMany(docsArray, { ordered: false });
    }
    summary.push({ collectionName, count: docsArray.length });
  }

  return summary;
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
    token: jwt.sign({ id: String(admin._id) }, JWT_SECRET, { expiresIn: "1d" }),
  };
}

async function main() {
  await fs.access(collectionsDir);

  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: "bigCat" },
  });
  const mongoUri = mongoServer.getUri("bigCat");
  const client = new MongoClient(mongoUri);
  await client.connect();

  const importSummary = await importExport(client, collectionsDir);
  const admin = await createAdminToken(client, ADMIN_EMAIL);
  const runtime = {
    startedAt: new Date().toISOString(),
    mongoUri,
    dbName: "bigCat",
    port: Number(PORT),
    adminEmail: admin.email,
    adminId: admin.id,
    adminToken: admin.token,
    exportDir,
    collections: importSummary,
  };

  await fs.writeFile(runtimeFile, `${JSON.stringify(runtime, null, 2)}\n`);

  console.log(`Local export Mongo started at ${mongoUri}`);
  console.log(`Imported export: ${exportDir}`);
  console.log(
    `Collections: ${importSummary
      .map((entry) => `${entry.collectionName}:${entry.count}`)
      .join(", ")}`
  );
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
      CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001",
    },
  });

  const shutdown = async (signal) => {
    if (!child.killed) child.kill(signal);
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

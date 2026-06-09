import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const backendNodeModules = path.resolve(__dirname, "../backend/node_modules");
const { MongoClient } = require(path.join(backendNodeModules, "mongodb"));
const { EJSON } = require(path.join(backendNodeModules, "bson"));

const dumpDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "db-export-current");

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Set MONGO_URI or MONGODB_URI before running this restore.");
  process.exit(1);
}

const manifestPath = path.join(dumpDir, "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db();

for (const collection of manifest.collections) {
  const filePath = path.join(dumpDir, collection.file);
  const docs = EJSON.parse(await fs.readFile(filePath, "utf8"), {
    relaxed: false,
  });
  const target = db.collection(collection.name);

  await target.deleteMany({});
  if (docs.length > 0) {
    await target.insertMany(docs, { ordered: false });
  }

  console.log(
    `Restored ${collection.name}: ${docs.length} document${
      docs.length === 1 ? "" : "s"
    }`
  );
}

await client.close();
console.log(`Restore complete for database: ${manifest.database}`);

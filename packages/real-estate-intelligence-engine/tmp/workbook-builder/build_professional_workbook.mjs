import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = "/Users/saurabhkumarbajpaiai/Documents/Codex/2026-05-06/jameenwallah-pr-real/packages/real-estate-intelligence-engine";
const base = path.join(root, "data/professional-openable-builder-db");
const outputPath = path.join(base, "JameenWallah_Builder_DB.xlsx");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function colName(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function rangeFor(rows, cols) {
  return `A1:${colName(cols - 1)}${rows}`;
}

async function csvRows(name) {
  const text = await fs.readFile(path.join(base, name), "utf8");
  return parseCsv(text);
}

function trimForWorkbook(rows, maxCellLength = 32700) {
  return rows.map((row) =>
    row.map((value) => {
      if (typeof value !== "string") return value;
      const normalized = value.replace(/\u0000/g, "").trim();
      if (normalized.length <= maxCellLength) return normalized;
      return `${normalized.slice(0, maxCellLength - 24)} [truncated for Excel]`;
    }),
  );
}

function writeSheet(sheet, rows, options = {}) {
  const data = trimForWorkbook(rows, options.maxCellLength);
  if (!data.length) return;
  const width = Math.max(...data.map((row) => row.length));
  const normalized = data.map((row) => {
    const copy = [...row];
    while (copy.length < width) copy.push("");
    return copy;
  });
  const range = sheet.getRange(rangeFor(normalized.length, width));
  range.values = normalized;
  range.format.font = { name: "Aptos", size: 10, color: "#111827" };
  range.format.verticalAlignment = "top";
  range.format.wrapText = true;
  range.format.borders = { preset: "inside", style: "thin", color: "#E5E7EB" };
  const header = sheet.getRange(`A1:${colName(width - 1)}1`);
  header.format = {
    fill: "#111827",
    font: { name: "Aptos", size: 10, color: "#FFFFFF", bold: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.freezePanes.freezeRows(1);
  for (let c = 0; c < width; c += 1) {
    const headerText = String(normalized[0][c] || "");
    let px = 120;
    if (/(description|amenities|image|url|address|notes|reason|schema|metadata)/i.test(headerText)) px = 260;
    if (/(project_name|builder_name|locality|city|sector)/i.test(headerText)) px = 170;
    sheet.getRange(`${colName(c)}1:${colName(c)}${normalized.length}`).format.columnWidthPx = px;
  }
}

function addSummary(workbook, summary) {
  const sheet = workbook.worksheets.getOrAdd("README", { renameFirstIfOnlyNewSpreadsheet: true });
  const rows = [
    ["JameenWallah Builder Database", ""],
    ["Generated", new Date().toISOString()],
    ["Best import sheet", "Properties Curated"],
    ["Image relationship sheet", "Image Slots"],
    ["Production caution", "Rows in Review Needed should be checked before direct production import."],
    ["", ""],
    ["Metric", "Value"],
    ["Valid property rows", summary.rows_valid_properties],
    ["Curated rows", summary.rows_curated],
    ["Image slot rows", summary.rows_image_slots],
    ["Excluded non-property rows", summary.rows_excluded],
    ["Rows needing review", summary.rows_review_needed],
    ["Sanitized corrupted row IDs", (summary.sanitized_corrupted_row_ids || []).join(", ")],
    ["", ""],
    ["Local files", ""],
    ["CSV import file", "properties_curated.csv"],
    ["All image slots", "image_slots_openable.csv"],
    ["SQLite database", "professional_builder_db.sqlite"],
    ["Schema", "schema.json / SCHEMA.md"],
  ];
  writeSheet(sheet, rows);
  sheet.getRange("A1:B1").format = {
    fill: "#0F766E",
    font: { name: "Aptos", size: 14, color: "#FFFFFF", bold: true },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange("A1:B20").format.columnWidthPx = 260;
}

function addSchema(workbook, schema) {
  const sheet = workbook.worksheets.add("Schema");
  const rows = [["table", "field", "type", "description"]];
  for (const [tableName, table] of Object.entries(schema.tables || {})) {
    for (const field of table.fields || []) {
      rows.push([tableName, field.name || "", field.type || "", field.description || ""]);
    }
  }
  writeSheet(sheet, rows);
}

const workbook = Workbook.create();
const summary = JSON.parse(await fs.readFile(path.join(base, "summary.json"), "utf8"));
const schema = JSON.parse(await fs.readFile(path.join(base, "schema.json"), "utf8"));

addSummary(workbook, summary);

const sheets = [
  ["Properties Curated", "properties_curated.csv"],
  ["Image Slots", "image_slots_openable.csv"],
  ["Review Needed", "review_needed.csv"],
  ["Excluded Rows", "excluded_non_property_rows.csv"],
];

for (const [sheetName, fileName] of sheets) {
  const sheet = workbook.worksheets.add(sheetName);
  writeSheet(sheet, await csvRows(fileName), { maxCellLength: 32000 });
}

addSchema(workbook, schema);

const readmePreview = await workbook.inspect({
  kind: "table",
  range: "README!A1:B20",
  include: "values",
  tableMaxRows: 25,
  tableMaxCols: 4,
});
console.log(readmePreview.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
console.log(errorScan.ndjson);

for (const sheetName of ["README", "Properties Curated", "Image Slots", "Review Needed", "Excluded Rows", "Schema"]) {
  try {
    await workbook.render({ sheetName, range: "A1:H12", scale: 1 });
    console.log(`Rendered preview for ${sheetName}`);
  } catch (error) {
    console.log(`Render preview skipped for ${sheetName}: ${error.message}`);
  }
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
process.exit(0);

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const GEMINI_ENDPOINT_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";
const TEXTUAL_CHANGE_TYPES = new Set(["content", "seo", "status", "connectivity", "amenities"]);
const BLOCKED_PATH_PATTERNS = [/price/i, /floorPlans/i, /floorPlanImages/i, /reraNumber/i];

const safeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const promptValue = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
          return String(item);
        }
        return getEntityName(item) || JSON.stringify(item);
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return fallback;
};

const normalizeGeminiModel = (value) => {
  const model = safeText(value, DEFAULT_MODEL);
  return model.startsWith("gemini/") ? model.slice("gemini/".length) : model;
};

const truncate = (value, limit = 1800) => {
  const text = promptValue(value);
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const hasPromptValue = (value) => promptValue(value).length > 0;

const plainObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(promptValue(value));

const getFormatHint = (change) => {
  if (Array.isArray(change.oldValue) || Array.isArray(change.newValue)) {
    return "Return newline-separated text for this list field so the staging editor can review and push it safely.";
  }
  if (looksLikeHtml(change.oldValue) || looksLikeHtml(change.newValue)) {
    return "Preserve semantic HTML formatting. Use paragraphs, headings, lists and tables only when they already fit the content model.";
  }
  if (change.oldValue && typeof change.oldValue === "object") {
    return "Return a compact JSON-compatible string that preserves the meaning of this field.";
  }
  return "Return plain text for this field.";
};

const getFieldInstruction = (change, entityType) => {
  const path = safeText(change.path);
  const lowerPath = path.toLowerCase();

  if (path === "description.description") {
    return [
      "Write a long, premium property listing description of about 550-850 words.",
      "Use polished advisory language with clear paragraphs covering project positioning, location, connectivity, configuration, livability, buyer fit, investment rationale and trust factors.",
      "Stay current by referring to the supplied status, possession, price visibility and live API details, but do not invent market statistics or unverified claims.",
      "Do not sound like a placeholder or monthly note; the result should be production-ready website copy.",
    ].join(" ");
  }

  if (entityType === "editorial" && path === "description") {
    return [
      "If this is a blog/article body, produce a professional long-form article-quality description of about 900-1400 words and preserve the existing HTML format.",
      "Use a clear editorial structure with useful headings, buyer/investor context, practical evaluation points and a strong conclusion.",
      "If the existing field is a short page description rather than a blog article, keep it substantial but not bloated at about 180-350 words.",
    ].join(" ");
  }

  if (lowerPath.includes("metatitle")) {
    return "Keep SEO meta titles tight, search-aligned and normally under 65 characters unless the current brand pattern requires slightly longer text.";
  }

  if (lowerPath.includes("metadescription")) {
    return "Keep SEO meta descriptions clear, compelling and normally within 145-160 characters. Do not make this long-form.";
  }

  if (lowerPath.endsWith(".title") || lowerPath === "title") {
    return "Keep visible titles specific, readable and concise. Do not make titles paragraph-length.";
  }

  if (Array.isArray(change.oldValue) || Array.isArray(change.newValue) || lowerPath.includes("items")) {
    return "Improve list items for clarity and conversion value while preserving the list-style structure and avoiding invented services or amenities.";
  }

  if (lowerPath.includes("amenities")) {
    return "Use only titles from the amenity master list. Do not invent amenities.";
  }

  return "Improve this field professionally while keeping the length appropriate to where it appears on the website.";
};

const getEntityName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.name || value.title || value.label || "";
  return "";
};

const summarizeProperty = (property = {}) => {
  const description = plainObject(property.description);
  const details = plainObject(property.details);
  const location = plainObject(property.location);
  return {
    title: safeText(description.title),
    slug: safeText(description.slug),
    category: getEntityName(description.category),
    propertyType: getEntityName(description.propertyType),
    builder: getEntityName(description.builder) || safeText(description.builder),
    city: getEntityName(location.city),
    area: getEntityName(location.area),
    address: safeText(location.address),
    nearby: safeText(location.nearBy),
    price: description.price || "",
    paymentPlan: safeText(description.paymentPlan),
    status: safeText(details.propertyStatus || property.status),
    possessionDate: safeText(details.possessionDate || details.completionDate),
    bhk: safeText(details.bhk),
    sizeInSqFt: details.sizeInSqFt || "",
    facing: safeText(details.facing),
    ownershipType: safeText(details.ownershipType),
    parking: safeText(details.parking),
    metaTitle: safeText(description.metaTitle),
    metaDescription: safeText(description.metaDescription),
    description: truncate(description.description, 2200),
    amenities: Array.isArray(property.amenities)
      ? property.amenities.map((item) => getEntityName(item)).filter(Boolean)
      : [],
  };
};

const summarizeEditorial = (suggestion = {}) => ({
  title: safeText(suggestion.title),
  subtitle: safeText(suggestion.subtitle),
  route: safeText(suggestion.route),
  entityType: safeText(suggestion.entityType),
  entityKey: safeText(suggestion.entityKey),
  record: suggestion.record || {},
});

const getAllowedChanges = (changes = [], entityType = "property") =>
  changes
    .filter((change) => {
      const path = safeText(change.path);
      if (!path || BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path))) return false;
      return TEXTUAL_CHANGE_TYPES.has(change.type) || !change.type;
    })
    .map((change) => ({
      path: change.path,
      type: change.type,
      label: change.label || change.path,
      currentValue: truncate(change.oldValue, 1400),
      deterministicSuggestion: truncate(change.newValue, 1400),
      reason: truncate(change.reason, 500),
      formatHint: getFormatHint(change),
      fieldInstruction: getFieldInstruction(change, entityType),
    }));

const extractGeminiText = (payload) =>
  payload?.candidates
    ?.flatMap((candidate) => candidate?.content?.parts || [])
    ?.map((part) => part?.text || "")
    ?.join("")
    ?.trim() || "";

const parseJsonFromText = (text) => {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
};

const buildPrompt = ({ entityType, entitySummary, allowedChanges, amenityTitles, currentDate }) => `
You are improving staged CMS suggestions for JameenWallah, a real estate advisory website.

Use ONLY the supplied live CMS/API snapshot. Do not invent facts, prices, RERA numbers, builder names, possession dates, URLs or amenities.
Write polished, professional, buyer-facing copy for Gurgaon/NCR real estate.
Current date for freshness: ${currentDate}.
Keep wording factual, current, professional and conversion-aware.

Important length rules:
- Long listing descriptions must be genuinely substantial and production-ready, not short summaries.
- SEO metadata, labels, titles, CTA text, status fields and list labels must remain concise and fit their UI surface.
- Preserve the field's original format as shown in the staging editor. HTML fields should remain HTML. Array/list fields should use clean newline-separated text.
- Because the response must be strict JSON, escape line breaks and quotation marks inside string values. Do not put raw unescaped newlines inside JSON strings.
- Use live project status, possession, location, configuration, amenities and buyer intent from the snapshot so suggestions feel up to date without unsupported claims.

Entity type: ${entityType}
Live entity snapshot:
${JSON.stringify(entitySummary, null, 2)}

Allowed amenity master titles, when editing amenities:
${JSON.stringify(amenityTitles || [], null, 2)}

Only improve these fields. Return the same path values only when you have a genuinely better suggestion:
${JSON.stringify(allowedChanges, null, 2)}

Return strict JSON only in this shape:
{
  "changes": [
    {
      "path": "same path from allowed list",
      "newValue": "improved value",
      "reason": "short admin-facing reason"
    }
  ]
}
`;

export async function POST(request) {
  const apiKey = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        status: "disabled",
        message: "Gemini key is not configured. Set GEMINI_API_KEY on the frontend server to enable AI enrichment.",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid JSON body." }, { status: 400 });
  }

  const entityType = body?.entityType === "editorial" ? "editorial" : "property";
  const allowedChanges = getAllowedChanges(body?.changes || [], entityType);
  if (!allowedChanges.length) {
    return NextResponse.json({
      status: "skipped",
      message: "No Gemini-editable fields were provided.",
      data: { changes: [] },
    });
  }

  const entitySummary =
    entityType === "editorial"
      ? summarizeEditorial(body?.suggestion || {})
      : summarizeProperty(body?.property || {});
  const model = normalizeGeminiModel(process.env.AI_STAGING_GEMINI_MODEL || process.env.GEMINI_MODEL);
  const endpoint = `${GEMINI_ENDPOINT_ROOT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt({
                  entityType,
                  entitySummary,
                  allowedChanges,
                  amenityTitles: body?.amenityTitles || [],
                  currentDate: new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  }),
                }),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 12000,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              changes: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    path: { type: "STRING" },
                    newValue: { type: "STRING" },
                    reason: { type: "STRING" },
                  },
                  required: ["path", "newValue", "reason"],
                },
              },
            },
            required: ["changes"],
          },
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: payload?.error?.message || "Gemini request failed.",
        },
        { status: response.status }
      );
    }

    const parsed = parseJsonFromText(extractGeminiText(payload));
    const allowedPathSet = new Set(allowedChanges.map((change) => change.path));
    const changes = Array.isArray(parsed?.changes)
      ? parsed.changes
          .filter((change) => allowedPathSet.has(change?.path) && hasPromptValue(change?.newValue))
          .map((change) => ({
            path: change.path,
            newValue: change.newValue,
            reason: safeText(change.reason, "Gemini refined this suggestion from the live CMS/API snapshot."),
          }))
      : [];

    return NextResponse.json({
      status: "success",
      data: {
        model,
        changes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Unable to generate Gemini staging suggestions.",
      },
      { status: 500 }
    );
  }
}

import { getPmsServiceBySlug } from "@/data/pmsServices";
import { resolveImageSrc } from "@/utils/resolveImage";

const slugifyName = (name) =>
  String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Minimal escape for plain text rendered as HTML fragments. */
export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Opening tag with a letter — distinguishes WYSIWYG HTML from plain text. */
const LOOKS_LIKE_HTML = /<\/?[a-z][\s\S]*>/i;

/**
 * Build HTML for the PMS "Detailed Overview" from admin `description`.
 * Rich HTML from the panel is returned as-is; plain text is split on line breaks into escaped <p> tags.
 */
export function buildDetailOverviewHtml(description) {
  const raw = description == null ? "" : String(description).trim();
  if (!raw) return "";

  if (LOOKS_LIKE_HTML.test(raw)) {
    return raw;
  }

  const blocks = raw.split(/\r?\n+/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return "";
  if (blocks.length === 1) {
    return `<p>${escapeHtml(blocks[0])}</p>`;
  }
  return blocks.map((b) => `<p>${escapeHtml(b)}</p>`).join("");
}

/** Pull list items from HTML description (admin WYSIWYG often uses <ul><li>). */
export function extractListItemsFromHtml(html = "") {
  const raw = String(html || "");
  const fromLi = [...raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripHtml(m[1]).trim())
    .filter(Boolean);
  if (fromLi.length) return fromLi;
  return [];
}

function firstPlainParagraph(text) {
  const t = stripHtml(text);
  if (!t) return "";
  const sentence = t.match(/[^.!?]+[.!?]?/);
  return sentence ? sentence[0].trim() : t.slice(0, 220);
}

/**
 * Maps a Propertymanagement API record to the PMS listing card shape.
 * Uses static template (pmsServices) only when slug matches — for icon / backup bullets.
 */
export function mapPropertyManagementToServiceCard(item) {
  if (!item || typeof item !== "object") return null;
  let slugRaw = String(item.slug || "").trim();
  if (!slugRaw && item.name) {
    slugRaw = slugifyName(item.name);
  }
  const template =
    slugRaw &&
    (getPmsServiceBySlug(slugRaw) || getPmsServiceBySlug(slugRaw.toLowerCase()));

  const short =
    (item.shortDescription && String(item.shortDescription).trim()) ||
    template?.short ||
    firstPlainParagraph(item.description || "") ||
    "Explore this property management service.";

  const rawFeatured = item.featuredImage || item.image || "";
  const featuredSrc = resolveImageSrc(
    rawFeatured,
    "/images/background/pms_hero.png"
  );

  return {
    _id: item._id,
    slug: slugRaw || template?.slug || "",
    title: item.name || template?.title || "Service",
    short,
    icon: template?.icon || "fas fa-briefcase",
    featuredSrc,
  };
}

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveCategoryValue = (property) => {
  if (!property || typeof property !== "object") return "";

  const raw =
    property.category?.slug ||
    property.category?.name ||
    property.category ||
    property.description?.category?.slug ||
    property.description?.category?.name ||
    property.description?.category;

  return typeof raw === "string" ? raw : "";
};

export const getPropertySlug = (property) => {
  if (!property) return "";

  const directSlug = property.slug || property.description?.slug;
  if (typeof directSlug === "string" && directSlug.trim()) {
    return directSlug.trim();
  }

  const fallbackId = property._id || property.id;
  if (fallbackId) return String(fallbackId);

  const title = property.title || property.description?.title;
  if (typeof title === "string" && title.trim()) {
    return slugify(title);
  }

  return "";
};

export const getPropertyHref = (property) => {
  const slug = getPropertySlug(property);
  if (!slug) return "/properties";

  const category = slugify(resolveCategoryValue(property));
  if (!category) {
    return `/property/${encodeURIComponent(slug)}`;
  }
  return `/property/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  // return `/property/${encodeURIComponent(slug)}`;
};

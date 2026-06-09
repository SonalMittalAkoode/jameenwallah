/**
 * Path-only URLs for /properties (no ?category= / &area=).
 *
 * Patterns:
 *   /properties
 *   /properties/{categorySlug}
 *   /properties/city/{cityId}
 *   /properties/area/{areaId}
 *   /properties/{category}/{propertyTypeSlug}/{areaSlug}[/q/{search}]
 *   Legacy supported: /properties/{category}/p/{propertyTypeSlug}/a/{areaSlug}[/q/{search}]
 */

const OID = /^[a-f\d]{24}$/i;

const RESERVED = new Set(["city", "area", "p", "a", "q"]);

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function parsePropertiesListingPath(pathname = "") {
  const base = "/properties";
  if (!pathname.startsWith(base)) return {};
  const rest = pathname.slice(base.length).replace(/^\//, "");
  if (!rest) return {};
  const segments = rest.split("/").filter(Boolean);

  if (segments[0] === "city" && segments[1]) {
    return { cityId: segments[1] };
  }
  if (segments[0] === "area" && segments[1]) {
    return { area: segments[1] };
  }
  if (segments[0] === "q" && segments[1] != null) {
    try {
      return { search: decodeURIComponent(segments.slice(1).join("/")) };
    } catch {
      return { search: segments.slice(1).join("/") };
    }
  }

  const out = {};
  let i = 0;
  const first = segments[0];
  if (!first || RESERVED.has(first)) return {};

  out.category = first;
  i = 1;

  // New canonical format:
  // /properties/{category}/{propertyTypeSlug}/{areaSlug}[/q/{search}]
  // Legacy:
  // /properties/{category}/p/{propertyTypeSlug}/a/{areaSlug}[/q/{search}]
  if (segments[i] === "p" || segments[i] === "a") {
    while (i < segments.length) {
      const tok = segments[i];
      if (tok === "p" && segments[i + 1]) {
        out.propertyType = segments[i + 1];
        i += 2;
        continue;
      }
      if (tok === "a" && segments[i + 1]) {
        out.area = segments[i + 1];
        i += 2;
        continue;
      }
      if (tok === "q" && segments[i + 1] != null) {
        try {
          out.search = decodeURIComponent(segments.slice(i + 1).join("/"));
        } catch {
          out.search = segments.slice(i + 1).join("/");
        }
      }
      break;
    }
    return out;
  }

  if (segments[i] && segments[i] !== "q") {
    out.propertyType = segments[i];
    i += 1;
  }
  if (segments[i] && segments[i] !== "q") {
    out.area = segments[i];
    i += 1;
  }
  if (segments[i] === "q" && segments[i + 1] != null) {
    try {
      out.search = decodeURIComponent(segments.slice(i + 1).join("/"));
    } catch {
      out.search = segments.slice(i + 1).join("/");
    }
  }

  return out;
}

export function buildPropertiesListingPath(filters = {}) {
  const {
    category,
    propertyTypeId,
    propertyTypeSlug,
    areaId,
    areaSlug,
    search,
    cityId,
  } = filters;

  if (cityId && !category && !propertyTypeId && !areaId) {
    return `/properties/city/${String(cityId).trim()}`;
  }
  if (areaId && !category && !propertyTypeId && !cityId) {
    return `/properties/area/${String(areaId).trim()}`;
  }

  const q = search && String(search).trim();
  if (!category && !propertyTypeId && !areaId && !cityId && q) {
    return `/properties/q/${encodeURIComponent(q)}`;
  }

  const parts = ["/properties"];
  if (category) parts.push(String(category).trim());

  const safePropertyTypeSlug = slugify(propertyTypeSlug);
  if (safePropertyTypeSlug) {
    parts.push(safePropertyTypeSlug);
  } else if (propertyTypeId) {
    parts.push(String(propertyTypeId).trim());
  }
  const safeAreaSlug = slugify(areaSlug);
  if (safeAreaSlug) {
    parts.push(safeAreaSlug);
  } else if (areaId) {
    parts.push(String(areaId).trim());
  }
  if (q) {
    parts.push("q", encodeURIComponent(q));
  }

  if (parts.length === 1) return "/properties";
  return parts.join("/");
}

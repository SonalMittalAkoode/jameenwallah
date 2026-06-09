"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getAllAmenitiesFrontend } from "@/api/amenity";
import { resolveAmenityIconClass } from "@/utils/amenityIcons";

const normalizeTitle = (s) => String(s || "").trim().toLowerCase();

/** Raw amenities from API: ObjectIds, populated { title }, or legacy strings. */
function extractAmenityItems(property) {
  const raw = property?.amenities;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (typeof item === "object" && item) {
        const title = item.title || item.name;
        if (!title) return null;
        return {
          key: String(item._id || item.id || `amenity-${index}`),
          title: String(title).trim(),
        };
      }
      const title = String(item || "").trim();
      if (!title) return null;
      return { key: `amenity-${index}`, title };
    })
    .filter(Boolean);
}

/**
 * Merge catalog (GET /frontend/api/amenities) by title for stable ordering + future icon fields.
 */
function orderByCatalog(items, catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) return items;
  const order = new Map(
    catalog.map((a, i) => [normalizeTitle(a?.title), i])
  );
  return [...items].sort((a, b) => {
    const ia = order.has(normalizeTitle(a.title))
      ? order.get(normalizeTitle(a.title))
      : 9999;
    const ib = order.has(normalizeTitle(b.title))
      ? order.get(normalizeTitle(b.title))
      : 9999;
    if (ia !== ib) return ia - ib;
    return a.title.localeCompare(b.title);
  });
}

function iconForItem(title, catalog) {
  const match = catalog.find((c) => normalizeTitle(c?.title) === normalizeTitle(title));
  if (match?.iconClass && typeof match.iconClass === "string") {
    return match.iconClass.replace(/^(fas|far|fal|fad)\s+/i, "").trim() || "fa-check-circle";
  }
  if (match?.icon && typeof match.icon === "string") {
    return match.icon.replace(/^(fas|far|fal|fad)\s+/i, "").trim() || "fa-check-circle";
  }
  return resolveAmenityIconClass(title);
}

const PropertyFeaturesAminites = ({ property }) => {
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllAmenitiesFrontend();
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) setCatalog(rows);
      } catch {
        if (!cancelled) setCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () => orderByCatalog(extractAmenityItems(property), catalog),
    [property, catalog]
  );

  if (!items.length) {
    return (
      <div className="property-amenities-empty text-muted">
        Amenities not available
      </div>
    );
  }

  return (
    <div className="property-amenities-grid" role="list">
      {items.map((item) => {
        const icon = iconForItem(item.title, catalog);
        return (
          <div
            className="property-amenity-card"
            key={item.key}
            role="listitem"
          >
            <span className="property-amenity-card__icon" aria-hidden="true">
              <i className={`fas ${icon}`} />
            </span>
            <p className="property-amenity-card__text mb-0">{item.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyFeaturesAminites;

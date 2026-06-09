import Link from "next/link";
import { getTrendingAreasListFrontend } from "@/api/area";
import { getPropertiesWithFilters } from "@/api/property";
import {
  CLEAN_PROPERTY_FALLBACK_IMAGES,
  getCleanPrimaryPropertyImage,
  getCleanPropertyFallbackImage,
  isCleanPublicPropertyImageSource,
  resolveImageSrc,
} from "@/utils/resolveImage";

const FALLBACK_IMAGE = "/images/listings/g1-1.jpg";
const isTrustedAreaCardImage = (image = "") => {
  const value = String(image || "").trim();
  if (!value) return false;
  if (value.startsWith("/api/external-image")) {
    try {
      const parsed = new URL(value, "http://localhost");
      const originalUrl = parsed.searchParams.get("url") || "";
      return isCleanPublicPropertyImageSource(originalUrl);
    } catch {
      return false;
    }
  }
  return isCleanPublicPropertyImageSource(value);
};

const getAreaListingImage = async (area) => {
  const areaId = String(area?._id || "").trim();
  const areaName = String(area?.name || "").trim();
  const queries = [
    areaId ? { area: areaId, limit: 1, page: 1 } : null,
    areaName ? { search: areaName, limit: 1, page: 1 } : null,
  ].filter(Boolean);

  for (const query of queries) {
    try {
      const res = await getPropertiesWithFilters(query);
      const property = Array.isArray(res?.data) ? res.data[0] : null;
      if (!property) continue;
      const image = getCleanPrimaryPropertyImage(property, "");
      if (isTrustedAreaCardImage(image)) return image;
    } catch {
      // Try the next strategy before falling back to the area image.
    }
  }

  return "";
};

const ApartmentTypes = async ({ heroImages = [] } = {}) => {
  let rows = [];
  const cleanHeroImages = Array.isArray(heroImages)
    ? heroImages.filter(isTrustedAreaCardImage)
    : [];

  try {
    const res = await getTrendingAreasListFrontend({ limit: 30, page: 1 });
    const areaRows = Array.isArray(res?.data)
      ? res.data
          .filter((area) => Number(area?.propertyCount || 0) > 0)
          .slice(0, 6)
      : [];
    rows = await Promise.all(
      areaRows.map(async (area) => ({
        ...area,
        listingImage: await getAreaListingImage(area),
      }))
    );
    rows = rows.map((area, index) => ({
      ...area,
      listingImage:
        cleanHeroImages[index % cleanHeroImages.length] ||
        area.listingImage ||
        CLEAN_PROPERTY_FALLBACK_IMAGES[index % CLEAN_PROPERTY_FALLBACK_IMAGES.length] ||
        getCleanPropertyFallbackImage(area?.name),
    }));
  } catch {
    rows = [];
  }

  if (!rows.length) return null;

  return (
    <>
      {rows.map((item, index) => {
        const areaName = item?.name || "Trending Area";
        const imageSrc = resolveImageSrc(
          isTrustedAreaCardImage(item?.listingImage)
            ? item.listingImage
            : "",
          FALLBACK_IMAGE
        );

        const href = item?._id
          // ? `/properties/area/${encodeURIComponent(String(item._id))}`
          ? `/properties/area/${item.slug}`
          : "/properties";

        return (
          <div
            key={`${areaName}-${index}`}
            className="collage-location-item"
          >
            <Link href={href} className="collage-location-card">
              <div className="collage-location-card__media">
                <img
                  className="collage-location-card__image"
                  src={imageSrc}
                  alt={areaName}
                  loading={index < 2 ? "eager" : "lazy"}
                />

                <div className="collage-location-card__overlay" />

                <div className="collage-location-card__content">
                  <h3 className="collage-location-card__title">
                    {areaName}
                  </h3>

                  <div className="collage-location-card__hover-content">
                    <span className="collage-location-card__badge">
                      Trending Area
                    </span>

                    <p className="collage-location-card__description">
                      Discover premium properties in one of Gurgaon&apos;s most
                      searched and high-demand locations.
                    </p>

                    <span className="collage-location-card__cta">
                      Explore Properties
                      <i className="fal fa-arrow-right-long" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </>
  );
};

export default ApartmentTypes;

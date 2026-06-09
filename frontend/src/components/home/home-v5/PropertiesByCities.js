"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getTrendingAreasListFrontend } from "@/api/area";
import { getPropertiesWithFilters } from "@/api/property";
import {
  CLEAN_PROPERTY_FALLBACK_IMAGES,
  getCleanPrimaryPropertyImage,
  isCleanPublicPropertyImageSource,
  resolveImageSrc,
} from "@/utils/resolveImage";

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

const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getAreaListingImage = async (area) => {
  const id = String(area?.id || "").trim();
  const name = String(area?.name || "").trim();
  const queries = [
    id ? { area: id, limit: 1, page: 1 } : null,
    name ? { search: name, limit: 1, page: 1 } : null,
  ].filter(Boolean);

  for (const query of queries) {
    try {
      const res = await getPropertiesWithFilters(query);
      const property = Array.isArray(res?.data) ? res.data[0] : null;
      if (!property) continue;
      const image = getCleanPrimaryPropertyImage(property, "");
      if (isTrustedAreaCardImage(image)) return image;
    } catch {
      // Try the next lookup route, then fall back to the area image.
    }
  }

  return "";
};

const PropertiesByCities = ({ heroImages = [] }) => {
  const [items, setItems] = useState([]);
  const cleanHeroImages = useMemo(
    () => (Array.isArray(heroImages) ? heroImages.filter(isTrustedAreaCardImage) : []),
    [heroImages]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const areasRes = await getTrendingAreasListFrontend({ limit: 40, page: 1 });
        if (cancelled) return;

        const areaRows = Array.isArray(areasRes?.data)
          ? areasRes.data.map((area) => ({
              id: String(area?._id || ""),
              name: area?.name || "",
              slug: toSlug(area?.name || ""),
              image: area?.image || "",
              propertyCount: Number(area?.propertyCount || 0),
              type: "area",
            }))
          : [];

        const visibleRows = areaRows.filter(
          (row) => row.id && row.name && Number(row.propertyCount || 0) > 0
        );
        const rowsWithImages = await Promise.all(
          visibleRows.map(async (row) => ({
            ...row,
            listingImage: await getAreaListingImage(row),
          }))
        );

        if (!cancelled) {
          setItems(
            rowsWithImages
              .map((row, index) => ({
                ...row,
                listingImage:
                  cleanHeroImages[index % cleanHeroImages.length] ||
                  row.listingImage ||
                  CLEAN_PROPERTY_FALLBACK_IMAGES[index % CLEAN_PROPERTY_FALLBACK_IMAGES.length] ||
                  "",
              }))
              .filter((row) => isTrustedAreaCardImage(row.listingImage))
          );
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cleanHeroImages]);

  const fallbackImage = "/images/listings/g1-1.jpg";

  const slides = useMemo(() => [...(items || [])], [items]);

  if (!slides.length) return null;

  return (
    <>
      <Swiper
        className="properties-by-cities-swiper"
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".property_city-next__active",
          prevEl: ".property_city-prev__active",
        }}
        pagination={{
          el: ".property_city_pagination__active",
          clickable: true,
        }}
        slidesPerView={1}
        breakpoints={{
          300: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 4,
          },
          1200: {
            slidesPerView: 5,
          },
        }}
      >
        {slides.map((row, index) => (
          <SwiperSlide key={`${row.type}-${row.id}`}>
            <Link
              href={`/properties/area/${encodeURIComponent(row.id)}`}
              className="item properties-by-cities-slide-item"
            >
              <div className="apartment-style1 apartment-style1--by-cities mb30">
                <div className="apartment-img apartment-img--by-cities">
                  <img
                    className="properties-by-cities-img contain"
                    src={resolveImageSrc(
                      isTrustedAreaCardImage(row.listingImage)
                        ? row.listingImage
                        : "",
                      fallbackImage
                    )}
                    alt={row.name ? `${row.name} properties` : "Location"}
                    loading={index < 5 ? "eager" : "lazy"}
                    onError={(event) => {
                      if (event.currentTarget.src.includes(fallbackImage)) return;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>
                <div className="apartment-content">
                  <div className="top-area">
                    <h6 className="title mb-0">{row.name}</h6>
                    <p className="text mb-0">{row.propertyCount} Properties</p>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="col-auto mb30">
        <div className="row align-items-center justify-content-center">
          <div className="col-auto">
            <button className="property_city-prev__active swiper_button">
              <i className="far fa-arrow-left-long" />
            </button>
          </div>
          {/* End prev */}

          <div className="col-auto">
            <div className="pagination swiper--pagination property_city_pagination__active" />
          </div>
          {/* End pagination */}

          <div className="col-auto">
            <button className="property_city-next__active swiper_button">
              <i className="far fa-arrow-right-long" />
            </button>
          </div>
          {/* End Next */}
        </div>
      </div>
      {/* End .col for navigation and pagination */}
    </>
  );
};

export default PropertiesByCities;

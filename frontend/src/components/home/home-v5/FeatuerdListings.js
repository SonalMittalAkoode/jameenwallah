"use client";

import { getFeaturedProperties } from "@/api/property";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getPropertyHref } from "@/utils/propertyRoute";
import { useCompare } from "@/context/CompareContext";
import { getCleanPrimaryPropertyImage } from "@/utils/resolveImage";
import {
  formatPropertyLocation,
  formatSizeLabel,
  getBathroomLabel,
  getBedroomLabel,
  getSizeSqFt,
} from "@/utils/propertyDisplay";

const formatPrice = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    return "Price on request";
  }

  return `₹${new Intl.NumberFormat("en-IN").format(num)}`;
};

const formatCategoryLabel = (value = "") =>
  String(value)
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const FeaturedListings = () => {
  const [rows, setRows] = useState([]);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  useEffect(() => {
    let cancelled = false;

    const fetchFeaturedProperties = async () => {
      try {
        const res = await getFeaturedProperties({ limit: 10, page: 1 });

        if (!cancelled) {
          setRows(res?.items ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch featured properties:", error);

        if (!cancelled) {
          setRows([]);
        }
      }
    };

    fetchFeaturedProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const listings = useMemo(
    () =>
      (rows || []).map((item) => ({
        id: item?._id,
        slug: item?.description?.slug || item?._id,
        title: item?.description?.title || "Featured Property",
        image: getCleanPrimaryPropertyImage(item),

        bed: getBedroomLabel(item),
        bath: getBathroomLabel(item),
        sqft: formatSizeLabel(item),

        price: formatPrice(item?.description?.price ?? item?.minPrice),
        listingType: item?.details?.listingType || "For Sale",
        isFeatured: item?.description?.featuredProperty === "Yes",

        category: formatCategoryLabel(
          item?.description?.category?.name || "Featured"
        ),

        location: formatPropertyLocation(item),

        propertyType:
          item?.description?.propertyType?.name ||
          "Property type not specified",

        propertyStatus:
          item?.details?.propertyStatus || "Status not specified",

        parking: item?.details?.parking || "N/A",
        sizeInSqFt: getSizeSqFt(item),
      })),
    [rows]
  );

  if (!listings.length) {
    return null;
  }

  return (
    <>
      <Swiper
        className="featured-premium-swiper"
        spaceBetween={28}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".featured-next__active",
          prevEl: ".featured-prev__active",
        }}
        pagination={{
          el: ".featured-pagination__active",
          clickable: true,
        }}
        slidesPerView={1}
        breakpoints={{
          300: {
            slidesPerView: 1,
            spaceBetween: 18,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 22,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 26,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
      >
        {listings.map((listing, index) => {
          const inCompare = isInCompare(listing.id);

          const handleCompare = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (inCompare) {
              removeFromCompare(listing.id);
            } else {
              addToCompare({
                id: listing.id,
                slug: listing.slug,
                title: listing.title,
                image: listing.image,
                price: listing.price,
                location: listing.location,
                bed: listing.bed,
                bath: listing.bath,
                sqft: listing.sizeInSqFt,
                propertyType: listing.propertyType,
                propertyStatus: listing.propertyStatus,
                category: listing.category,
                parking: listing.parking || "N/A",
              });
            }
          };

          return (
            <SwiperSlide key={listing.id || index}>
              <article className="featured-property-card">
                <div className="featured-property-card__image-wrap">
                  <img
                    className="featured-property-card__image"
                    src={listing.image || "/images/listings/g1-1.jpg"}
                    alt={listing.title}
                    loading={index < 3 ? "eager" : "lazy"}
                    onError={(event) => {
                      if (event.currentTarget.src.includes("/images/listings/g1-1.jpg")) return;
                      event.currentTarget.src = "/images/listings/g1-1.jpg";
                    }}
                  />

                  <div className="featured-property-card__overlay" />

                  <div className="featured-property-card__badges">
                    {listing.category && (
                      <span className="featured-property-card__badge featured-property-card__badge--primary">
                        <i className="flaticon-electricity" />
                        {listing.category}
                      </span>
                    )}

                    {listing.listingType && (
                      <span className="featured-property-card__badge featured-property-card__badge--dark">
                        {listing.listingType}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCompare}
                    title={
                      inCompare ? "Remove from Compare" : "Add to Compare"
                    }
                    className={`featured-property-card__compare ${
                      inCompare ? "is-active" : ""
                    }`}
                  >
                    <i className="fas fa-code-compare" />
                    <span>{inCompare ? "Added" : "Compare"}</span>
                  </button>
                </div>

                <div className="featured-property-card__content">
                  <div className="featured-property-card__top">
                    <p className="featured-property-card__location">
                      <i className="far fa-location-dot" />
                      {listing.location}
                    </p>

                    <h3 className="featured-property-card__title">
                      <Link href={getPropertyHref(listing)}>
                        {listing.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="featured-property-card__meta">
                    {listing.bed ? (
                      <span>
                        <i className="flaticon-bed" />
                        {listing.bed}
                      </span>
                    ) : null}

                    {listing.bath ? (
                      <span>
                        <i className="flaticon-shower" />
                        {listing.bath}
                      </span>
                    ) : null}

                    {listing.sqft ? (
                      <span>
                        <i className="flaticon-expand" />
                        {listing.sqft}
                      </span>
                    ) : null}
                  </div>

                  <div className="featured-property-card__footer">
                    <div>
                      <span className="featured-property-card__price-label">
                        Starting from
                      </span>

                      <p className="featured-property-card__price">
                        {listing.price}
                      </p>
                    </div>

                    <Link
                      href={getPropertyHref(listing)}
                      className="featured-property-card__details"
                    >
                      Details
                      <i className="fal fa-arrow-right-long" />
                    </Link>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="featured-slider-controls">
        <button
          className="featured-prev__active featured-slider-controls__btn"
          type="button"
          aria-label="Previous featured property"
        >
          <i className="far fa-arrow-left-long" />
        </button>

        <div className="featured-pagination__active featured-slider-controls__pagination" />

        <button
          className="featured-next__active featured-slider-controls__btn"
          type="button"
          aria-label="Next featured property"
        >
          <i className="far fa-arrow-right-long" />
        </button>
      </div>
    </>
  );
};

export default FeaturedListings;

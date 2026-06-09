"use client";
import Image from "next/image";
import Link from "next/link";
import { getPropertyHref } from "@/utils/propertyRoute";
import { normalizePropertyDetail } from "@/utils/propertyDetail";
import { useCompare } from "@/context/CompareContext";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const NearbySimilarProperty = ({ properties = [], prefix = "featured-" }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  if (!properties.length) return null;

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: `.${prefix}next__active`,
          prevEl: `.${prefix}prev__active`,
        }}
        pagination={{
          el: `.${prefix}pagination__active`,
          clickable: true,
        }}
        slidesPerView={1}
        breakpoints={{
          300: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 3,
          },
        }}
      >
        {properties.map((property) => {
          const listing = normalizePropertyDetail(property);
          const image = listing.images?.[0] || "/images/listings/g1-1.jpg";
          const compareId = listing.id || listing.customId || property?._id;
          const inCompare = isInCompare(compareId);
          const handleCompare = () => {
            if (!compareId) return;
            if (inCompare) {
              removeFromCompare(compareId);
            } else {
              addToCompare({
                id: compareId,
                slug: listing.slug || property?.description?.slug || property?._id,
                title: listing.title,
                location: listing.location,
                image,
                // bed: listing.bedrooms || 0,
                // bath: listing.bathrooms || 0,
                // sqft: listing.sizeInFt || 0,
                price: listing.price,
                location: listing.location,
                bed: listing.bhk,
                bath: listing.bathrooms,
                sqft: listing.sizeInSqFt,
                location: listing.location,
                propertyType: listing.propertyType,
                propertyStatus: listing.propertyStatus,
                category: listing.category,
                parking: listing.parking || "N/A",
              });
            }
          };
          const metaItems = [
            listing.bhk ? `${listing.bhk} Bed` : null,
            listing.bathrooms ? `${listing.bathrooms} Bath` : null,
            listing.sizeInSqFt ? `${listing.sizeInSqFt} Sq Ft` : null,
          ].filter(Boolean);

          return (
            <SwiperSlide
              key={listing.id || listing.customId || listing.title}
              className="featured-similar-slide"
            >
              <div className="item">
                <div className="listing-style1 featured-similar-card h-100">
                  <div className="list-thumb">
                    <Image
                      width={382}
                      height={248}
                      className="w-100 h-100 cover"
                      src={image}
                      alt={listing.title}
                    />
                    <div className="sale-sticker-wrap">
                      {property?.description?.featuredProperty === "Yes" && (
                        <div className="list-tag rounded-0 fz12">
                          <span className="flaticon-electricity" />
                          FEATURED
                        </div>
                      )}
                    </div>
                    <div className="list-price">{listing.price}</div>
                  </div>
                  <div className="list-content">
                    <h6 className="list-title featured-similar-card__title">
                      <Link href={getPropertyHref(property)}>{listing.title}</Link>
                    </h6>
                    <p className="list-text featured-similar-card__location">
                      {listing.location || "Location unavailable"}
                    </p>
                    {metaItems.length ? (
                      <div className="list-meta d-flex align-items-center">
                        {metaItems.map((item) => (
                          <span key={item} className="me-3">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <hr className="mt-2 mb-2" />
                    <div className="list-meta2 d-flex justify-content-end align-items-center">
                      <div className="icons d-flex align-items-center">
                        <button
                          type="button"
                          onClick={handleCompare}
                          title={inCompare ? "Remove from Compare" : "Add to Compare"}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            color: inCompare ? "#ff385c" : "#6b7280",
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "color 0.2s",
                            fontWeight: 600,
                          }}
                        >
                          <i className="fas fa-code-compare" />
                          {inCompare && <span style={{ fontSize: 11 }}>Added</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};

export default NearbySimilarProperty;

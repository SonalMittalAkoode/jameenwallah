"use client";

import Image from "next/image";
import Link from "next/link";
import { getPropertyHref } from "@/utils/propertyRoute";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useCompare } from "@/context/CompareContext";
import {
  formatSizeLabel,
  getBathroomLabel,
  getBedroomLabel,
} from "@/utils/propertyDisplay";

const PopularListings = ({ data }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const hasValue = (value) => String(value || "").trim().length > 0;

  return (
    <>
      <Swiper
        className="popular-listings-swiper"
        spaceBetween={30}
        slidesPerView={1}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".popular-next__active",
          prevEl: ".popular-prev__active",
        }}
        pagination={{
          el: ".popular-pagination__active",
          clickable: true,
        }}
        breakpoints={{
          300: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2 },
          1200: { slidesPerView: 4 },
        }}
      >
        {data.slice(0, 8).map((listing, index) => {
          const inCompare = isInCompare(listing.id);
          const bedLabel = getBedroomLabel(listing);
          const bathLabel = getBathroomLabel(listing);
          const sizeLabel = formatSizeLabel(listing);

          const handleCompare = () => {
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
                bed: bedLabel,
                bath: bathLabel,
                sqft: sizeLabel,
                propertyType: listing.propertyType,
                propertyStatus: listing.propertyStatus,
                category: listing.category,
                parking: listing.parking || "N/A",
              });
            }
          };

          return (
            <SwiperSlide key={listing.id}>
              <div className="item popular-deals-slide-item">
                <div className="listing-style1 listing-style1--popular-deals">
                  <div className="list-thumb list-thumb--popular-deals">
                    <Image
                      fill
                      className="popular-deals-img contain"
                      src={listing.image}
                      alt={listing.title || "Property"}
                      sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
                      priority={index < 4}
                    />
                    <div className="sale-sticker-wrap">
                      {/* {listing.featured && ( */}
                        <div className="list-tag rounded-0 fz12">
                          <span className="flaticon-electricity" />
                          {listing.category}
                        </div>
                      {/* )} */}
                    </div>
                    <div className="list-price">
                      {listing.price}
                       {/* / <span>mo</span> */}
                    </div>
                  </div>
                  <div className="list-content">
                    <h6 className="list-title">
                      <Link href={getPropertyHref(listing)}>{listing.title}</Link>
                    </h6>
                    <p className="list-text">{listing.location}</p>
                    {hasValue(bedLabel) || hasValue(bathLabel) || hasValue(sizeLabel) ? (
                      <>
                        <div className="list-meta d-flex align-items-center">
                          {hasValue(bedLabel) ? (
                            <a href="#">
                              <span className="flaticon-bed" /> {bedLabel}
                            </a>
                          ) : null}
                          {hasValue(bathLabel) ? (
                            <a href="#">
                              <span className="flaticon-shower" /> {bathLabel}
                            </a>
                          ) : null}
                          {hasValue(sizeLabel) ? (
                            <a href="#">
                              <span className="flaticon-expand" /> {sizeLabel}
                            </a>
                          ) : null}
                        </div>
                        <hr className="mt-2 mb-2" />
                      </>
                    ) : null}
                    {/* Compare icon only */}
                    <div className="list-meta2 d-flex justify-content-end align-items-center">
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ff385c";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = inCompare ? "#ff385c" : "#6b7280";
                        }}
                      >
                        <i className="fas fa-code-compare" />
                        {inCompare && (
                          <span style={{ fontSize: 11 }}>Added</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation + Dot Pagination */}
      <div className="row align-items-center justify-content-center mt30">
        <div className="col-auto">
          <button className="popular-prev__active swiper_button">
            <i className="far fa-arrow-left-long" />
          </button>
        </div>

        <div className="col-auto">
          <div className="pagination swiper--pagination popular-pagination__active" />
        </div>

        <div className="col-auto">
          <button className="popular-next__active swiper_button">
            <i className="far fa-arrow-right-long" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PopularListings;

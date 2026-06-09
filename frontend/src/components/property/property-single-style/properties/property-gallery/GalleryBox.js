"use client";
import Image from "next/image";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const FALLBACK_IMAGE = "/images/background/property-bg.webp";

const GalleryBox = ({ property }) => {
  const { images } = normalizePropertyDetail(property);
  const imageList =
    Array.isArray(images) && images.length > 0 ? images : [FALLBACK_IMAGE];

  return (
    <>
      <Swiper
        className="property-detail-gallery-swiper"
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".single-pro-slide-next__active",
          prevEl: ".single-pro-slide-prev__active",
        }}
        slidesPerView={1}
        initialSlide={0}
        loop={imageList.length > 1}
      >
        {imageList.map((imageUrl, index) => (
          <SwiperSlide key={`${index}-${imageUrl}`}>
            <div className="property-gallery-slide-frame bgc-f7 bdrs12">
              <Image
                fill
                className="contain property-gallery-img"
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                sizes="(max-width: 1199px) 100vw, 1170px"
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="rounded-arrow arrowY-center-position">
        <button className="single-pro-slide-prev__active swiper_button _prev">
          <i className="far fa-chevron-left" />
        </button>
        {/* End prev */}

        <button className="single-pro-slide-next__active swiper_button _next">
          <i className="far fa-chevron-right" />
        </button>
        {/* End Next */}
      </div>
      {/* End .col for navigation  */}
    </>
  );
};

export default GalleryBox;

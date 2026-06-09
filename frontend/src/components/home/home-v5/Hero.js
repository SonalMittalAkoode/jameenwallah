"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/thumbs";
import Image from "next/image";
import Link from "next/link";

const fallbackSliderItems = [
  {
    image: "/images/listings/g1-1.jpg",
    title: "Find Premium Properties in Gurgaon with Expert Guidance",
    href: "/properties",
  },
  {
    image: "/images/listings/g1-1.jpg",
    title: "Explore Verified Real Estate Opportunities in Gurgaon’s Top Locations",
    href: "/properties",
  },
  {
    image: "/images/listings/g1-1.jpg",
    title: "Buy, Sell & Invest in Gurgaon with Trusted Real Estate Consultants",
    href: "/properties",
  },
  {
    image: "/images/listings/g1-1.jpg",
    title: "Discover Luxury Homes & High-Return Investment Properties in Gurgaon",
    href: "/properties",
  },
];

const Hero = ({ items = [] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const sliderItems = Array.isArray(items) && items.length ? items : fallbackSliderItems;

  return (
    <>
      <div className="hero-large-home5">
        <Swiper
          direction="vertical"
          spaceBetween={0}
          slidesPerView={1}
          speed={1400}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          modules={[Autoplay, Thumbs]}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          style={{ height: "100%" }}
        >
          {sliderItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="item">
                <div className="slider-slide-item">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    quality={75}
                    style={{ objectFit: "cover", zIndex: 0 }}
                  />
                  <div className="container" style={{ position: "relative", zIndex: 2 }}>
                    <div className="row">
                      <div className="col-lg-12 text-left position-relative">
                        <p className="h6 slider-title text-white">
                          {item.title}
                        </p>
                        <div className="slider-btn-block">
                          <Link
                            href={item.href || "/properties"}
                            className="ud-btn btn-white slider-btn"
                          >
                            View Details
                            <i className="fal fa-arrow-right-long" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="custom_thumbs">
        <Swiper
          direction="vertical"
          modules={[Thumbs]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          slidesPerView={sliderItems.length}
          spaceBetween={0}
          style={{ height: "268px" }}
        >
          {sliderItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Image
                width={50}
                height={50}
                className="cover"
                src={item.image}
                alt={`Thumbnail: ${item.title}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Hero;

"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

const Explore = () => {
  const iconboxData = useMemo(
    () => [
      {
        id: 1,
        step: "01",
        icon: "/images/icon/property-buy.svg",
        title: "Find Your Ideal Property",
        text: "Explore verified residential projects and discover homes that match your lifestyle, budget, and long-term goals in Gurgaon.",
        linkText: "Explore Properties",
        link: "/properties",
      },
      {
        id: 2,
        step: "02",
        icon: "/images/icon/property-sell.svg",
        title: "Invest in High-Potential Projects",
        text: "Get insights into Gurgaon's most promising developments and identify investment opportunities with strong future potential.",
        linkText: "View Investment Options",
        link: "/financer",
      },
      {
        id: 3,
        step: "03",
        icon: "/images/icon/property-rent.svg",
        title: "Expert Guidance for Buyers",
        text: "Whether you're an NRI or a first-time buyer, our team helps you understand locations, builders, pricing, and market trends.",
        linkText: "Get Expert Advice",
        link: "/contact",
      },
    ],
    []
  );

  const Card = ({ item }) => (
    <div className="iconbox-style2 h-100">
      <span className="iconbox-style2__step" aria-hidden="true">
        {item.step}
      </span>
      <div className="d-flex align-items-center mb20">
        <div className="explore-jameenwallah__icon-circle">
          <Image width={28} height={28} src={item.icon} alt="" />
        </div>
        <h4 className="explore-jameenwallah__card-title mb-0 ms-3">
          {item.title}
        </h4>
      </div>
      <div className="iconbox-content d-flex flex-column flex-grow-1">
        <p className="explore-jameenwallah__card-text">{item.text}</p>
        <Link href={item.link} className="explore-jameenwallah__btn mt-auto">
          {item.linkText}
          <i className="fal fa-arrow-up-right" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: 3 columns */}
      <div className="row gy-4 explore-jameenwallah__desktop-row">
        {iconboxData.map((item) => (
          <div
            className="col-sm-6 col-lg-4"
            key={item.id}
            data-aos="fade-up"
            data-aos-delay={item.id * 100}
          >
            <Card item={item} />
          </div>
        ))}
      </div>

      {/* Mobile slider */}
      <div className="explore-jameenwallah__mobile-slider">
        <Swiper
          className="explore-jameenwallah__swiper"
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          pagination={{ clickable: true }}
          grabCursor
        >
          {iconboxData.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="explore-jameenwallah__mobile-slide-inner pb40">
                <Card item={item} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Explore;
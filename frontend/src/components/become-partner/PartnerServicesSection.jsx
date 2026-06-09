"use client";

import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/swiper-bundle.css";

const ServiceCard = ({ item }) => (
  <div className="iconbox-style2 text-start partner-benefit-card mb0">
    <div className="partner-benefit-card__icon mb20">
      <i className={item.icon} aria-hidden="true" />
    </div>
    <div className="iconbox-content">
      <h4 className="title mb10">{item.title}</h4>
      <p className="text mb-0">{item.text}</p>
    </div>
  </div>
);

export default function PartnerServicesSection({
  services = [],
  title = "Why Partner with Us?",
  description = "Let us help you unlock the full potential of your business.",
}) {
  if (!services.length) return null;

  return (
    <section id="services" className="pb90 pb30-md">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="main-title2 text-center mb30">
              <h2 className="title">{title}</h2>
              <p className="paragraph">{description}</p>
            </div>
          </div>
        </div>

        <div className="row partner-services__desktop-grid">
          {services.map((item) => (
            <div
              className="col-sm-6 col-xl-3 partner-services__desktop-card mb30"
              key={item.title}
            >
              <ServiceCard item={item} />
            </div>
          ))}
        </div>

        <div className="partner-services__mobile-slider">
          <Swiper
            className="partner-services__swiper"
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={18}
            loop={services.length > 1}
            autoplay={{
              delay: 2600,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            grabCursor
          >
            {services.map((item) => (
              <SwiperSlide key={item.title}>
                <div className="partner-services__mobile-slide-inner">
                  <ServiceCard item={item} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

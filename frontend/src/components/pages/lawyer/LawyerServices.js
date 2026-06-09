"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const services = [
  {
    icon: "fas fa-balance-scale",
    title: "Property Dispute Resolution",
    text: "Resolve disputes with builders, tenants, or co-owners through expert legal support. From settlements to litigation, we protect your rights at every stage.",
  },
  {
    icon: "fas fa-file-contract",
    title: "Title Verification & Due Diligence",
    text: "Ensure clear ownership with detailed title checks, document verification, and legal risk assessment before your property transaction.",
  },
  {
    icon: "fas fa-gavel",
    title: "Agreement Drafting & Review",
    text: "Draft and review sale deeds, lease agreements, and contracts with precision so every document protects your best interests.",
  },
  {
    icon: "fas fa-file-signature",
    title: "Builder Dispute & Legal Action",
    text: "Handle possession delays, fraud, or false commitments confidently with RERA and legal filing assistance.",
  },
  {
    icon: "fas fa-home",
    title: "NRI Legal & Compliance Support",
    text: "End-to-end legal assistance for NRIs managing property remotely, from documentation to compliance and secure transactions.",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Legal Risk & Compliance Management",
    text: "Identify risks early and ensure adherence to property laws, regulations, documentation standards, and compliance requirements.",
  },
];

const LawyerServices = ({ section = {} }) => {
  const [isMobile, setIsMobile] = useState(false);
  const serviceItems = Array.isArray(section.items) ? section.items : services;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const ServiceCard = ({ service, index }) => (
    <div className="lawyer-service-card">
      <div className="lawyer-service-card__top">
        <div className="lawyer-service-card__icon">
          <i className={service.icon} />
        </div>
        <span className="lawyer-service-card__number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h4 className="lawyer-service-card__title">{service.title}</h4>
      <p className="lawyer-service-card__text">{service.text}</p>

      <div className="lawyer-service-card__footer">
        <span>Learn more</span>
        <i className="fal fa-arrow-right-long" />
      </div>
    </div>
  );

  return (
    <section className="lawyer-services-section" id="lawyer-services">
      <div className="container">
        <div className="row justify-content-center mb45 mb30-md">
          <div className="col-xl-7 col-lg-8 text-center" data-aos="fade-up">
            <h2 className="lawyer-section-title">
              {section.title || "Legal Services We Provide"}
            </h2>
            <p className="lawyer-section-text">
              {section.description ||
                "Comprehensive legal solutions tailored for every stage of your real estate journey — from purchase to protection."}
            </p>
          </div>
        </div>

        {isMobile ? (
          <>
            <Swiper
              spaceBetween={18}
              slidesPerView={1.08}
              centeredSlides={true}
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{
                nextEl: ".lawyer-services-next",
                prevEl: ".lawyer-services-prev",
              }}
              pagination={{
                el: ".lawyer-services-pagination",
                clickable: true,
              }}
              autoplay={{
                delay: 3800,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              className="lawyer-services-swiper"
            >
              {serviceItems.map((service, index) => (
                <SwiperSlide key={`${service.title}-${index}`}>
                  <ServiceCard service={service} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="lawyer-services-nav">
              <button className="lawyer-services-prev lawyer-slider-btn" type="button">
                <i className="far fa-arrow-left-long" />
              </button>

              <div className="lawyer-services-pagination swiper-pagination" />

              <button className="lawyer-services-next lawyer-slider-btn" type="button">
                <i className="far fa-arrow-right-long" />
              </button>
            </div>
          </>
        ) : (
          <div className="row g-4">
            {serviceItems.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                className="col-md-6 col-lg-4"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <ServiceCard service={service} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LawyerServices;
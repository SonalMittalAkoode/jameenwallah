"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ─── Financer: 2-col list cards with gold left border ─── */
const FinancerServices = ({ services, heading, subheading, sectionId }) => {
  return (
    <section
      className="fin-services-section profession-services-section"
      id={sectionId}
    >
      <div className="container">
        <div className="row justify-content-center mb45 mb30-md">
          <div className="col-xl-7 col-lg-8 text-center" data-aos="fade-up">
            <h2 className="fin-section-title">{heading}</h2>
            <p className="fin-section-text">{subheading}</p>
          </div>
        </div>

        <div className="row g-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="col-md-6"
              data-aos="fade-up"
              data-aos-delay={index * 70}
            >
              <div className="fin-svc-card">
                <div className="fin-svc-card__top">
                  <div className="fin-svc-card__icon">
                    <i className={service.icon} />
                  </div>

                  <span className="fin-svc-card__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="fin-svc-card__body">
                  <h5 className="fin-svc-card__title">{service.title}</h5>
                  <p className="fin-svc-card__text">{service.text}</p>
                </div>

                <div className="fin-svc-card__footer">
                  <span>Explore option</span>
                  <i className="fal fa-arrow-right-long" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Architect: 3-col blueprint-numbered cards ─── */
const ArchitectServices = ({ services, heading, subheading, sectionId }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="arch-services-section pt80 pt60-md pb80 pb60-md profession-services-section" id={sectionId}>
      <div className="container">
        <div className="row align-items-end mb50 mb30-md">
          <div className="col-lg-6" data-aos="fade-right">
            {/* <p className="arch-kicker">Our Services</p> */}
            <h1 className="title mb0">{heading}</h1>
          </div>
          <div className="col-lg-6" data-aos="fade-left">
            <p className="text fz15 mb-0 ps-lg-4 pt10">{subheading}</p>
          </div>
        </div>
        {isMobile ? (
          <>
            <Swiper
              spaceBetween={16}
              slidesPerView={1.2}
              centeredSlides={true}
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{
                nextEl: `.${sectionId}-next`,
                prevEl: `.${sectionId}-prev`,
              }}
              pagination={{
                el: `.${sectionId}-pagination`,
                clickable: true,
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              className="profession-services-swiper"
            >
              {services.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className="arch-svc-card">
                    <div className="arch-svc-card__num">0{i + 1}</div>
                    <div className="arch-svc-card__icon"><i className={s.icon} /></div>
                    <h5 className="arch-svc-card__title">{s.title}</h5>
                    <p className="arch-svc-card__text">{s.text}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="profession-services-nav">
              <button className={`${sectionId}-prev swiper_button`}><i className="far fa-arrow-left-long" /></button>
              <div className={`${sectionId}-pagination swiper-pagination`} />
              <button className={`${sectionId}-next swiper_button`}><i className="far fa-arrow-right-long" /></button>
            </div>
          </>
        ) : (
          <div className="row g-4">
            {services.map((s, i) => (
              <div key={i} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={i * 60}>
                <div className="arch-svc-card">
                  <div className="arch-svc-card__num">0{i + 1}</div>
                  <div className="arch-svc-card__icon"><i className={s.icon} /></div>
                  <h5 className="arch-svc-card__title">{s.title}</h5>
                  <p className="arch-svc-card__text">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── CA: Clean precision rows with green check ─── */
const CAServices = ({ services, heading, subheading, sectionId }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="ca-services-section pt80 pt60-md pb80 pb60-md profession-services-section" id={sectionId}>
      <div className="container">
        <div className="row justify-content-center mb50 mb30-md">
          <div className="col-lg-7 text-center" data-aos="fade-up">
            {/* <p className="ca-kicker">Our Expertise</p> */}
            <h2 className="title mb15">{heading}</h2>
            <p className="text fz15">{subheading}</p>
          </div>
        </div>
        {isMobile ? (
          <>
            <Swiper
              spaceBetween={16}
              slidesPerView={1.2}
              centeredSlides={true}
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{
                nextEl: `.${sectionId}-next`,
                prevEl: `.${sectionId}-prev`,
              }}
              pagination={{
                el: `.${sectionId}-pagination`,
                clickable: true,
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              className="profession-services-swiper"
            >
              {services.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className="ca-svc-row">
                    <div className="ca-svc-row__icon"><i className={s.icon} /></div>
                    <div className="ca-svc-row__body">
                      <h5 className="ca-svc-row__title">{s.title}</h5>
                      <p className="ca-svc-row__text">{s.text}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="profession-services-nav">
              <button className={`${sectionId}-prev swiper_button`}><i className="far fa-arrow-left-long" /></button>
              <div className={`${sectionId}-pagination swiper-pagination`} />
              <button className={`${sectionId}-next swiper_button`}><i className="far fa-arrow-right-long" /></button>
            </div>
          </>
        ) : (
          <div className="row g-3">
            {services.map((s, i) => (
              <div key={i} className="col-md-6" data-aos="fade-up" data-aos-delay={i * 60}>
                <div className="ca-svc-row">
                  <div className="ca-svc-row__icon"><i className={s.icon} /></div>
                  <div className="ca-svc-row__body">
                    <h5 className="ca-svc-row__title">{s.title}</h5>
                    <p className="ca-svc-row__text">{s.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Default (Lawyer-style) ─── */
const DefaultServices = ({ services, sectionId, heading, subheading }) => (
  <section className="pt80 pt60-md pb80 pb60-md bgc-thm-light" id={sectionId}>
    <div className="container">
      <div className="row justify-content-center mb50 mb30-md">
        <div className="col-lg-8 text-center" data-aos="fade-up">
          {/* <p className="section-kicker">What We Offer</p> */}
          <h2 className="title mb15">{heading}</h2>
          <p className="text fz15">{subheading}</p>
        </div>
      </div>
      <div className="row g-4">
        {services.map((s, i) => (
          <div key={i} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={i * 80}>
            <div className="lawyer-service-card">
              <div className="lawyer-service-card__icon"><i className={s.icon} /></div>
              <h4 className="lawyer-service-card__title">{s.title}</h4>
              <p className="lawyer-service-card__text">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── PM: 3-col top-border cards ─── */
const PMServices = ({ services, heading, subheading, sectionId }) => (
  <section className="pm-services-section pt80 pt60-md pb80 pb60-md" id={sectionId}>
    <div className="container">
      <div className="row justify-content-center mb50 mb30-md">
        <div className="col-lg-7 text-center" data-aos="fade-up">
          {/* <p className="pm-kicker">What We Offer</p> */}
          <h2 className="title mb15">{heading}</h2>
          <p className="text fz15">{subheading}</p>
        </div>
      </div>
      <div className="row g-4">
        {services.map((s, i) => (
          <div key={i} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={i * 60}>
            <div className="pm-svc-card">
              <div className="pm-svc-card__icon"><i className={s.icon} /></div>
              <h5 className="pm-svc-card__title">{s.title}</h5>
              <p className="pm-svc-card__text">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProfessionServices = ({ services, sectionId, heading, subheading, profession }) => {
  if (profession === "financer") return <FinancerServices services={services} sectionId={sectionId} heading={heading} subheading={subheading} />;
  if (profession === "architect") return <ArchitectServices services={services} sectionId={sectionId} heading={heading} subheading={subheading} />;
  if (profession === "ca") return <CAServices services={services} sectionId={sectionId} heading={heading} subheading={subheading} />;
  if (profession === "pm") return <PMServices services={services} sectionId={sectionId} heading={heading} subheading={subheading} />;
  return <DefaultServices services={services} sectionId={sectionId} heading={heading} subheading={subheading} />;
};

export default ProfessionServices;

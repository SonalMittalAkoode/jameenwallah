"use client";

import Link from "next/link";

const LawyerHero = ({ content = {} }) => {
  const description =
    content.description ||
    "Navigate your real estate journey with confidence. Our legal experts help you with property disputes, documentation, title verification, compliance, and secure transactions.";

  const [lead, ...rest] = description.split(/\s+(?=Our expert legal services)/);

  return (
    <section className="lawyer-hero">
      <div
        className="lawyer-hero__bg"
        style={{ backgroundImage: "url(/images/lawyer/lawyer_hero.webp)" }}
      />

      <div className="lawyer-hero__overlay" />

      <div className="lawyer-hero__shape lawyer-hero__shape--one" />
      <div className="lawyer-hero__shape lawyer-hero__shape--two" />

      <div className="container">
        <div className="row align-items-center ">
          <div className="col-xl-7 col-lg-8 col-md-10">
            <div
              className="lawyer-hero__content"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <span className="lawyer-hero__badge">
                <i className="fas fa-shield-check" />
                Trusted Real Estate Legal Support
              </span>

              <h1 className="lawyer-hero__title">
                {content.title || "Real Estate, Legally Secured"}
              </h1>

              <p className="lawyer-hero__desc">
                {lead}
                {rest.length > 0 && (
                  <>
                    <br />
                    {rest.join(" ")}
                  </>
                )}
              </p>

              <div className="lawyer-hero__actions">
                <Link href="/contact" className="ud-btn lawyer-btn lawyer-btn--primary">
                  {content.primaryCta || "Consult a Lawyer"}
                  <i className="fal fa-arrow-right-long ms-2" />
                </Link>

                <Link
                  href="#lawyer-services"
                  className="ud-btn lawyer-btn lawyer-btn--light"
                >
                  {content.secondaryCta || "Explore Services"}
                  <i className="fal fa-arrow-right-long ms-2" />
                </Link>
              </div>

              <div className="lawyer-hero__trust">
                <div>
                  <strong>500+</strong>
                  <span>Cases Guided</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>Quick Response</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Confidential</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LawyerHero;
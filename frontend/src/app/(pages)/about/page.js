import CallToActions from "@/components/common/CallToActions";
import DefaultHeader from "@/components/common/DefaultHeader";
import Partner from "@/components/common/Partner";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import WhatWeDo from "@/components/pages/about/WhatWeDo";
import WhyChooseUsFlow from "@/components/pages/about/WhyChooseUsFlow";
import Image from "next/image";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const response = await getSiteContentByPageKeyFrontend("about");
  const content = response?.data;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

// ── Inline SVG icons (no extra dep needed) ───────────────────────────────────
const IconLayers = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconTarget = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Page Component ────────────────────────────────────────────────────────────
const About = async () => {
  const response = await getSiteContentByPageKeyFrontend("about");
  const content = response?.data;
  const intro = content.sections?.intro || {};
  const whatWeDo = content.sections?.whatWeDo || {};

  return (
    <>
      {/* ── Nav ── */}
      <DefaultHeader />
      <MobileMenu />

      {/* ── Hero / Breadcrumb banner ── */}
      <section className="breadcumb-section2 p-0 about-breadcrumb-hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">
                  {content.sections?.hero?.title || content.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ABOUT INTRO SECTION  ← redesigned
      ══════════════════════════════════════════════ */}
      <section className="our-about pb30">
        <div className="container">

          {/* Breadcrumb trail */}
          <div className="row mb20">
            <div className="col-lg-12">
              <div className="about-page-breadcrumb">
                <a href="/">Home</a>
                <span className="breadcrumb-sep">›</span>
                <a href="/about">About</a>
              </div>
            </div>
          </div>

          {/* ── Main two-column intro ── */}
          <div className="row" data-aos="fade-up" data-aos-delay="200">

            {/* LEFT — heading + image */}
            <div className="col-lg-6 pe-lg-5">
              <div className="about-intro-left about-animate">

                <h2>{intro.heading}</h2>

                {/* Image with decorative frame + floating badge */}
                <div className="about-top-img-wrapper">
                  <div className="about-top-img bdrs12">
                    <Image
                      width={588}
                      height={420}
                      className="w-100"
                      src="/images/about/about-us-top.jpg"
                      alt="JameenWallah team helping property buyers"
                      priority
                    />
                  </div>

                  {/* Floating trust badge */}
                  <div className="about-img-badge">
                    <div className="badge-icon">
                      <IconShield />
                    </div>
                    <div className="badge-text">
                      <strong>Trusted Since 2018</strong>
                      <span>1200+ Happy Families</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT — copy + mission/vision cards */}
            <div className="col-lg-6 ps-lg-4">
              <div className="about-intro-right about-animate about-animate-delay-1">

                <p className="text mb20">{intro.summary}</p>

                {/* Styled blockquote-style emphasis line */}
                {intro.emphasis && (
                  <p className="about-emphasis">{intro.emphasis}</p>
                )}

                {intro.origin && (
                  <p className="text mb20">{intro.origin}</p>
                )}

                <p className="text">{intro.mission}</p>

                {/* ── Mission & Vision cards ── */}
                <div className="mission-cards-row about-animate about-animate-delay-2">

                  {/* Mission */}
                  <div className="mission-card">
                    <div className="mission-card-icon">
                      <IconLayers />
                    </div>
                    <h5>Our Mission</h5>
                    <p>
                      To empower individuals and families with transparent,
                      trustworthy, and innovative real estate solutions that
                      ensure secure and confident investments.
                    </p>
                    <span className="mission-card-number" aria-hidden="true">01</span>
                  </div>

                  {/* Vision */}
                  <div className="mission-card">
                    <div className="mission-card-icon">
                      <IconTarget />
                    </div>
                    <h5>Our Vision</h5>
                    <p>
                      To become India's most trusted real estate partner,
                      transforming how people buy, sell, and invest in property
                      through expert guidance and technology.
                    </p>
                    <span className="mission-card-number" aria-hidden="true">02</span>
                  </div>

                </div>
                {/* end mission-cards-row */}

              </div>
            </div>

          </div>
          {/* end row */}

        </div>
      </section>
      {/* ══ end redesigned intro ══ */}

      {/* Why Choose Us Flow */}
      <WhyChooseUsFlow />

      {/* What We Do */}
      <WhatWeDo
        title={whatWeDo.title || "What We Do"}
        items={whatWeDo.items || []}
      />

      {/* Our Partners */}
      <section className="our-partners">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="dots_none nav_none" data-aos="fade-up" data-aos-delay="300">
                <Partner />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CallToActions />

      {/* Footer */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default About;

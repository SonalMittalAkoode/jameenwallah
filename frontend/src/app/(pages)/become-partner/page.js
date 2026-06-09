/**
 * BecomePartnerPage — Redesigned (Polished)
 * External styles: partner-page.css
 * Primary colour: #ff385c
 */

/**
 * BecomePartnerPage — Redesigned (Polished)
 * External styles: partner-page.css
 * Primary colour: #ff385c
 */

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import BecomePartnerForm from "@/components/become-partner/BecomePartnerForm";
import Image from "next/image";
import Link from "next/link";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import { mergeSiteContent } from "@/lib/siteContentDefaults";
import { getSafeSiteContent } from "@/lib/professionSiteContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const content = mergeSiteContent(
    "partner",
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "partner")
  );
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

/* ── Small inline components ── */

function SectionLabel({ text }) {
  return <span className="section-label">{text}</span>;
}

function StatItem({ num, suffix = "+", label }) {
  return (
    <div className="stat-item">
      <div className="partner-hero__stat-num">
        {num}<span>{suffix}</span>
      </div>
      <div className="partner-hero__stat-label">{label}</div>
    </div>
  );
}

/* ── Page ── */

const BecomePartnerPage = async () => {
  const content = mergeSiteContent(
    "partner",
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "partner")
  );

  const hero            = content.sections?.hero || {};
  const whoCanPartner   = content.sections?.whoCanPartner || {};
  const benefits        = content.sections?.benefits || {};
  const services        = Array.isArray(benefits.items)       ? benefits.items       : [];
  const partnerProfiles = Array.isArray(whoCanPartner.items)  ? whoCanPartner.items  : [];

  const iconMap = [
    "fas fa-chart-line",
    "fas fa-handshake",
    "fas fa-rocket",
    "fas fa-shield-alt",
    "fas fa-star",
    "fas fa-globe",
  ];

  const defaultProfiles = [
    { title: "Real Estate Brokers & Agents",       text: "Connect clients with our verified property listings and earn premium commissions." },
    { title: "Legal & Financial Experts",          text: "Advise on property transactions, financial planning, and investment portfolios." },
    { title: "Property Management Professionals",  text: "Manage and oversee rental properties using our strategic and scalable tools." },
    { title: "Agency Owners & Co-brands",          text: "White-label our platform and grow your own real estate brand with us." },
  ];

  const defaultServices = [
    { icon: "fas fa-chart-line", title: "Expand Your Reach",        text: "Access thousands of buyers, sellers, and investors across India." },
    { icon: "fas fa-users",      title: "Collaborate with Experts",  text: "Work alongside top real estate agents and property specialists." },
    { icon: "fas fa-rocket",     title: "Drive Mutual Growth",       text: "Co-marketing, shared leads, and collaborative revenue strategies." },
    { icon: "fas fa-medal",      title: "Enhance Your Credibility",  text: "Leverage brand recognition, expertise and client trust at scale." },
  ];

  const quickBenefits = [
    { icon: "fas fa-bolt",    title: "Fast Onboarding",     text: "Get set up and earning in under 48 hours." },
    { icon: "fas fa-percent", title: "Competitive Margins",  text: "Industry-leading revenue share structures." },
  ];

  const activeProfiles = partnerProfiles.length > 0 ? partnerProfiles : defaultProfiles;
  const activeServices = services.length > 0 ? services : defaultServices;

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      {/* ── Breadcrumb (unchanged) ── */}
      <section className="breadcumb-section2 breadcumb-section-partner p-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">{hero.title || content.title}</h1>
                <div className="breadcumb-list">
                  <a href="/">Home</a>
                  <a href="/become-partner">Become A Partner</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="partner-hero bg-animated">
        <div className="partner-hero__blob partner-hero__blob--1" aria-hidden="true" />
        <div className="partner-hero__blob partner-hero__blob--2" aria-hidden="true" />

        <div className="ph-container">
          <div className="ph-row">

            {/* Content */}
            <div className="ph-col-content anim-slide-right">
              <div className="partner-hero__content">

                <h2 className="display-title">
                  {hero.heading
                    ? hero.heading
                    : <>Grow Together with <em>Jameen Walfah</em></>}
                </h2>

                <div className="title-line" />

                {hero.eyebrow && (
                  <p className="partner-hero__eyebrow">"{hero.eyebrow}"</p>
                )}

                {hero.description && (
                  <p className="partner-hero__desc">{hero.description}</p>
                )}
                {hero.secondaryDescription && (
                  <p className="partner-hero__desc mb-0">{hero.secondaryDescription}</p>
                )}

                <div className="partner-hero__cta">
                  <Link href="#partner-form" className="btn btn-primary">
                    Get Started <i className="fal fa-arrow-right-long" />
                  </Link>
                  <Link href="#who-can-partner" className="btn btn-ghost">
                    Learn More <i className="fal fa-arrow-down" />
                  </Link>
                </div>

                <div className="partner-hero__stats">
                  <StatItem num="2400" label="Active Partners" />
                  <div className="stat-divider" />
                  <StatItem num="98" suffix="%" label="Satisfaction Rate" />
                  <div className="stat-divider" />
                  <StatItem num="50" label="Cities Covered" />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="ph-col-media anim-slide-left">
              <div className="partner-hero__image-wrap">
                <Image
                  src="/images/about/partner5.png"
                  alt="Partner collaboration"
                  width={620}
                  height={420}
                  className="w-100 h-auto"
                  priority
                />
                <div className="partner-hero__image-badge">
                  <div className="partner-hero__image-badge-icon">
                    <i className="fas fa-trophy" />
                  </div>
                  <div className="partner-hero__image-badge-text">
                    <strong>Trusted Network</strong>
                    <small>Join 2,400+ Partners</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FORM SECTION
      ══════════════════════════════════════ */}
      <section className="partner-form-section" id="partner-form">
        <div className="pf-container">
          <div className="pf-row">

            {/* Form card */}
            <div className="pf-col-form anim-fade-up">
              <div className="partner-form__card">
                <h2 className="partner-form__title">
                  {content.sections?.form?.title || "Become A Partner"}
                </h2>
                <BecomePartnerForm />
              </div>
            </div>

            {/* Right: image + benefit cards */}
            <div className="pf-col-media anim-slide-left">
              <div className="partner-form__media">
                <div className="partner-form__media-img-wrap">
                  <Image
                    src="/images/about/partner7.png"
                    alt="Agency insights"
                    width={480}
                    height={300}
                    className="w-100 h-auto partner-form__media-img"
                  />
                </div>

                <div className="partner-form__benefits">
                  {quickBenefits.map((c, i) => (
                    <div key={c.title} className={`partner-form__media-card anim-fade-up delay-${i + 2}`}>
                      <div className="partner-form__media-card-icon">
                        <i className={c.icon} />
                      </div>
                      <div>
                        <h6>{c.title}</h6>
                        <p>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHO CAN PARTNER
      ══════════════════════════════════════ */}
      <section className="partner-who" id="who-can-partner">
        <div className="pw-container">
          <div className="pw-row">

            {/* Image */}
            <div className="pw-col-media anim-slide-right">
              <div className="partner-who__image-wrap">
                <Image
                  src="/images/about/partner6.png"
                  alt="Simple solutions"
                  width={580}
                  height={520}
                  className="w-100 h-auto"
                />
              </div>
            </div>

            {/* Content */}
            <div className="pw-col-content anim-slide-left">
              <div className="partner-who__content">
                <h2 className="section-title">
                  {whoCanPartner.title
                    ? whoCanPartner.title
                    : <>Who Can Partner <em>With Us?</em></>}
                </h2>
                <div className="title-line" />
                {whoCanPartner.description && (
                  <p className="section-body mb30">{whoCanPartner.description}</p>
                )}

                <div className="partner-who__points">
                  {activeProfiles.map((item, i) => (
                    <div key={item.title} className={`partner-who__point anim-fade-up delay-${i + 1}`}>
                      <div className="partner-who__point-check">
                        <i className="fas fa-circle-check" />
                      </div>
                      <div>
                        <h6>{item.title}</h6>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="partner-who__cta">
                  <Link href="#partner-form" className="btn btn-primary">
                    Apply Now <i className="fal fa-arrow-right-long" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY PARTNER — dark section
      ══════════════════════════════════════ */}
      <section className="partner-services">
        <div className="ps-container">
          <div className="partner-services__header">
            <h2 className="section-title ps-title">
              {benefits.title
                ? benefits.title
                : <>Benefits That <em>Set Us Apart</em></>}
            </h2>
            {benefits.description && (
              <p className="section-body ps-body">{benefits.description}</p>
            )}
          </div>

          <div className="partner-services__grid">
            {activeServices.map((svc, i) => (
              <div key={svc.title} className={`partner-service-card anim-fade-up delay-${(i % 5) + 1}`}>
                <div className="partner-service-card__icon">
                  <i className={svc.icon || iconMap[i % iconMap.length]} />
                </div>
                <h3 className="partner-service-card__title">{svc.title}</h3>
                <p className="partner-service-card__text">{svc.text || svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer (unchanged) ── */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
};

export default BecomePartnerPage;
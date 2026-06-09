// frontend/src/app/(pages)/chartered-accountant/page.js
// Layout mirrors architect page.js exactly — same section order,
// same HTML patterns, ca- prefix classes throughout.

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import CallToActions from "@/components/common/CallToActions";
import ProfessionConsultationForm from "@/components/profession/ProfessionConsultationForm";
import ServiceIcon from "@/components/profession/ServiceIcon";
import caData, { caTeam as staticCaTeam } from "@/data/caData";
import { resolveImageSrc } from "@/utils/resolveImage";
import { getApiBaseUrl } from "@/api/apiBase";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import {
  getSafeSiteContent,
  mergeProfessionSiteContent,
} from "@/lib/professionSiteContent";

// Place ca-page.css in src/styles/ (same folder as architect-page.css)
// import "@/styles/ca-page.css";

const API_BASE_URL = getApiBaseUrl("http://localhost:5001");

export const dynamic = "force-dynamic";
export const revalidate = 0;

const caServiceIcons = [
  "fas fa-file-invoice-dollar",
  "fas fa-percentage",
  "fas fa-chart-pie",
  "fas fa-search-dollar",
  "fas fa-building",
  "fas fa-balance-scale",
];

export async function generateMetadata() {
  const content = await getSafeSiteContent(
    getSiteContentByPageKeyFrontend,
    "chartered-accountant"
  );
  const d = mergeProfessionSiteContent(caData, content);
  return { title: d.meta.title, description: d.meta.desc };
}

export default async function CharteredAccountantPage() {
  const d = mergeProfessionSiteContent(
    caData,
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "chartered-accountant")
  );
  const heroTitle = d.hero?.title || d.hero?.heading || "";
  const heroDesc = d.hero?.desc || d.hero?.description || "";
  const serviceItems = Array.isArray(d.services?.items) ? d.services.items : [];
  const whyFeatures = Array.isArray(d.whyUs?.features) ? d.whyUs.features : [];
  const processSteps = Array.isArray(d.process?.steps) ? d.process.steps : [];

  let dynamicTeam = staticCaTeam;
  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/charteredaccountant`, {
      next: { revalidate: 60 },
    });
    const result = await res.json();
    if (
      result.status === "success" &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      dynamicTeam = result.data.map((item) => {
        const identifier = item.slug || item._id || item.name || "ca-profile";
        const seed = identifier
          .split("")
          .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
        const yearsOfExperience = 8 + (Math.abs(seed) % 15);
        return {
          slug: item.slug || item._id,
          name: item.name || "Chartered Accountant",
          role: item.metaTitle || "Senior CA",
          exp: `${yearsOfExperience} Years Experience`,
          img: resolveImageSrc(item.image, "/images/team/team-1.jpg"),
          speciality: item.description
            ? item.description.length > 40
              ? item.description.substring(0, 40).replace(/(<([^>]+)>)/gi, "") + "..."
              : item.description.replace(/(<([^>]+)>)/gi, "")
            : "Tax & Compliance Expert",
          rating: 4 + (Math.abs(seed) % 2),
        };
      });
    }
  } catch (error) {
    console.error("Failed to fetch chartered accountants:", error);
  }

  return (
    <div className="ca-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO — split grid: copy left / image right ─────────── */}
      <div className="ca-hero">
        {/* Left copy panel */}
        <div className="ca-hero__copy">
          <span className="ca-hero__eyebrow">Chartered Accountants for Real Estate</span>

          <h1 className="ca-hero__title">
            {heroTitle ? (
              <>
                {heroTitle.split(",")[0]}
                {heroTitle.includes(",") && (
                  <em> {heroTitle.split(",").slice(1).join(",").trim()}</em>
                )}
              </>
            ) : (
              <>
                Expert Accounting,
                <em> Peace of Mind</em>
              </>
            )}
          </h1>

          <p className="ca-hero__desc">
            {heroDesc ||
              "Trusted chartered accountants specialising in real estate finance, property tax planning, capital gains, and RERA compliance across Gurgaon and NCR."}
          </p>

          <div className="ca-hero__cta-row">
            <a href="#consultation" className="ca-btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Consultation
            </a>
            <a href="#services" className="ca-btn-ghost">
              Explore Services
            </a>
          </div>
        </div>

        {/* Right image panel */}
        <div className="ca-hero__image">
          {/* Replace with your actual hero image */}
          <img
            src={d.hero?.image || "/images/ca/ca-hero.jpg"}
            alt="Chartered accountant at work"
          />
        </div>

        
      </div>

      {/* ── MARQUEE STRIP — amber scrolling band ──────────────── */}
      <div className="ca-marquee-strip">
        <div className="ca-marquee-inner">
          {[
            "Property Tax Planning",
            "GST on Properties",
            "Capital Gains Advisory",
            "Financial Auditing",
            "Property Valuation Reports",
            "TDS/Tax Compliance",
            "RERA Consulting",
            "NRI Tax Advisory",
            "Property Tax Planning",
            "GST on Properties",
            "Capital Gains Advisory",
            "Financial Auditing",
            "Property Valuation Reports",
            "TDS/Tax Compliance",
            "RERA Consulting",
            "NRI Tax Advisory",
          ].map((txt, i) => (
            <span className="ca-marquee-item" key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ── SERVICES — 3×2 card grid ──────────────────────────── */}
      <div id="services" className="ca-section ca-section--cream">
        <div className="ca-container">
          <div className="ca-services__intro">
            <div>
              <span className="ca-section-label">What We Offer</span>
              <h2 className="ca-section-heading">
                {d.services?.heading || "CA Services for Real Estate"}
              </h2>
            </div>
            <div className="ca-services__intro-action">
              <p className="ca-section-subtext">
                {d.services?.subheading || d.services?.description ||
                  "Comprehensive financial and tax services designed for real estate buyers, sellers, developers, and investors across Gurgaon."}
              </p>
            </div>
          </div>

          <div className="ca-services__grid">
            {serviceItems.map((item, i) => (
              <div className="ca-service-card ca-fade-up" key={`${item.title}-${i}`}>
                <ServiceIcon
                  icon={item.icon}
                  index={i}
                  fallbackIcons={caServiceIcons}
                  className="ca-service-card__icon"
                />
                <span className="ca-service-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="ca-service-card__title">{item.title}</h3>
                <p className="ca-service-card__desc">{item.text || item.description || item.desc || ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY US — image left / dark panel right ────────────── */}
      <div className="ca-whyus">
        <div className="ca-whyus__image">
          <img
            src={d.whyUs?.image || "/images/ca-why-us.jpg"}
            alt="Tax experts collaborating on property documents"
          />
          <div className="ca-whyus__image-overlay" />
        </div>

        <div className="ca-whyus__content">
          <span className="ca-section-label">Why Choose Us</span>
          <h2 className="why-ca-section-heading">
            {d.whyUs?.title || "Why Choose Our Tax & Accounting Experts"}
          </h2>
          {(d.whyUs?.desc || d.whyUs?.description) && (
            <p className="ca-section-subtext">{d.whyUs.desc || d.whyUs.description}</p>
          )}

          <ul className="ca-whyus__list">
            {whyFeatures.map((item, i) => (
              <li className="ca-whyus__item" key={i}>
                <span className="ca-whyus__item-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="ca-whyus__item-title">{item.title}</h4>
                  <p className="ca-whyus__item-text">{item.text || item.description || item.desc || ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── PROCESS — 4-column horizontal grid ───────────────── */}
      <div className="ca-section">
        <div className="ca-container">
          <span className="ca-section-label">How We Work</span>
          <h2 className="ca-section-heading">
            {d.process?.title || "Our Simple & Compliant Process"}
          </h2>
          {d.process?.desc && (
            <p className="ca-section-subtext">{d.process.desc}</p>
          )}

          <div className="ca-process__grid">
            {processSteps.map((step, i) => (
              <div className="ca-process-step" key={`${step.title}-${i}`}>
                <div className="ca-process-step__num">{String(i + 1).padStart(2, "0")}</div>
                <svg className="ca-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 18l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="ca-process-step__title">{step.title}</h3>
                <p className="ca-process-step__desc">{step.text || step.description || step.desc || ""}</p>
                {i < processSteps.length - 1 && (
                  <div className="ca-process-step__connector">
                    <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                      <path d="M1 8h30M25 2l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONSULTATION — amber left / dark form right ────────── */}
      <div id="consultation" className="ca-consult">
        <div className="ca-consult__left">
          <span className="ca-section-label">Get Expert Advice</span>
          <h2 className="ca-section-heading">
            Book a <em>Consultation</em>
          </h2>
          <p className="ca-section-subtext">
            Speak with a senior CA about your property transaction — no obligation, fully confidential.
          </p>

          <div className="ca-consult__trust">
            <div className="ca-consult__trust-item">
              <span className="ca-consult__trust-num">500+</span>
              <span className="ca-consult__trust-label">Clients</span>
            </div>
            <div className="ca-consult__trust-item">
              <span className="ca-consult__trust-num">₹2Cr+</span>
              <span className="ca-consult__trust-label">Tax Saved</span>
            </div>
            <div className="ca-consult__trust-item">
              <span className="ca-consult__trust-num">98%</span>
              <span className="ca-consult__trust-label">On-Time</span>
            </div>
          </div>
        </div>

        <div className="ca-consult__right">
          <ProfessionConsultationForm
            memberName="Chartered Accountant Team"
            expertise={Array.isArray(d?.services?.items) ? d.services.items : []}
            accountType=""
            accountId=""
          />
        </div>
      </div>

      {/* ── CALL TO ACTIONS ───────────────────────────────────── */}
      <CallToActions />

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </div>
  );
}

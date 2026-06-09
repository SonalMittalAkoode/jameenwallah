// frontend/src/app/(pages)/architect/page.js
// Swap DefaultHeader, MobileMenu, Footer, CallToActions, and Profession* imports
// to match your actual project paths.

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import CallToActions from "@/components/common/CallToActions";
import ProfessionHero from "@/components/profession/ProfessionHero";
import ProfessionServices from "@/components/profession/ProfessionServices";
import ProfessionWhyUs from "@/components/profession/ProfessionWhyUs";
import ProfessionProcess from "@/components/profession/ProfessionProcess";
import ProfessionConsultationForm from "@/components/profession/ProfessionConsultationForm";
import ServiceIcon from "@/components/profession/ServiceIcon";
import architectData, { architectTeam as staticArchitectTeam } from "@/data/architectData";
import { resolveImageSrc } from "@/utils/resolveImage";
import { getApiBaseUrl } from "@/api/apiBase";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import {
  getSafeSiteContent,
  mergeProfessionSiteContent,
} from "@/lib/professionSiteContent";


const API_BASE_URL = getApiBaseUrl("http://localhost:5001");

export const dynamic = "force-dynamic";
export const revalidate = 0;

const architectServiceIcons = [
  "fas fa-drafting-compass",
  "fas fa-couch",
  "fas fa-cubes",
  "fas fa-hard-hat",
  "fas fa-home",
  "fas fa-compass",
];

export async function generateMetadata() {
  const content = await getSafeSiteContent(
    getSiteContentByPageKeyFrontend,
    "architecture"
  );
  const d = mergeProfessionSiteContent(architectData, content);
  return { title: d.meta.title, description: d.meta.desc };
}

export default async function ArchitectPage() {
  const d = mergeProfessionSiteContent(
    architectData,
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "architecture")
  );
  const heroTitle = d.hero?.title || d.hero?.heading || "";
  const heroDesc = d.hero?.desc || d.hero?.description || "";
  const serviceItems = Array.isArray(d.services?.items) ? d.services.items : [];
  const whyFeatures = Array.isArray(d.whyUs?.features) ? d.whyUs.features : [];
  const processSteps = Array.isArray(d.process?.steps) ? d.process.steps : [];
  let dynamicTeam = staticArchitectTeam;

  try {
    const res = await fetch(`${API_BASE_URL}/frontend/api/architect`, {
      next: { revalidate: 60 },
    });
    const result = await res.json();
    if (
      result.status === "success" &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      dynamicTeam = result.data.map((item) => ({
        slug: item.slug || item._id,
        name: item.name || "Architect",
        role: item.metaTitle || "Senior Architect",
        exp: "Professional",
        img: resolveImageSrc(item.image),
        speciality: item.description
          ? item.description.length > 40
            ? item.description
                .substring(0, 40)
                .replace(/(<([^>]+)>)/gi, "") + "..."
            : item.description.replace(/(<([^>]+)>)/gi, "")
          : "Architecture & Design",
        rating: 5,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch architects:", error);
  }

  return (
    <div className="architect-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="arch-hero">
        {/* Left copy panel */}
        <div className="arch-hero__copy">
          <span className="arch-hero__eyebrow">Architecture &amp; Design</span>

          <h1 className="arch-hero__title">
            {heroTitle ? (
              <>
                {heroTitle.split(" ").slice(0, 2).join(" ")}{" "}
                <em>{heroTitle.split(" ").slice(2).join(" ")}</em>
              </>
            ) : (
              <>
                Visionary Architects,{" "}
                <em>Timeless&nbsp;Spaces</em>
              </>
            )}
          </h1>

          <p className="arch-hero__desc">
            {heroDesc ||
              "Expert architectural consultants transforming Gurgaon's finest properties with precision design, sustainable planning, and unmatched attention to detail."}
          </p>

          <div className="arch-hero__cta-row">
            <a href="#consultation" className="arch-btn-primary">
              {/* Inline SVG arrow */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Consultation
            </a>
            <a href="#services" className="arch-btn-ghost">
              Explore Services
            </a>
          </div>
        </div>

        {/* Right image panel */}
        <div className="arch-hero__image">
          {/* Replace src with your actual hero image */}
          <img
            src={"/images/architect/architect-hero.jpg"}
            alt="Modern architecture interior"
          />
        </div>

      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────── */}
      <div className="arch-marquee-strip">
        <div className="arch-marquee-inner">
          {[
            "Architectural Design",
            "Interior Excellence",
            "Structural Consulting",
            "3D Visualisation",
            "Renovation Planning",
            "Sustainable Design",
            "Architectural Design",
            "Interior Excellence",
            "Structural Consulting",
            "3D Visualisation",
            "Renovation Planning",
            "Sustainable Design",
          ].map((txt, i) => (
            <span className="arch-marquee-item" key={i}>
              {txt}
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICES ──────────────────────────────────────────────── */}
      <div id="services" className="arch-section arch-section--cream">
        <div className="arch-container">
          <div className="arch-services__intro">
            <div>
              <span className="arch-section-label">What We Offer</span>
              <h2 className="arch-section-heading">
                {d.services?.heading || "Architect & Design Services for Properties"}
              </h2>
            </div>
            <div className="arch-services__intro-action">
              <p className="arch-section-subtext">
                {d.services?.subheading || d.services?.description ||
                  "Comprehensive architectural solutions for residential and commercial properties across Gurgaon and the NCR region."}
              </p>
            </div>
          </div>

          <div className="arch-services__grid">
            {serviceItems.map((item, i) => (
              <div className="arch-service-card arch-fade-up" key={`${item.title}-${i}`}>
                <ServiceIcon
                  icon={item.icon}
                  index={i}
                  fallbackIcons={architectServiceIcons}
                  className="arch-service-card__icon"
                />
                <span className="arch-service-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="arch-service-card__title">{item.title}</h3>
                <p className="arch-service-card__desc">{item.text || item.description || item.desc || ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY US ────────────────────────────────────────────────── */}
      <div className="arch-whyus">
        {/* Left: image */}
        <div className="arch-whyus__image">
          <img
            src={d.whyUs?.image || "/images/arch-why-us.jpg"}
            alt="Architects collaborating on blueprints"
          />
          <div className="arch-whyus__image-overlay" />
        </div>

        {/* Right: content */}
        <div className="arch-whyus__content">
          <span className="arch-section-label">Why Choose Us</span>
          <h2 className="why-arch-section-heading">
            {d.whyUs?.title || "Modern Architecture & Interior Design Excellence"}
          </h2>
          {(d.whyUs?.desc || d.whyUs?.description) && (
            <p className="arch-section-subtext">{d.whyUs.desc || d.whyUs.description}</p>
          )}

          <ul className="arch-whyus__list">
            {whyFeatures.map((item, i) => (
              <li className="arch-whyus__item" key={i}>
                <span className="arch-whyus__item-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="arch-whyus__item-title">{item.title}</h4>
                  <p className="arch-whyus__item-text">{item.text || item.description || item.desc || ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── PROCESS ───────────────────────────────────────────────── */}
      <div className="arch-section">
        <div className="arch-container">
          <span className="arch-section-label">How We Work</span>
          <h2 className="arch-section-heading">
            {d.process?.title || "End-to-End Architecture & Interior Design Process"}
          </h2>
          {d.process?.desc && (
            <p className="arch-section-subtext">{d.process.desc}</p>
          )}

          <div className="arch-process__grid">
            {processSteps.map((step, i) => (
              <div className="arch-process-step" key={`${step.title}-${i}`}>
                <div className="arch-process-step__num">{String(i + 1).padStart(2, "0")}</div>
                <svg className="arch-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 18l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="arch-process-step__title">{step.title}</h3>
                <p className="arch-process-step__desc">{step.text || step.description || step.desc || ""}</p>
                {i < processSteps.length - 1 && (
                  <div className="arch-process-step__connector">
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

      {/* ── CONSULTATION FORM ─────────────────────────────────────── */}
      <div id="consultation" className="arch-consult">
        {/* Left: brand/trust panel */}
        <div className="arch-consult__left">
          <span className="arch-section-label">Get in Touch</span>
          <h2 className="arch-section-heading">
            Book a <em>Consultation</em>
          </h2>
          <p className="arch-section-subtext">
            Get expert architectural advice tailored to your specific property requirements in Gurgaon.
          </p>

          <div className="arch-consult__trust">
            <div className="arch-consult__trust-item">
              <span className="arch-consult__trust-num">340+</span>
              <span className="arch-consult__trust-label">Projects</span>
            </div>
            <div className="arch-consult__trust-item">
              <span className="arch-consult__trust-num">18yr</span>
              <span className="arch-consult__trust-label">Experience</span>
            </div>
            <div className="arch-consult__trust-item">
              <span className="arch-consult__trust-num">98%</span>
              <span className="arch-consult__trust-label">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="arch-consult__right">
          <ProfessionConsultationForm
            memberName="Architect Team"
            expertise={Array.isArray(d?.services?.items) ? d.services.items : []}
            accountType=""
            accountId=""
          />
        </div>
      </div>

      {/* ── CALL TO ACTION ────────────────────────────────────────── */}
      <div className="arch-cta-wrapper">
        <CallToActions />
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </div>
  );
}

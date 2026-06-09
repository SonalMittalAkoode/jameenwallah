// frontend/src/app/(pages)/financer/page.js
// Layout mirrors architect page.js exactly.
// Place financer-page.css in src/styles/ alongside architect-page.css

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import CallToActions from "@/components/common/CallToActions";
import ProfessionConsultationForm from "@/components/profession/ProfessionConsultationForm";
import ServiceIcon from "@/components/profession/ServiceIcon";
import financerData from "@/data/financerData";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import {
  getSafeSiteContent,
  mergeProfessionSiteContent,
} from "@/lib/professionSiteContent";
import {
  getPublicFinancers,
  mapFinancerToProfile,
} from "@/utils/financerProfile";

// Place financer-page.css in src/styles/
// import "@/styles/financer-page.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const financeServiceIcons = [
  "fas fa-hand-holding-usd",
  "fas fa-home",
  "fas fa-building",
  "fas fa-globe-asia",
  "fas fa-chart-line",
  "fas fa-shield-alt",
];

export async function generateMetadata() {
  const content = await getSafeSiteContent(getSiteContentByPageKeyFrontend, "finance");
  const d = mergeProfessionSiteContent(financerData, content);
  return { title: d.meta.title, description: d.meta.desc };
}

export default async function FinancerPage() {
  const d = mergeProfessionSiteContent(
    financerData,
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "finance")
  );
  const heroTitle = d.hero?.title || d.hero?.heading || "";
  const heroDesc = d.hero?.desc || d.hero?.description || "";
  const serviceItems = Array.isArray(d.services?.items) ? d.services.items : [];
  const whyFeatures = Array.isArray(d.whyUs?.features) ? d.whyUs.features : [];
  const processSteps = Array.isArray(d.process?.steps) ? d.process.steps : [];

  let dynamicTeam = [];
  try {
    const financers = await getPublicFinancers();
    dynamicTeam = financers
      .map((item) => mapFinancerToProfile(item))
      .filter((item) => item.slug);
  } catch (error) {
    console.error("Failed to fetch public financer listing", error);
  }

  return (
    <div className="fin-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO — split grid: copy left / image right ─────────── */}
      <div className="fin-hero">
        {/* Left copy panel */}
        <div className="fin-hero__copy">
          <span className="fin-hero__eyebrow">Financial Services for Real Estate</span>

          <h1 className="fin-hero__title">
            {heroTitle ? (
              <>
                {heroTitle.split(",")[0]}
                {heroTitle.includes(",") && (
                  <em> {heroTitle.split(",").slice(1).join(",").trim()}</em>
                )}
              </>
            ) : (
              <>
                Smart Property Financing,
                <em> Simplified</em>
              </>
            )}
          </h1>

          <p className="fin-hero__desc">
            {heroDesc ||
              "We offer financial services for real estate investments, providing fast approvals, competitive interest rates and dedicated expert support throughout your journey."}
          </p>

          <div className="fin-hero__cta-row">
            <a href="#consultation" className="fin-btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Consultation
            </a>
            <a href="#services" className="fin-btn-ghost">
              Explore Services
            </a>
          </div>
        </div>

        {/* Right image panel — swap src with your actual hero image */}
        <div className="fin-hero__image">
          <img
            src={d.hero?.image || "/images/financer/finance_hero.webp"}
            alt="Financial expert for real estate"
          />
        </div>

        
      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────── */}
      <div className="fin-marquee-strip">
        <div className="fin-marquee-inner">
          {[
            "Home Loans",
            "Loan Against Property",
            "Commercial Finance",
            "NRI Finance",
            "Investment Advisory",
            "Portfolio Management",
            "Debt Restructuring",
            "Tax Planning",
            "Home Loans",
            "Loan Against Property",
            "Commercial Finance",
            "NRI Finance",
            "Investment Advisory",
            "Portfolio Management",
            "Debt Restructuring",
            "Tax Planning",
          ].map((txt, i) => (
            <span className="fin-marquee-item" key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ── SERVICES — 3×2 card grid ──────────────────────────── */}
      <div id="services" className="fin-section fin-section--cream">
        <div className="fin-container">
          <div className="fin-services__intro">
            <div>
              <span className="fin-section-label">What We Offer</span>
              <h2 className="fin-section-heading">
                {d.services?.heading || "Comprehensive Financial Services for Real Estate"}
              </h2>
            </div>
            <div className="fin-services__intro-action">
              <p className="fin-section-subtext">
                {d.services?.subheading || d.services?.description ||
                  "Expert financial solutions designed specifically for property buyers, investors, NRIs, and real estate developers across Gurgaon and NCR."}
              </p>
            </div>
          </div>

          <div className="fin-services__grid">
            {serviceItems.map((item, i) => (
              <div className="fin-service-card fin-fade-up" key={`${item.title}-${i}`}>
                <ServiceIcon
                  icon={item.icon}
                  index={i}
                  fallbackIcons={financeServiceIcons}
                  className="fin-service-card__icon"
                />
                <span className="fin-service-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fin-service-card__title">{item.title}</h3>
                <p className="fin-service-card__desc">
                  {item.text || item.description || item.desc || ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY US — image left / dark panel right ────────────── */}
      <div className="fin-whyus">
        <div className="fin-whyus__image">
          <img
            src={d.whyUs?.image || "/images/financer-why-us.jpg"}
            alt="Finance expert reviewing property documents"
          />
          <div className="fin-whyus__image-overlay" />
        </div>

        <div className="fin-whyus__content">
          <span className="fin-section-label">Why Choose Us</span>
          <h2 className="why-fin-section-heading">
            {d.whyUs?.title || "Why Choose JameenWallah for Financial Services?"}
          </h2>

          <ul className="fin-whyus__list">
            {whyFeatures.map((item, i) => (
              <li className="fin-whyus__item" key={i}>
                <span className="fin-whyus__item-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="fin-whyus__item-title">{item.title}</h4>
                  <p className="fin-whyus__item-text">{item.text || item.description || item.desc || ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── PROCESS — 4-column horizontal grid ───────────────── */}
      <div className="fin-section">
        <div className="fin-container">
          <span className="fin-section-label">How We Work</span>
          <h2 className="fin-section-heading">
            {d.process?.title || "Your Financial Journey Made Simple"}
          </h2>
          {d.process?.desc && (
            <p className="fin-section-subtext">{d.process.desc}</p>
          )}

          <div className="fin-process__grid">
            {processSteps.map((step, i) => (
              <div className="fin-process-step" key={`${step.title}-${i}`}>
                <div className="fin-process-step__num">{String(i + 1).padStart(2, "0")}</div>
                <svg className="fin-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M13 18l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="fin-process-step__title">{step.title}</h3>
                <p className="fin-process-step__desc">{step.text || step.description || step.desc || ""}</p>
                {i < processSteps.length - 1 && (
                  <div className="fin-process-step__connector">
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
      <div id="consultation" className="fin-consult">
        {/* Left: amber brand panel */}
        <div className="fin-consult__left">
          <span className="fin-section-label">Talk to a Finance Expert</span>
          <h2 className="fin-section-heading">
            Book a <em>Consultation</em>
          </h2>
          <p className="fin-section-subtext">
            Get personalised loan, investment, and financial planning advice tailored to your exact property requirement.
          </p>

          <div className="fin-consult__trust">
            <div className="fin-consult__trust-item">
              <span className="fin-consult__trust-num">₹500Cr+</span>
              <span className="fin-consult__trust-label">Facilitated</span>
            </div>
            <div className="fin-consult__trust-item">
              <span className="fin-consult__trust-num">48hr</span>
              <span className="fin-consult__trust-label">Approval</span>
            </div>
            <div className="fin-consult__trust-item">
              <span className="fin-consult__trust-num">20+</span>
              <span className="fin-consult__trust-label">Lenders</span>
            </div>
          </div>
        </div>

        {/* Right: dark form panel */}
        <div className="fin-consult__right">
          <ProfessionConsultationForm
            memberName="Financer Team"
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

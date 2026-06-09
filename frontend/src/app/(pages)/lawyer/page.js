// frontend/src/app/(pages)/lawyer/page.js
// Layout mirrors architect page.js exactly.
// Place lawyer-page.css in src/styles/ alongside architect-page.css

import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import CallToActions from "@/components/common/CallToActions";
import ProfessionConsultationForm from "@/components/profession/ProfessionConsultationForm";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import { mergeSiteContent } from "@/lib/siteContentDefaults";
import { getSafeSiteContent } from "@/lib/professionSiteContent";

// Place lawyer-page.css in src/styles/
// import "@/styles/lawyer-page.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const content = mergeSiteContent(
    "legal",
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "legal")
  );
  return { title: content.metaTitle, description: content.metaDescription };
}

const LawyerPage = async () => {
  const content = mergeSiteContent(
    "legal",
    await getSafeSiteContent(getSiteContentByPageKeyFrontend, "legal")
  );

  const hero     = content.sections?.hero     || {};
  const services = content.sections?.services  || {};
  const whyUs    = content.sections?.whyUs     || {};
  const consult  = content.sections?.consultation || {};

  // Fallback descriptions indexed by position — used when CMS item has no description field
  const fallbackDescs = [
    "Expert representation in property boundary disputes, title conflicts, and encroachment matters before courts and tribunals.",
    "Thorough title searches, encumbrance checks, and legal opinion reports to safeguard your property purchase.",
    "Watertight sale agreements, lease deeds, MOUs, and builder-buyer agreements reviewed and drafted by legal experts.",
    "Pursuing delayed possession, compensation, and refund claims against builders through RERA and consumer forums.",
    "Complete RERA registration, compliance documentation, and legal advisory for developers and home buyers.",
    "Proactive risk assessment, compliance audits, and ongoing legal advisory for real estate investors and corporates.",
  ];

  const fallbackItems = [
    { title: "Property & Dispute Resolution",      desc: fallbackDescs[0] },
    { title: "Title Verification & Due Diligence",  desc: fallbackDescs[1] },
    { title: "Agreement Drafting & Review",         desc: fallbackDescs[2] },
    { title: "Builder Litigation & Legal Action",   desc: fallbackDescs[3] },
    { title: "RERA & Compliance Support",           desc: fallbackDescs[4] },
    { title: "Legal Risk & Compliance Management",  desc: fallbackDescs[5] },
  ];

  // Merge CMS items with fallback descriptions:
  // CMS items may have a title but no description field — we patch each item
  // by trying every possible field name the CMS might use, then falling back by index.
  const rawItems = Array.isArray(services.items) && services.items.length
    ? services.items
    : fallbackItems;

  const serviceItems = rawItems.map((item, i) => ({
    ...item,
    // Try every field name the CMS might store description under
    _resolvedDesc:
      item.desc ||
      item.description ||
      item.body ||
      item.content ||
      item.text ||
      item.shortDescription ||
      item.short_description ||
      item.subtitle ||
      fallbackDescs[i] ||   // guaranteed fallback by position
      "",
  }));

  const whyItems = Array.isArray(whyUs.items) && whyUs.items.length
    ? whyUs.items
    : [
        {
          title: "Proven Legal Expertise",
          text: "Over two decades of real estate legal practice with a track record across hundreds of disputes, deals, and transactions.",
        },
        {
          title: "Document-Transparent Approach",
          text: "Every legal step documented, every fee disclosed. You know exactly where your case stands at all times.",
        },
        {
          title: "Efficient Real-World Resolution",
          text: "We focus on pragmatic solutions — negotiation, mediation, and ADR before litigation to save you time and cost.",
        },
        {
          title: "End-to-End Legal Support",
          text: "From due diligence to deed registration, dispute filing to settlement — one team for your entire legal journey.",
        },
      ];

  // Inline SVGs for service cards
  const serviceIcons = [
    // Gavel / dispute
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path
    d="M4 6h16v10H4V6Z"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M2 18h20"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
  />
</svg>,
    // Magnify / search
    <svg key="s2" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.6"/><path d="M25.5 25.5l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    // Document / pen
    <svg key="s3" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M11 8h14l6 6v18H11V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M25 8v6h6M15 19h10M15 24h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
    // Building / builder
    <svg key="s4" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 32V18L20 8l12 10v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 32v-8h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
    // Shield / RERA
    <svg key="s5" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 6l12 5v11c0 7-5 12-12 14-7-2-12-7-12-14V11l12-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M15 20l4 4 7-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    // Balance / risk
    <svg key="s6" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 8v24M8 32h24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10 20l5-8 5 8H10zM20 20l5-8 5 8H20z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  ];

  return (
    <div className="law-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO — split grid: copy left / image right ─────────── */}
      <div className="law-hero">
        {/* Left copy panel */}
        <div className="law-hero__copy">
          <span className="law-hero__eyebrow">Legal Services for Real Estate</span>

          <h1 className="law-hero__title">
            {hero.title ? (
              <>
                {hero.title.split(",")[0]},
                <em> {hero.title.split(",").slice(1).join(",").trim()}</em>
              </>
            ) : (
              <>
                Real Estate,
                <em> Legally Secured</em>
              </>
            )}
          </h1>

          <p className="law-hero__desc">
            {hero.description ||
              "Navigating real estate legal complexities can be challenging. JameenWallah's legal team protects your property interests, resolves disputes, and ensures every transaction stands on solid ground."}
          </p>

          <div className="law-hero__cta-row">
            <a href="#consultation" className="law-btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Consultation
            </a>
            <a href="#services" className="law-btn-ghost">
              Explore Services
            </a>
          </div>
        </div>

        {/* Right image panel — swap src with your actual hero image */}
        <div className="law-hero__image">
          <img
            src={hero.image || "/images/lawyer/lawyer_hero.webp"}
            alt="Real estate legal expert"
          />
        </div>

        
      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────── */}
      <div className="law-marquee-strip">
        <div className="law-marquee-inner">
          {[
            "Property Disputes",
            "Title Verification",
            "Agreement Drafting",
            "Builder Litigation",
            "RERA Compliance",
            "Legal Due Diligence",
            "Lease Agreements",
            "NRI Legal Advisory",
            "Property Disputes",
            "Title Verification",
            "Agreement Drafting",
            "Builder Litigation",
            "RERA Compliance",
            "Legal Due Diligence",
            "Lease Agreements",
            "NRI Legal Advisory",
          ].map((txt, i) => (
            <span className="law-marquee-item" key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ── SERVICES — 3×2 card grid ──────────────────────────── */}
      <section id="services" className="law-section law-section--cream">
        <div className="law-container">
          <div className="law-services__intro">
            <div>
              <span className="law-section-label">What We Offer</span>
              <h2 className="law-section-heading">
                {services.title || "Legal Services We Provide"}
              </h2>
            </div>
            <div className="law-services__intro-action">
              <p className="law-section-subtext">
                {services.description ||
                  "Comprehensive legal services for every stage of real estate ownership — from buying and selling to disputes and compliance."}
              </p>
            </div>
          </div>

          <div className="law-services__grid">
            {serviceItems.map((item, i) => (
              <div className="law-service-card law-fade-up" key={i}>
                <div className="law-service-card__icon">
                  {serviceIcons[i] || serviceIcons[0]}
                </div>
                <span className="law-service-card__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="law-service-card__title">
                  {item.title}
                </h3>
                <p className="law-service-card__desc">
                  {item._resolvedDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US — image left / dark panel right ────────────── */}
      <div className="law-whyus">
        <div className="law-whyus__image">
          <img
            src={whyUs.image || "/images/lawyer/lawyer-services.jpg"}
            alt="Legal team at work"
          />
          <div className="law-whyus__image-overlay" />
        </div>

        <div className="law-whyus__content">
          <span className="law-section-label">Why Choose Us</span>
          <h2 className="why-law-section-heading">
            {whyUs.title || "Built on Trust, Driven by Legal Expertise"}
          </h2>
          {whyUs.description && (
            <p className="law-section-subtext">{whyUs.description}</p>
          )}

          <ul className="law-whyus__list">
            {whyItems.map((item, i) => (
              <li className="law-whyus__item" key={i}>
                <span className="law-whyus__item-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="law-whyus__item-title">{item.title}</h4>
                  <p className="law-whyus__item-text">{item.text || item.description || ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── PROCESS ───────────────────────────────────────────── */}
      <div className="law-section">
        <div className="law-container">
          <span className="law-section-label">How We Work</span>
          <h2 className="law-section-heading">
            Your Legal Journey <em>Made Simple</em>
          </h2>

          <div className="law-process__grid">
            {/* Step 1 */}
            <div className="law-process-step">
              <div className="law-process-step__num">01</div>
              <svg className="law-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M10 8h16v20H10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 14h8M14 19h8M14 24h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h3 className="law-process-step__title">Case Intake &amp; Document Review</h3>
              <p className="law-process-step__desc">
                We review all property documents, title deeds, and prior agreements to build a complete legal picture.
              </p>
              <div className="law-process-step__connector">
                <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                  <path d="M1 8h30M25 2l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="law-process-step">
              <div className="law-process-step__num">02</div>
              <svg className="law-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <circle cx="18" cy="15" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 28c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h3 className="law-process-step__title">Legal Strategy &amp; Consultation</h3>
              <p className="law-process-step__desc">
                Our senior lawyers advise on the most cost-effective and time-efficient legal path for your situation.
              </p>
              <div className="law-process-step__connector">
                <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                  <path d="M1 8h30M25 2l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="law-process-step">
              <div className="law-process-step__num">03</div>
              <svg className="law-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M8 28l7-9 6 5 5-7 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26 9l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="law-process-step__title">Action &amp; Representation</h3>
              <p className="law-process-step__desc">
                We draft, file, negotiate, or litigate — providing complete representation at every legal forum.
              </p>
              <div className="law-process-step__connector">
                <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                  <path d="M1 8h30M25 2l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 4 */}
            <div className="law-process-step">
              <div className="law-process-step__num">04</div>
              <svg className="law-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M10 18l5 5 11-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 29h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7h12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <h3 className="law-process-step__title">Resolution &amp; Follow-Up</h3>
              <p className="law-process-step__desc">
                We manage closure, final documentation, and post-resolution guidance so your property matter is properly recorded.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONSULTATION — amber left / dark form right ────────── */}
      <div id="consultation" className="law-consult">
        {/* Left: amber brand panel */}
        <div className="law-consult__left">
          <span className="law-section-label">Book Appointment</span>
          <h2 className="law-section-heading">
            {consult.title || "Book a Legal Consultation"}
          </h2>
          <p className="law-section-subtext">
            {consult.description ||
              "Tell us about your property-related legal requirement and our expert team will connect with you shortly."}
          </p>

          <div className="law-consult__trust">
            <div className="law-consult__trust-item">
              <span className="law-consult__trust-num">1000+</span>
              <span className="law-consult__trust-label">Cases</span>
            </div>
            <div className="law-consult__trust-item">
              <span className="law-consult__trust-num">20yr</span>
              <span className="law-consult__trust-label">Experience</span>
            </div>
            <div className="law-consult__trust-item">
              <span className="law-consult__trust-num">100%</span>
              <span className="law-consult__trust-label">Confidential</span>
            </div>
          </div>
        </div>

        {/* Right: dark form panel */}
        <div className="law-consult__right">
          <ProfessionConsultationForm
            memberName="Legal Team"
            expertise={[
              "Property Dispute Resolution",
              "Title Verification & Litigation",
              "Regulatory Compliance",
              "RERA & Documentation",
            ]}
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
};

export default LawyerPage;

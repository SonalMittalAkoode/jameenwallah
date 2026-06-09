"use client";
// frontend/src/app/(pages)/property-management-services/page.js
// Layout mirrors architect page.js exactly.
// Place pms-page.css in src/styles/ alongside architect-page.css and ca-page.css

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import CallToActions from "@/components/common/CallToActions";
import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import { getAllPropertymanagementsFrontend } from "@/api/propertymanagement";
import { getSiteContentByPageKeyFrontend } from "@/api/siteContent";
import { mergeSiteContent } from "@/lib/siteContentDefaults";
import { mapPropertyManagementToServiceCard } from "@/utils/pmsContent";

const SHOW_PMS_LISTING_SERVICE_ICON = false;

const whyUsDefaults = [
  {
    title: "Trusted Expertise",
    text: "Deep real estate knowledge and a proven track record — we manage hundreds of properties across Gurgaon and Delhi NCR.",
  },
  {
    title: "AI-Powered Efficiency",
    text: "Our advanced systems enable real-time monitoring, smart alerts, and data-driven decision-making 24/7.",
  },
  {
    title: "Full Transparency",
    text: "Regular photo reports, detailed statements, and instant notifications — you always know what's happening.",
  },
  {
    title: "Peace of Mind",
    text: "Whether you are next door or overseas, your property is in expert hands while you focus on what matters most.",
  },
];

const serviceFallbackImages = [
  "/images/background/pms_hero.png",
  "/images/home/home-5-1.jpg",
  "/images/home/home-5-2.jpg",
  "/images/home/home-5-3.jpg",
  "/images/home/home-5-4.jpg",
  "/images/background/pms_hero.png",
];

const slugifyService = (value) =>
  String(value || "service")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapContentServiceToCard = (item, index) => ({
  title: item.title,
  short: item.text,
  slug: slugifyService(item.title),
  featuredSrc: item.image || serviceFallbackImages[index % serviceFallbackImages.length],
});

// Inline SVGs for the why-us cards (replaces font-awesome icons)
const whySvgs = [
  // Shield
  <svg key="shield" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 5l10 4v9c0 6-4.5 10.5-10 12-5.5-1.5-10-6-10-12V9l10-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 18l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // AI/robot
  <svg key="ai" viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect x="8" y="12" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="13" cy="20" r="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2"/><circle cx="23" cy="20" r="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2"/><path d="M18 8v4M13 28v2M23 28v2M8 20H6M28 20h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  // Chart/bar
  <svg key="chart" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M6 28V14M13 28V10M20 28V18M27 28V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 28h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  // Smile/peace
  <svg key="peace" viewBox="0 0 36 36" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.5"/><path d="M13 21s1.5 3 5 3 5-3 5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14" cy="16" r="1.2" fill="currentColor"/><circle cx="22" cy="16" r="1.2" fill="currentColor"/></svg>,
];

export default function PropertyManagementServicesPage() {
  const [services, setServices] = useState([]);
  const [content, setContent] = useState(() => mergeSiteContent("property-management", null));
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeService, setActiveService] = useState(0);

  const safeIndex =
    services.length > 0
      ? Math.min(Math.max(activeService, 0), services.length - 1)
      : 0;
  const tabRefs = useRef([]);

  useEffect(() => {
    if (services.length === 0) return;
    if (activeService >= services.length) setActiveService(0);
  }, [services.length, activeService]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const res = await getAllPropertymanagementsFrontend();
        const rows = Array.isArray(res?.data) ? res.data : [];
        const activeRows = rows
          .filter((r) => r && r.status !== "inactive")
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
          );
        const mapped = activeRows.map(mapPropertyManagementToServiceCard).filter((m) => m && m.slug);
        if (!cancelled) { setServices(mapped); setActiveService(0); }
      } catch (e) {
        if (!cancelled) {
          setServices([]);
          setLoadError(typeof e === "object" && e?.message ? String(e.message) : "Could not load services.");
        }
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getSiteContentByPageKeyFrontend("property-management");
        if (!cancelled) setContent(mergeSiteContent("property-management", response?.data));
      } catch (error) {
        console.error("Failed to fetch property management site content", error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = tabRefs.current[safeIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [safeIndex]);

  const pageSections = content.sections || {};
  const hero = pageSections.hero || {};
  const servicesSection = pageSections.services || {};
  const whySection = pageSections.whyUs || {};
  const processSection = pageSections.process || {};
  const ctaSection = pageSections.cta || {};
  const whyItems = Array.isArray(whySection.items) && whySection.items.length
    ? whySection.items
    : whyUsDefaults;
  const contentServices =
    Array.isArray(servicesSection.items) && servicesSection.items.length
      ? servicesSection.items
          .filter((item) => item?.title && item?.text)
          .map(mapContentServiceToCard)
      : [];
  const displayServices = services.length ? services : contentServices;
  const displaySafeIndex =
    displayServices.length > 0
      ? Math.min(Math.max(activeService, 0), displayServices.length - 1)
      : 0;
  const displayActive = displayServices.length ? displayServices[displaySafeIndex] : null;
  const processSteps = Array.isArray(processSection.steps)
    ? processSection.steps
    : [];

  return (
    <div className="pms-page">
      <DefaultHeader />
      <MobileMenu />

      {/* ── HERO — split grid: copy left / image right ─────────── */}
      <div className="pms-hero">
        {/* Left copy panel */}
        <div className="pms-hero__copy">
          <span className="pms-hero__eyebrow">JameenWallah Property Management</span>

          <h1 className="pms-hero__title">
            {hero.title ? (
              (() => {
                const words = hero.title.split(" ");
                const half = Math.ceil(words.length / 2);
                return (
                  <>
                    {words.slice(0, half).join(" ")}
                    {" "}<em>{words.slice(half).join(" ")}</em>
                  </>
                );
              })()
            ) : (
              <>
                Effortless Property Care for{" "}
                <em>Maximum Peace of Mind</em>
              </>
            )}
          </h1>

          <p className="pms-hero__desc">
            {hero.description ||
              "Owning a property is a significant investment — managing it shouldn't feel like a burden. We help owners, NRIs and investors maintain, monitor and optimise properties for long-term value."}
          </p>

          <div className="pms-hero__cta-row">
            <Link href="#pms-services" className="pms-btn-primary">
              {/* Arrow SVG */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explore Services
            </Link>
            <Link href="/contact" className="pms-btn-ghost">
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Right image panel — swap src with your actual hero image */}
        <div className="pms-hero__image">
          <img
            src={hero.image || "/images/background/pms_hero.png"}
            alt="Professional property management"
          />
        </div>

        
      </div>

      {/* ── MARQUEE STRIP ─────────────────────────────────────── */}
      <div className="pms-marquee-strip">
        <div className="pms-marquee-inner">
          {[
            "Tenant Management",
            "Rent Collection",
            "Property Inspections",
            "Legal Compliance",
            "Maintenance Oversight",
            "NRI Services",
            "Lease Management",
            "Vacancy Management",
            "Tenant Management",
            "Rent Collection",
            "Property Inspections",
            "Legal Compliance",
            "Maintenance Oversight",
            "NRI Services",
            "Lease Management",
            "Vacancy Management",
          ].map((txt, i) => (
            <span className="pms-marquee-item" key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ── SERVICES — tab nav + detail panel ─────────────────── */}
      <div id="pms-services" className="pms-section pms-section--cream">
        <div className="pms-container">

          {/* Intro header */}
          <div className="pms-services__intro">
            <div>
              <span className="pms-section-label">What We Offer</span>
              <h2 className="pms-section-heading">
                Our Property Management <em>Services</em>
              </h2>
            </div>
            <div className="pms-services__intro-action">
              <p className="pms-section-subtext">
                {servicesSection.description ||
                  "Comprehensive, end-to-end property care — from keys to compliance — so your investment grows while you stay stress-free."}
              </p>
            </div>
          </div>

          {/* Loading / error states */}
          {loadingServices && (
            <div className="pms-svc-detail">
              <div className="pms-services__loading">
                <p className="pms-services__loading-text">Loading services…</p>
              </div>
            </div>
          )}

          {!loadingServices && loadError && (
            <p style={{ color: "var(--arch-amber)", fontFamily: "var(--font-body)", fontSize: 14 }}>
              {loadError}
            </p>
          )}

          {/* Tab navigation */}
          {!loadingServices && displayServices.length > 0 && (
            <div className="pms-tab-nav">
              {displayServices.map((s, i) => (
                <button
                  type="button"
                  key={s.slug || s._id || i}
                  ref={(el) => (tabRefs.current[i] = el)}
                  onClick={() => setActiveService(i)}
                  className={`pms-tab-btn${i === displaySafeIndex ? " pms-tab-btn--active" : ""}`}
                >
                  {/* Generic building icon per tab */}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="6" width="12" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Active service detail */}
          {!loadingServices && displayActive && (
            <div className="pms-svc-detail" key={displayActive.slug}>
              {/* Left: text */}
              <div className="pms-svc-detail__text">
                <div className="pms-svc-detail__icon-wrap">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M8 40V20L24 8l16 12v20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 40V28h14v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="pms-svc-detail__title">{displayActive.title}</h3>
                <p className="pms-svc-detail__desc">{displayActive.short}</p>
                <Link href="/contact" className="pms-svc-detail__cta">
                  View Details
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>

              {/* Right: image */}
              <div className="pms-svc-detail__image">
                <Image
                  src={displayActive.featuredSrc}
                  alt={displayActive.title}
                  fill
                  sizes="(max-width: 991px) 100vw, 58vw"
                  style={{ objectFit: "cover" }}
                  priority={displaySafeIndex === 0}
                />
              </div>
            </div>
          )}

          {!loadingServices && !loadError && displayServices.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--arch-muted)", fontFamily: "var(--font-body)", padding: "40px 0" }}>
              No services available at the moment.
            </p>
          )}
        </div>
      </div>

      {/* ── WHY US — image left / dark panel right ────────────── */}
      <div className="pms-whyus">
        {/* Left: image */}
        <div className="pms-whyus__image">
          <img
            src={whySection.image || "/images/background/pms_hero.png"}
            alt="Property management team at work"
          />
          <div className="pms-whyus__image-overlay" />
        </div>

        {/* Right: dark content panel */}
        <div className="pms-whyus__content">
          <span className="pms-section-label">
            {whySection.kicker || "Why JameenWallah"}
          </span>
          <h2 className="why-pms-section-heading">
            {whySection.title ? (
              (() => {
                const words = (whySection.title).split(" ");
                const half = Math.ceil(words.length / 2);
                return (
                  <>
                    {words.slice(0, half).join(" ")}{" "}
                    <em>{words.slice(half).join(" ")}</em>
                  </>
                );
              })()
            ) : (
              <>Your Property Deserves <em>the Best Care</em></>
            )}
          </h2>

          <p className="pms-section-subtext">
            {whySection.description ||
              "We combine deep local expertise with AI-powered monitoring to give you complete confidence in how your property is managed."}
          </p>

          {/* 2×2 cards grid */}
          <div className="pms-whyus__grid">
            {whyItems.slice(0, 4).map((w, i) => (
              <div className="pms-why-card pms-fade-up" key={i}>
                <div className="pms-why-card__icon">
                  {whySvgs[i]}
                </div>
                <h5 className="pms-why-card__title">{w.title}</h5>
                <p className="pms-why-card__text">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROCESS — 3-step horizontal grid ─────────────────── */}
      <div className="pms-section">
        <div className="pms-container">
          <span className="pms-section-label">How We Work</span>
          <h2 className="pms-section-heading">
            {processSection.title || "Our Property Management Process"}
          </h2>
          <p className="pms-section-subtext" style={{ maxWidth: 760 }}>
            {processSection.desc ||
              processSection.description ||
              "A simple, transparent workflow to onboard, protect, and manage your property with confidence."}
          </p>

          <div className="arch-process__grid mt50">
            {processSteps.map((step, i) => (
              <div className="arch-process-step" key={`${step.title}-${i}`}>
                <div className="arch-process-step__num">{String(i + 1).padStart(2, "0")}</div>
                <svg className="arch-process-step__icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <path d="M8 28h20M10 28V12h16v16M14 12V8h8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 18h8M14 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 className="arch-process-step__title">{step.title}</h3>
                <p className="arch-process-step__desc">{step.text || step.description || step.desc || ""}</p>
                {i < processSteps.length - 1 && (
                  <div className="arch-process-step__connector">
                    <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                      <path d="M1 8h30M25 2l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA — amber left / dark right ─────────────────────── */}
      <div className="pms-cta">
        {/* Left: amber panel */}
        <div className="pms-cta__left">
          <span className="pms-section-label">Ready to Start?</span>
          <h2 className="pms-section-heading">
            {ctaSection.title ? (
              <em>{ctaSection.title}</em>
            ) : (
              <>Ready to Hand Over <em>the Hassle?</em></>
            )}
          </h2>
          <p className="pms-section-subtext">
            {ctaSection.description ||
              "Let us manage your property while you enjoy the returns. Expert care, total transparency, zero stress."}
          </p>
        </div>

        {/* Right: dark panel with CTA + bullet points */}
        <div className="pms-cta__right">
          <Link href="/contact" className="pms-btn-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {ctaSection.button || "Get in Touch"}
          </Link>

          <ul className="pms-cta__subpoints">
            {[
              "Free property assessment",
              "No lock-in contracts",
              "NRI-friendly remote onboarding",
              "Dedicated property manager assigned",
            ].map((pt, i) => (
              <li key={i}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {pt}
              </li>
            ))}
          </ul>
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

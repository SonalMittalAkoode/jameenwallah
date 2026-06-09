import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DefaultHeader from "@/components/common/DefaultHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/home/home-v5/footer";
import { resolveImageSrc } from "@/utils/resolveImage";
import { getPmsServiceBySlug } from "@/data/pmsServices";
import {
  stripHtml,
  extractListItemsFromHtml,
  buildDetailOverviewHtml,
} from "@/utils/pmsContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
/** Static breadcrumb hero — same asset as the original theme default (not admin uploads). */
const PMS_BREADCRUMB_IMAGE = "/images/financer/financer-services.jpg";

const hashString = (value = "") =>
  Array.from(value).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0
  );

/** Shown only when the admin has not entered a body `description`. */
const buildFallbackParagraphs = (item, template) =>
  [
    template?.short,
    `${item?.name || template?.title || "This service"} is designed for owners who want clearer coordination, better follow-through, and less day-to-day stress while their property is being managed.`,
    "Our team keeps owners informed, handles on-ground follow-up, and focuses on practical delivery so the property stays protected, usable, and easier to operate.",
  ].filter(Boolean);

const getPropertyManagementBySlug = async (slug) => {
  const apiKey =
    process.env.NEXT_PUBLIC_END_API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";
  const response = await fetch(
    `${API_BASE_URL}/frontend/api/propertymanagement/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 60 },
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch property management profile: ${response.status}`);
  }

  const result = await response.json();
  const item = result?.data;

  if (!item || item?.status === "inactive") {
    throw new Error("Property management profile not found");
  }

  return item;
};

const mapPageData = (item, template) => {
  const seed = hashString(item?.slug || item?._id || item?.name || template?.slug || "pms");
  const detailOverviewHtml = buildDetailOverviewHtml(item?.description || "");
  const paragraphs = detailOverviewHtml ? [] : buildFallbackParagraphs(item, template);

  const pointsFromAdmin = extractListItemsFromHtml(item?.description || "");
  const points =
    pointsFromAdmin.length > 0
      ? pointsFromAdmin
      : template?.points?.length
        ? template.points
        : [];

  return {
    title: item?.name || template?.title || "Property Management Service",
    slug: item?.slug || template?.slug,
    summary:
      (item?.shortDescription && stripHtml(item.shortDescription)) ||
      template?.short ||
      stripHtml(item?.description || ""),
    role: item?.metaTitle || "Property Management Service",
    image: resolveImageSrc(
      item?.featuredImage || item?.image,
      "/images/financer/financer-services.jpg"
    ),
    phone: item?.phoneNumber || "+91 00000 00000",
    email: item?.email || "contact@jameenwallah.com",
    detailOverviewHtml,
    paragraphs,
    points,
    fitFor: template?.fitFor || [],
    process: template?.process || [],
    icon: template?.icon || "fas fa-building",
    quickFacts: [
      { label: "Service Type", value: "Owner Support" },
      { label: "Delivery Mode", value: "On-site + Remote" },
      { label: "Reporting", value: "Structured Updates" },
      { label: "Coordination", value: `${3 + (seed % 3)}-step oversight` },
    ],
  };
};

export async function generateMetadata({ params }) {
  try {
    const item = await getPropertyManagementBySlug(params.slug);
    const template = getPmsServiceBySlug(params.slug);
    const page = mapPageData(item, template);

    return {
      title:
        item?.metaTitle ||
        `${page.title} | JameenWallah Property Management Services`,
      description:
        item?.metaDescription ||
        `${page.summary} Connect with JameenWallah for property management support.`,
    };
  } catch (error) {
    return {
      title: "Property Management Services | JameenWallah",
    };
  }
}

export default async function PropertyManagementDetailPage({ params }) {
  let item;

  try {
    item = await getPropertyManagementBySlug(params.slug);
  } catch (error) {
    console.error("Failed to fetch property management details:", error);
    notFound();
  }

  const template = getPmsServiceBySlug(params.slug) || null;

  const page = mapPageData(item, template);

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section
        className="breadcumb-section2 p-0"
        style={{ backgroundImage: `url(${PMS_BREADCRUMB_IMAGE})` }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title">{page.title}</h1>
                <div className="breadcumb-list">
                  <Link href="/">Home </Link>
                  <Link href="/property-management-services">Property Management Services</Link>
                  <span className="title"> {'>'} {page.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Stats Bar ── */}
      <div className="pmsd-stats-bar">
        <div className="container">
          <div className="pmsd-stats-bar__inner">
            {page.quickFacts.map((fact, i) => (
              <div key={fact.label} className="pmsd-stats-bar__item">
                <span className="pmsd-stats-bar__val">{fact.value}</span>
                <span className="pmsd-stats-bar__lbl">{fact.label}</span>
                {i < page.quickFacts.length - 1 && <div className="pmsd-stats-bar__sep" />}
              </div>
            ))}
          </div>
        </div>
      </div>


      <section className="pmsd-main pt70 pb80 pb60-md">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-start">
            <div className="col-lg-8">

              {/* ── Profile / featured image (replaces Service Overview text block) ── */}
              <div
                className="pmsd-overview-card pmsd-overview-card--photo"
                data-aos="fade-up"
              >
                <div className="pmsd-overview-card__accent" aria-hidden="true" />
                <div className="pmsd-overview-card__image-frame">
                  <Image
                    src={page.image}
                    alt={page.title}
                    fill
                    sizes="(max-width: 991px) 100vw, 66vw"
                    className="pmsd-overview-card__image"
                    priority
                  />
                </div>
              </div>

              {/* ── Detailed Overview (admin `description`, or template fallback) ── */}
              {(page.detailOverviewHtml || page.paragraphs.length > 0) && (
                <div className="pmsd-content-card pmsd-prose-card" data-aos="fade-up" data-aos-delay="60">
                  <div className="pmsd-card-head">
                    <div className="pmsd-card-head__left">
                      <span className="pmsd-card-head__dot" />
                      <h3>Detailed Overview</h3>
                    </div>
                  </div>
                  <div className="pmsd-prose">
                    {page.detailOverviewHtml ? (
                      <div
                        className="pmsd-prose__html"
                        dangerouslySetInnerHTML={{ __html: page.detailOverviewHtml }}
                      />
                    ) : (
                      page.paragraphs.map((paragraph, i) => (
                        <p key={i} className={i === 0 ? "pmsd-prose__lead" : ""}>{paragraph}</p>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── What This Service Includes + Best Suited For ── */}
              <div className="row g-4 mb40" data-aos="fade-up" data-aos-delay="90">
                {page.points.length > 0 && (
                  <div className="col-md-7">
                    <div className="pmsd-content-card h-100">
                      <div className="pmsd-card-head">
                        <div className="pmsd-card-head__left">
                          <span className="pmsd-card-head__dot" />
                          <h3>What This Service Includes</h3>
                        </div>
                      </div>
                      <ul className="pmsd-feature-list">
                        {page.points.map((point, i) => (
                          <li key={i} className="pmsd-feature-list__item">
                            <span className="pmsd-feature-list__icon"><i className="fas fa-check" /></span>
                            <span className="pmsd-feature-list__text">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {page.fitFor.length > 0 && (
                  <div className="col-md-5">
                    <div className="pmsd-content-card h-100">
                      <div className="pmsd-card-head">
                        <div className="pmsd-card-head__left">
                          <span className="pmsd-card-head__dot" />
                          <h3>Best Suited For</h3>
                        </div>
                      </div>
                      <div className="pmsd-persona-stack">
                        {page.fitFor.map((persona, i) => (
                          <div key={i} className="pmsd-persona-card">
                            <span className="pmsd-persona-card__icon">
                              <i className="fas fa-user-check" />
                            </span>
                            <span className="pmsd-persona-card__text">{persona}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── How We Handle It – Visual Timeline ── */}
              {page.process.length > 0 && (
                <div className="pmsd-content-card mb40" data-aos="fade-up" data-aos-delay="120">
                  <div className="pmsd-card-head">
                    <div className="pmsd-card-head__left">
                      <span className="pmsd-card-head__dot" />
                      <h3>How We Handle It</h3>
                    </div>
                  </div>
                  <div className="pmsd-timeline">
                    {page.process.map((step, index) => (
                      <div key={step.title} className="pmsd-timeline__step">
                        <div className="pmsd-timeline__track">
                          <div className="pmsd-timeline__circle">{String(index + 1).padStart(2, "0")}</div>
                          {index < page.process.length - 1 && <div className="pmsd-timeline__line" />}
                        </div>
                        <div className="pmsd-timeline__content">
                          <h4>{step.title}</h4>
                          <p>{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CTA Strip ── */}
              <div className="pmsd-cta-strip" data-aos="fade-up" data-aos-delay="150">
                <div className="pmsd-cta-strip__glow" />
                <div className="pmsd-cta-strip__content">
                  <p className="pmsd-section-kicker" style={{ color: "rgba(255,255,255,0.6)" }}>Need On-Ground Support?</p>
                  <h3>Let us simplify this part of ownership.</h3>
                  <p>We help owners stay informed, reduce follow-up fatigue, and keep property-related work moving.</p>
                </div>
                <Link href="#contact-form" className="pmsd-cta-strip__btn">
                  Talk to Our Team <i className="fal fa-arrow-right-long ms-2" />
                </Link>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="col-lg-4" data-aos="fade-left" data-aos-delay="120">
              <aside className="pmsd-sidebar" id="contact-form">
                <div className="pmsd-sidebar__panel pmsd-sidebar__panel--dark">
                  <p className="pmsd-sidebar__eyebrow">Quick Contact</p>
                  <h3>Book consultation for {page.title}</h3>
                  <p>
                    Share your requirement and our team will get back with the next practical step.
                  </p>
                </div>

                <form className="pmsd-form pmsd-sidebar__panel">
                  <div className="pmsd-form__group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Your full name" />
                  </div>
                  <div className="pmsd-form__group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="pmsd-form__group">
                    <label>Email Address</label>
                    <input type="email" placeholder="your@email.com" />
                  </div>
                  <div className="pmsd-form__group">
                    <label>Your Requirement</label>
                    <select defaultValue={page.title}>
                      <option value={page.title}>{page.title}</option>
                      <option value="General Property Management">General Property Management</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="pmsd-form__group">
                    <label>Brief Description</label>
                    <textarea rows={4} placeholder="Tell us briefly what you need help with" />
                  </div>
                  <button type="button" className="ud-btn btn-thm w-100">
                    Send Message
                  </button>
                  <p className="pmsd-form__note">
                    <i className="fas fa-lock me-1" />Your information stays confidential.
                  </p>
                </form>

                {/* Contact phone/email block intentionally hidden */}
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}

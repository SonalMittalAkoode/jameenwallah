'use client';
import { getAllPropertiesFrontend } from "@/api/property";
import React, { useEffect, useMemo, useState } from "react";
import { getCleanPrimaryPropertyImage } from "@/utils/resolveImage";
import {
  formatPropertyLocation,
  formatSizeLabel,
  getBathroomLabel,
  getBedroomLabel,
} from "@/utils/propertyDisplay";

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9V5a2 2 0 012-2h16a2 2 0 012 2v4"/>
    <rect x="2" y="9" width="20" height="11" rx="2"/>
    <path d="M2 15h20M7 9v6M17 9v6"/>
  </svg>
);

const IconBath = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18a1 1 0 011 1v1a4 4 0 01-4 4H6a4 4 0 01-4-4v-1a1 1 0 011-1z"/>
    <path d="M6 12V5a2 2 0 012-2h1M3 16l-1 4M21 16l1 4"/>
  </svg>
);

const IconArea = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 3v18"/>
  </svg>
);

const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
    <path d="M13 2L4.5 13.5H11L10 22l9-12h-6.5L13 2z"/>
  </svg>
);

const IconCompare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
);

const IconChevron = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
  </svg>
);

function PropertyCarousel({ data }) {
  const [current, setCurrent] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, data.length - visibleCount);

  const prev = () => setCurrent(i => Math.max(0, i - 1));
  const next = () => setCurrent(i => Math.min(maxIndex, i + 1));

  return (
    <div>
      <div className="deals-track-wrapper">
        <div
          className="deals-track"
          style={{ transform: `translateX(calc(-${current * 26.5}%))` }}
        >
          {data.map((prop) => (
            <div key={prop.id} className={`deal-card${prop.featured ? " deal-card--featured" : ""}`}>
              <div className="deal-card__image-wrap">
                <img
                  src={prop.image}
                  alt={prop.title}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/images/listings/g1-1.jpg"; }}
                />
                <span className={`deal-card__badge deal-card__badge--${
                  prop.category?.toLowerCase() === "commercial" ? "commercial" : "residential"
                }`}>
                  <IconBolt /> {prop.category}
                </span>
                <span className="deal-card__price">{prop.price}</span>
                <button className="deal-card__action" title="Compare">
                  <IconCompare />
                </button>
              </div>

              <div className="deal-card__body">
                <h3 className="deal-card__title">{prop.title}</h3>
                <p className="deal-card__location">
                  <IconPin />
                  {prop.location}
                </p>
                <div className="deal-card__divider" />
                <div className="deal-card__meta">
                  {prop.bed != null && (
                    <span className="deal-card__meta-item"><IconBed /> {prop.bed}</span>
                  )}
                  {prop.bath != null && (
                    <span className="deal-card__meta-item"><IconBath /> {prop.bath}</span>
                  )}
                  {prop.sqft != null && (
                    <span className="deal-card__meta-item"><IconArea /> {prop.sqft}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="deals-controls">
        <button className="deals-btn" onClick={prev} aria-label="Previous">
          <IconChevron dir="left" />
        </button>
        <div className="deals-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`deals-dot${current === i ? " active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="deals-btn" onClick={next} aria-label="Next">
          <IconChevron dir="right" />
        </button>
      </div>
    </div>
  );
}

export default function PropertyListing() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllPropertiesFrontend({ limit: 10, page: 1 });
        if (!cancelled) setRows(res?.items ?? []);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const resolveImage = (images = []) => {
    const raw = Array.isArray(images) ? images[0] : null;
    if (!raw || typeof raw !== "string") return "/images/listings/g1-1.jpg";
    const img = raw.trim();
    if (!img) return "/images/listings/g1-1.jpg";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return `${API_BASE}/${img}`;
  };

  const formatPrice = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return "Price on request";
    return `₹${new Intl.NumberFormat("en-IN").format(num)}`;
  };

  const saleProperties = useMemo(
    () =>
      (rows || []).map((item) => ({
        id: item?.description?.slug || item?._id,
        image: getCleanPrimaryPropertyImage(item),
        title: item?.description?.title || "Property",
        location: formatPropertyLocation(item),
        bed: getBedroomLabel(item),
        bath: getBathroomLabel(item),
        sqft: formatSizeLabel(item),
        price: formatPrice(item?.description?.price),
        featured: item?.description?.featuredProperty === "Yes",
        category: item?.description?.category?.name || "Residential",
      })),
    [rows]
  );

  if (!saleProperties.length) return null;

  return (
    <section className="deals-section">
      <div className="container">
        <div className="row deals-header" data-aos="fade-up">
          <div className="col-lg-8">
            <p className="deals-eyebrow">Curated for you</p>
            <h2 className="deals-title">
              Discover Our <span>Best Deals</span>
            </h2>
            <p className="deals-subtitle">
              Explore exclusive luxury property deals, new launch projects, and
              high-growth real estate opportunities in Gurgaon, Noida &amp; Delhi&nbsp;NCR.
            </p>
          </div>
        </div>

        <div className="row" data-aos="fade-up" data-aos-delay="200">
          <div className="col-lg-12">
            <PropertyCarousel data={saleProperties} />
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { getActiveCategories } from "@/api/category";
import { getLimitedPropertyPages } from "@/api/propertyPage";
import { slugify } from "@/lib/listingPath";
import { getPropertyListTrendsFrontend } from "@/api/property";
import { getPropertyTypesByCategory } from "@/api/propertyType";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const formatInr = (value) =>
  `₹${new Intl.NumberFormat("en-IN").format(Math.round(Number(value || 0)))}`;

const formatInrLakh = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num) || num <= 0) return "₹0";
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh.toFixed(lakh >= 10 ? 0 : 1)}L`;
  }
  return formatInr(num);
};

const EXPLORE_GROUP_ORDER = [
  "Gurgaon",
  "Gurgaon Sectors",
  "Sohna",
  "Dwarka Expressway",
  "Other Cities",
  "Other SEO Pages",
];

const inferExploreGroup = (page = {}) => {
  const title = String(page.title || "").toLowerCase();
  const city = String(page.cityId?.name || "").toLowerCase();
  const text = `${title} ${city}`;
  const isGurgaon = /gurgaon|gurugram/.test(city) || /gurgaon|gurugram/.test(title);

  if (/dwarka/.test(text)) return "Dwarka Expressway";
  if (/\bsohna\b/.test(text)) return "Sohna";
  if (/find properties in /i.test(page.title || "") && !isGurgaon) return "Other Cities";
  if (city && !isGurgaon) return "Other Cities";
  if (isGurgaon && /sector\s*\d+|golf course|new gurgaon|manesar/.test(title)) return "Gurgaon Sectors";
  if (isGurgaon) return "Gurgaon";
  return "Other SEO Pages";
};

const cleanExploreTitle = (title = "") => {
  const text = String(title || "").replace(/\s+/g, " ").trim();
  if (!/^properties in /i.test(text)) return text;

  const place = text.replace(/^properties in /i, "");
  const cleanParts = place
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^(gurgaon|gurugram|haryana|india|new delhi|delhi)$/i.test(part));

  if (!cleanParts.length) return text;
  return `Properties in ${cleanParts.slice(0, 2).join(", ")}`;
};

const isProfessionalExplorePage = (page = {}) => {
  const title = page.title || "";
  const slug = page.slug || "";
  const normalized = `${title} ${slug}`.toLowerCase();
  if (!title || !slug) return false;
  if (/\b\d{6}\b/.test(normalized)) return false;
  if (/\b(\d+(st|nd|rd|th)\s+floor|unit|tower|opposite|near|house|building|marg|block-[a-z]|block\s+[a-z]|plot\s+no)\b/.test(normalized)) {
    return false;
  }
  if (/^properties in /i.test(title) && title.length > 76 && !/(dwarka expressway|golf course|sector\s*\d+|sohna|manesar)/i.test(title)) {
    return false;
  }
  return true;
};

const normalizeExplorePage = (page) => ({
  slug: String(page?.slug || page?._id || "").trim(),
  title: cleanExploreTitle(page?.title),
  description: String(page?.description || "").trim(),
  href: page?.slug ? `/propertypage/${page.slug}?from=explore` : "/properties",
  group: inferExploreGroup(page),
  count: Array.isArray(page?.propertyId) ? page.propertyId.length : 0,
  source: "cms",
});

const getExploreRank = (page) => {
  const title = page.title.toLowerCase();
  if (title.startsWith("find properties in ")) return 0;
  if (title.startsWith("properties in ")) return 1;
  if (/dwarka expressway|sohna|golf course|sector/.test(title)) return 2;
  return 3;
};

const sortExploreItems = (items) =>
  items.sort((a, b) => {
    const rankDiff = getExploreRank(a) - getExploreRank(b);
    if (rankDiff) return rankDiff;
    const countDiff = b.count - a.count;
    if (countDiff) return countDiff;
    return a.title.localeCompare(b.title);
  });

const buildExploreGroups = (cmsPages = []) => {
  const bySlug = new Map();

  cmsPages
    .filter(isProfessionalExplorePage)
    .map(normalizeExplorePage)
    .filter((page) => page.slug && page.title)
    .forEach((page) => bySlug.set(page.slug, page));

  const grouped = EXPLORE_GROUP_ORDER.map((label) => ({ label, items: [] }));
  const getGroup = (label) => {
    const resolvedLabel = EXPLORE_GROUP_ORDER.includes(label) ? label : "Other SEO Pages";
    return grouped.find((group) => group.label === resolvedLabel);
  };

  [...bySlug.values()].forEach((item) => {
    getGroup(item.group).items.push(item);
  });

  grouped.forEach((group) => {
    group.items = sortExploreItems(group.items);
  });

  return grouped.filter((group) => group.items.length);
};

/* ── Market Trends Box ───────────────────────────────────── */
const MarketTrendsBox = () => {
  const DEFAULT_PROPERTY_TYPE_ID = "692fdce6ef9198127dfecbc2";
  const DEFAULT_CATEGORY_ID = "6915a3629d7459c549c78dd7";

  const [trendRows, setTrendRows] = useState([]);
  const [trendSummary, setTrendSummary] = useState(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [categoryTabs, setCategoryTabs] = useState([]);
  const [propertyTypeTabs, setPropertyTypeTabs] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState(DEFAULT_PROPERTY_TYPE_ID);

  const fallbackCategories = [
    { id: DEFAULT_CATEGORY_ID, name: "Residential" },
    { id: "fb-commercial", name: "Commercial" },
    { id: "fb-sco", name: "SCO Plots" },
  ];
  const fallbackTypes = [
    { id: DEFAULT_PROPERTY_TYPE_ID, name: "High Rise" },
    { id: "fb-plots", name: "Residential Plots" },
    { id: "fb-low-rise", name: "Low Rise Floors" },
  ];

  const categoryOpts = useMemo(
    () =>
      categoryTabs.length
        ? categoryTabs.map((c) => ({ id: String(c._id), name: c.name || c.slug, slug: c.slug || slugify(c.name || "") }))
        : fallbackCategories,
    [categoryTabs]
  );

  const typeOpts = useMemo(
    () =>
      propertyTypeTabs.length
        ? propertyTypeTabs.map((t) => ({ id: String(t._id), name: t.name || t.slug, slug: t.slug || slugify(t.name || "") }))
        : fallbackTypes,
    [propertyTypeTabs]
  );

  useEffect(() => {
    let cancelled = false;
    getActiveCategories()
      .then((r) => { if (!cancelled) setCategoryTabs(Array.isArray(r?.data) ? r.data : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPropertyTypesByCategory(selectedCategoryId || DEFAULT_CATEGORY_ID)
      .then((r) => { if (!cancelled) setPropertyTypeTabs(Array.isArray(r?.data) ? r.data : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedCategoryId]);

  useEffect(() => {
    if (categoryOpts.length && !categoryOpts.find((o) => o.id === selectedCategoryId))
      setSelectedCategoryId(categoryOpts[0].id);
  }, [categoryOpts]);

  useEffect(() => {
    if (typeOpts.length && !typeOpts.find((o) => o.id === selectedPropertyTypeId))
      setSelectedPropertyTypeId(typeOpts[0].id);
  }, [typeOpts]);

  useEffect(() => {
    let cancelled = false;
    const selectedCat = categoryOpts.find((o) => o.id === selectedCategoryId) || categoryOpts[0];
    const selectedType = typeOpts.find((o) => o.id === selectedPropertyTypeId) || typeOpts[0];
    const prefix = [selectedCat?.slug, selectedType?.slug].filter(Boolean).join("/");

    setTrendLoading(true);
    getPropertyListTrendsFrontend({
      propertytypeid: selectedPropertyTypeId || DEFAULT_PROPERTY_TYPE_ID,
      categoriesid: selectedCategoryId || DEFAULT_CATEGORY_ID,
    })
      .then((response) => {
        if (cancelled) return;
        const rows = Array.isArray(response?.data) ? response.data : [];
        const validRows = rows.filter((item) => {
          const areaTitle = String(item?.areaTitle || "").trim();
          const avgPrice = Number(item?.avgPrice || 0);
          return areaTitle && !/^unknown area$/i.test(areaTitle) && Number.isFinite(avgPrice) && avgPrice > 0;
        });

        setTrendRows(
          validRows.map((item) => {
            const areaSlug = slugify(item.areaTitle || item.areaId || "");
            return {
              area: item.areaTitle || item.areaId || "Unknown Area",
              cost: formatInrLakh(item.avgPrice),
              band:
                Number(item.minPrice || 0) > 0 && Number(item.maxPrice || 0) > 0
                  ? `${formatInrLakh(item.minPrice)} – ${formatInrLakh(item.maxPrice)}`
                  : "N/A",
              count: Number(item.propertyCount || 0),
              link: `/properties/${prefix}/${areaSlug}`,
            };
          })
        );
        if (validRows.length) {
          const totalCount = validRows.reduce((sum, row) => sum + Number(row.propertyCount || 0), 0);
          const weightedTotal = validRows.reduce(
            (sum, row) => sum + Number(row.avgPrice || 0) * Number(row.propertyCount || 0),
            0
          );
          const minPrices = validRows.map((row) => Number(row.minPrice || 0)).filter((value) => value > 0);
          const maxPrices = validRows.map((row) => Number(row.maxPrice || 0)).filter((value) => value > 0);
          setTrendSummary({
            totalAverage: totalCount ? weightedTotal / totalCount : Number(validRows[0].avgPrice || 0),
            totalminPrice: minPrices.length ? Math.min(...minPrices) : null,
            totalmaxPrice: maxPrices.length ? Math.max(...maxPrices) : null,
          });
        } else {
          setTrendSummary(null);
        }
      })
      .catch(() => { if (!cancelled) setTrendRows([]); })
      .finally(() => { if (!cancelled) setTrendLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCategoryId, selectedPropertyTypeId, categoryOpts, typeOpts]);

  const avgPrice = trendSummary?.totalAverage
    ? formatInrLakh(trendSummary.totalAverage)
    : "₹21,892";
  const priceRange =
    trendSummary?.totalminPrice != null && trendSummary?.totalmaxPrice != null
      ? `${formatInrLakh(trendSummary.totalminPrice)} – ${formatInrLakh(trendSummary.totalmaxPrice)}`
      : "₹1,333 – ₹1L";

  const defaultRows = [
    { area: "New Gurgaon", cost: "₹17K", band: "₹17K – ₹17K", count: 1, link: "/properties" },
    { area: "Golf Course Ext. Road", cost: "₹25.6K", band: "₹7.2K – ₹90K", count: 19, link: "/properties" },
    { area: "Worli", cost: "₹78.3K", band: "₹42K – ₹1.15L", count: 2, link: "/properties" },
  ];
  const displayedRows = trendRows.length ? trendRows : defaultRows;

  return (
    <div className="eos-trends">
      {/* Top row: stat cards + category dropdown */}
      <div className="eos-trends__header">
        <div className="eos-trends__stats">
          <div className="eos-stat-card">
            <span className="eos-stat-card__label">Avg. Price / sqft</span>
            <span className="eos-stat-card__value">{avgPrice}</span>
            <span className="eos-stat-card__sub">Live verified listings</span>
          </div>
          <div className="eos-stat-card">
            <span className="eos-stat-card__label">Price Range / sqft</span>
            <span className="eos-stat-card__value eos-stat-card__value--sm">{priceRange}</span>
            <span className="eos-stat-card__sub">Valid price and area only</span>
          </div>
        </div>
        <div className="eos-trends__category-select-wrap">
          <select
            className="eos-category-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            {categoryOpts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Property type pills */}
      <div className="eos-type-pills">
        {typeOpts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`eos-type-pill${t.id === selectedPropertyTypeId ? " active" : ""}`}
            onClick={() => setSelectedPropertyTypeId(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="eos-table-wrap">
        {trendLoading ? (
          <div className="eos-table-loading">
            <span className="eos-spinner" />
            <span>Loading trends…</span>
          </div>
        ) : (
          <table className="eos-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Avg / sqft</th>
                <th>Price Band</th>
                <th>Listings</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <span className="eos-table__area">
                      <i className="fal fa-map-marker-alt" />
                      {row.area}
                    </span>
                  </td>
                  <td><strong>{row.cost}</strong></td>
                  <td><span className="eos-table__band">{row.band}</span></td>
                  <td>
                    <Link href={row.link} className="eos-table__cta">
                      {row.count} Properties
                      <i className="fal fa-arrow-right" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ── Main Section ────────────────────────────────────────── */
const ExploreOpportunitiesSection = () => {
  const [cmsExplorePages, setCmsExplorePages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getLimitedPropertyPages(500)
      .then((response) => {
        if (cancelled) return;
        setCmsExplorePages(Array.isArray(response?.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setCmsExplorePages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exploreGroups = useMemo(
    () => buildExploreGroups(cmsExplorePages),
    [cmsExplorePages]
  );

  return (
    <section className="eos-section">
      <div className="container">
        {/* Section header */}
        <div className="row mb50" data-aos="fade-up">
          <div className="col-lg-7">
            <p style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#ff385c", marginBottom: 12
            }}>
              <span style={{ display: "block", width: 20, height: 1.5, background: "#ff385c", borderRadius: 2 }} />
              Market Intelligence
            </p>
            <h2 style={{
              fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800,
              color: "#181a20", letterSpacing: "-0.03em", lineHeight: 1.15,
              margin: "0 0 12px"
            }}>
              Explore Gurgaon's Property Market
            </h2>
            <p style={{ fontSize: 15, color: "#788088", lineHeight: 1.75, margin: 0 }}>
              City-wise listings, price trends, and high-demand area insights — all in one place.
            </p>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="eos-grid" data-aos="fade-up" data-aos-delay="100">

          {/* Left: curated SEO landing links */}
          <div className="eos-panel">
            <span className="eos-panel__eyebrow">
              <span className="eos-panel__eyebrow-dot" />
              Explore New Properties
            </span>
            <h3 className="eos-panel__title">Explore new properties</h3>
            <p className="eos-panel__subtitle">
              Be the first to discover trending off-plan developments with exclusive previews, timely updates, and smart insights to guide your next move.
            </p>

            <div className="eos-topic-groups">
              {exploreGroups.map((group) => (
                <div className="eos-topic-group" key={group.label}>
                  <h4 className="eos-topic-group__title">{group.label}</h4>
                  <ul className="eos-topic-list">
                    {group.items.map((topic) => (
                      <li key={`${topic.source}-${topic.slug}`}>
                        <Link href={topic.href} className="eos-topic-link">
                          <span>{topic.title}</span>
                          <i className="fal fa-arrow-right" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right: market trends */}
          <div className="eos-trends-card">
            <span className="eos-trends-card__eyebrow">
              <span className="eos-panel__eyebrow-dot" />
              Live Data
            </span>
            <h3 className="eos-trends-card__title">Real Estate Market Trends</h3>
            <p className="eos-trends-card__subtitle">
              Area-wise pricing data with live property counts and smart search links.
            </p>
            <MarketTrendsBox />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ExploreOpportunitiesSection;

'use client';

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/home/home-v5/footer";
import MobileMenu from "@/components/common/mobile-menu";
import { useCompare } from "@/context/CompareContext";
import { getPropertyHref } from "@/utils/propertyRoute";
import { getPropertyByIdFrontend } from "@/api/property";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ROWS = [
  { label: "Price", key: "price" },
  { label: "Location", key: "location" },
  { label: "Property Type", key: "propertyType" },
  { label: "Property Status", key: "propertyStatus" },
  { label: "Category", key: "category" },
  { label: "Parking", key: "parking" },
  { label: "Bedrooms", key: "bed", suffix: " bed" },
  { label: "Bathrooms", key: "bath", suffix: " bath" },
  { label: "Size", key: "sqft", suffix: " sqft" },
];

const toComparableNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
};

const pickFirstText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (value && typeof value === "object" && typeof value.name === "string" && value.name.trim()) {
      return value.name.trim();
    }
  }
  return "";
};

const normalizeCompareItem = (item = {}) => {
  const bed = toComparableNumber(item.bed, item.bedrooms, item?.details?.bedrooms);
  const bath = toComparableNumber(item.bath, item.bathrooms, item?.details?.bathrooms);
  const sqft = toComparableNumber(
    item.sqft,
    item.sizeInFt,
    item?.details?.sizeInFt,
    item.maxSize
  );

  return {
    ...item,
    slug: pickFirstText(item.slug, item?.description?.slug) || item.slug,
    location:
      pickFirstText(
        item.location,
        item?.location?.address,
        item?.location?.city,
        item?.description?.address
      ) || item.location,
    propertyType: pickFirstText(
      item.propertyType,
      item?.description?.propertyType,
      item?.description?.propertyType?.name
    ),
    propertyStatus: pickFirstText(item.propertyStatus, item?.details?.propertyStatus),
    category: pickFirstText(
      item.category,
      item?.description?.category,
      item?.description?.category?.name
    ),
    parking: pickFirstText(item.parking, item?.details?.parking),
    bed,
    bath,
    sqft,
  };
};

const hasMissingCorePointers = (item) =>
  item.bed === null || item.bath === null || item.sqft === null;

const hasDisplayValue = (key, value) => {
  if (value === null || value === undefined || value === "") return false;
  if (key === "bed" || key === "bath" || key === "sqft") {
    const num = Number(value);
    return Number.isFinite(num) && num > 0;
  }
  return true;
};

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [isMobileView, setIsMobileView] = useState(false);
  const [hydratedById, setHydratedById] = useState({});

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobileLayout = () => setIsMobileView(mobileMediaQuery.matches);

    updateMobileLayout();
    mobileMediaQuery.addEventListener("change", updateMobileLayout);

    return () => {
      mobileMediaQuery.removeEventListener("change", updateMobileLayout);
    };
  }, []);

  const normalizedCompareList = useMemo(
    () => compareList.map((item) => normalizeCompareItem(item)),
    [compareList]
  );

  useEffect(() => {
    let cancelled = false;
    const needsHydration = normalizedCompareList.filter(
      (item) => item?.id && item?.slug && hasMissingCorePointers(item)
    );

    if (!needsHydration.length) return;

    (async () => {
      const entries = await Promise.all(
        needsHydration.map(async (item) => {
          try {
            const response = await getPropertyByIdFrontend(item.slug);
            console.log("Hydration response for", item.slug, response);
            const property = response?.item || response?.data || response;
            if (!property) return null;
            return [
              item.id,
              {
                bed: toComparableNumber(
                  property?.details?.bedrooms,
                  property?.bed,
                  property?.bedrooms
                ),
                bath: toComparableNumber(
                  property?.details?.bathrooms,
                  property?.bath,
                  property?.bathrooms
                ),
                sqft: toComparableNumber(
                  property?.details?.sizeInFt,
                  property?.sqft,
                  property?.sizeInFt,
                  property?.maxSize
                ),
                location: pickFirstText(
                  property?.location?.address,
                  property?.location?.city,
                  property?.description?.address
                ),
                propertyType: pickFirstText(
                  property?.description?.propertyType,
                  property?.description?.propertyType?.name
                ),
                propertyStatus: pickFirstText(property?.details?.propertyStatus),
                category: pickFirstText(
                  property?.description?.category,
                  property?.description?.category?.name
                ),
                parking: pickFirstText(property?.details?.parking),
              },
            ];
          } catch (_) {
            return null;
          }
        })
      );

      if (cancelled) return;
      const next = entries.filter(Boolean);
      if (!next.length) return;
      setHydratedById((prev) => ({ ...prev, ...Object.fromEntries(next) }));
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedCompareList]);

  const compareViewList = useMemo(
    () =>
      normalizedCompareList.map((item) => {
        const hydrated = hydratedById[item.id];
        if (!hydrated) return item;
        return {
          ...item,
          bed: item.bed ?? hydrated.bed ?? null,
          bath: item.bath ?? hydrated.bath ?? null,
          sqft: item.sqft ?? hydrated.sqft ?? null,
          location: item.location || hydrated.location || item.location,
          propertyType: item.propertyType || hydrated.propertyType || "",
          propertyStatus: item.propertyStatus || hydrated.propertyStatus || "",
          category: item.category || hydrated.category || "",
          parking: item.parking || hydrated.parking || "",
        };
      }),
    [normalizedCompareList, hydratedById]
  );

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      {/* Breadcrumb */}
      <section className="breadcumb-section3 p-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcumb-style1">
                <h1 className="title text-white">Compare Properties</h1>
                {/* <div className="breadcumb-list">
                  <Link className="text-white" href="/">Home</Link>
                  <a className="text-white" href="#">Compare</a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="compare-page-section" style={{ padding: "60px 0 80px", background: "#f8f9fa", minHeight: "60vh" }}>
        <div className="container">
          <div className="row mb20">
            <div className="col-lg-12">
              <div className="breadcumb-list">
                <a href="/">Home</a>
                <span className="title"> {'>'} </span>
                <span>Compare</span>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {compareViewList.length === 0 ? (
            <div className="compare-empty-state" style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>🏠</div>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: "#222" }}>
                No properties to compare
              </h3>
              <p style={{ color: "#888", marginBottom: 32, maxWidth: 380, margin: "0 auto 32px" }}>
                Browse properties and tap the compare icon to add up to 3 properties side-by-side.
              </p>
              <Link
                href="/properties"
                className="ud-btn btn-thm"
                style={{ display: "inline-flex", gap: 8 }}
              >
                Browse Properties <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          ) : isMobileView ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  gap: 12,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#666", fontWeight: 600 }}>
                  {compareViewList.length} of 3 selected
                </p>
                <button
                  onClick={clearCompare}
                  style={{
                    background: "none",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: "5px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    color: "#666",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {compareViewList.map((prop) => (
                  <div
                    key={prop.id}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                      border: "1px solid #eee",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {prop.image ? (
                        <Image
                          src={prop.image}
                          alt={prop.title}
                          width={700}
                          height={360}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 180,
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ccc",
                            fontSize: 40,
                          }}
                        >
                          🏠
                        </div>
                      )}

                      <button
                        onClick={() => removeFromCompare(prop.id)}
                        title="Remove"
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: "rgba(0,0,0,0.45)",
                          border: "none",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: 13,
                          zIndex: 1,
                        }}
                      >
                        <i className="fas fa-xmark" />
                      </button>
                    </div>

                    <div style={{ padding: "14px 14px 6px" }}>
                      <h6
                        style={{
                          fontWeight: 700,
                          marginBottom: 4,
                          fontSize: 15,
                          lineHeight: 1.3,
                        }}
                      >
                        {prop.slug ? (
                          <Link
                            href={getPropertyHref(prop)}
                            style={{ color: "#222", textDecoration: "none" }}
                          >
                            {prop.title}
                          </Link>
                        ) : (
                          prop.title
                        )}
                      </h6>
                      <p style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>
                        <i className="fas fa-location-dot me-1" />
                        {prop.location}
                      </p>
                    </div>

                    <div style={{ padding: "0 14px 14px" }}>
                      {ROWS.map((row, idx) => (
                        <div
                          key={`${prop.id}-${row.key}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 0",
                            borderTop: idx === 0 ? "1px solid #f0f0f0" : "none",
                            borderBottom: "1px solid #f5f5f5",
                          }}
                        >
                          <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>
                            {row.label}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: row.key === "price" ? "#ff385c" : "#222",
                              fontWeight: row.key === "price" ? 700 : 500,
                              textAlign: "right",
                            }}
                          >
                            {hasDisplayValue(row.key, prop[row.key])
                              ? `${prop[row.key]}${row.suffix || ""}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {compareViewList.length < 3 && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <Link
                    href="/properties"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "none",
                      border: "2px dashed #ddd",
                      borderRadius: 12,
                      padding: "10px 22px",
                      color: "#888",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <i className="fas fa-plus" />
                    Add Another Property
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Header row: cards */}
              <div
                className="compare-header-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
                  gap: 16,
                  alignItems: "stretch",
                  marginBottom: 0,
                }}
              >
                {/* Label column header */}
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                  {compareViewList.length} of 3 selected
                    </p>
                    <button
                      onClick={clearCompare}
                      style={{
                        marginTop: 6,
                        background: "none",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        color: "#666",
                        fontWeight: 500,
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Property cards */}
                {compareViewList.map((prop) => (
                  <div
                    key={prop.id}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                      border: "1px solid #eee",
                      position: "relative",
                    }}
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(prop.id)}
                      title="Remove"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(0,0,0,0.45)",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: 13,
                        zIndex: 2,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#ff385c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "rgba(0,0,0,0.45)")
                      }
                    >
                      <i className="fas fa-xmark" />
                    </button>

                    {/* Image */}
                    {prop.image ? (
                      <Image
                        src={prop.image}
                        alt={prop.title}
                        width={400}
                        height={200}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 180,
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ccc",
                          fontSize: 40,
                        }}
                      >
                        🏠
                      </div>
                    )}

                    <div style={{ padding: "14px 16px 16px" }}>
                      <h6
                        style={{
                          fontWeight: 700,
                          marginBottom: 4,
                          fontSize: 15,
                          lineHeight: 1.3,
                        }}
                      >
                        {prop.slug ? (
                          <Link
                            href={getPropertyHref(prop)}
                            style={{ color: "#222", textDecoration: "none" }}
                          >
                            {prop.title}
                          </Link>
                        ) : (
                          prop.title
                        )}
                      </h6>
                      <p style={{ color: "#888", fontSize: 12, margin: 0 }}>
                        <i className="fas fa-location-dot me-1" />
                        {prop.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  border: "1px solid #eee",
                  marginTop: 20,
                }}
              >
                {ROWS.map((row, idx) => (
                  <div
                    key={row.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)`,
                      gap: 0,
                      borderBottom: idx < ROWS.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    {/* Label */}
                    <div
                      style={{
                        padding: "16px 20px",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#555",
                        background: "#fafafa",
                        borderRight: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {row.label}
                    </div>

                    {/* Values */}
                    {compareViewList.map((prop) => (
                      <div
                        key={prop.id}
                        style={{
                          padding: "16px 20px",
                          fontSize: 14,
                          color: "#222",
                          borderRight: "1px solid #f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: row.key === "price" ? 700 : 400,
                          color: row.key === "price" ? "#ff385c" : "#222",
                        }}
                      >
                        {hasDisplayValue(row.key, prop[row.key])
                          ? `${prop[row.key]}${row.suffix || ""}`
                          : "—"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Add more prompt */}
              {compareViewList.length < 3 && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <Link
                    href="/properties"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "none",
                      border: "2px dashed #ddd",
                      borderRadius: 12,
                      padding: "12px 28px",
                      color: "#888",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#ff385c";
                      e.currentTarget.style.color = "#ff385c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ddd";
                      e.currentTarget.style.color = "#888";
                    }}
                  >
                    <i className="fas fa-plus" />
                    Add Another Property
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}

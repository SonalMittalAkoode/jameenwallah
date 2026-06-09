'use client';

import React, { useEffect, useState } from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";
import { useCompare } from "@/context/CompareContext";

const PropertyHeader = ({ property }) => {
  const [currentUrl, setCurrentUrl] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const data = normalizePropertyDetail(property);
  const secondaryMeta = [data.builder, data.category].filter(Boolean).join(" | ");
  const publicMetaLabel = data.propertyType || data.category || "Property";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(data.id || data.customId);

  const handleCompare = () => {
    const payload = {
      id: data.id || data.customId,
      slug: property?.description?.slug,
      title: data.title,
      image: (() => {
        const imgs = property?.media?.images;
        if (Array.isArray(imgs) && imgs[0]) {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
          const src = imgs[0].trim();
          if (src.startsWith("http")) return src;
          return src.startsWith("/") ? `${API_BASE}${src}` : `${API_BASE}/${src}`;
        }
        return "/images/listings/g1-1.jpg";
      })(),
      price: data.price,
      // location: data.location,
      // bed: property?.details?.bedrooms ?? 0,
      // bath: property?.details?.bathrooms ?? 0,
      // sqft: property?.details?.sizeInFt ?? property?.maxSize ?? 0,
      category: property?.description?.category?.name || "Featured",
        location: property?.location || "location not specified",
        propertyType: property?.description?.propertyType?.name || "property type not specified",
        propertyStatus: property?.details?.propertyStatus || "status not specified",
        parking: property?.details?.parking || "N/A",
        sizeInSqFt: property?.details?.sizeInSqFt ?? property?.totalAreaInSqFt ?? 0,
    };

    if (inCompare) {
      removeFromCompare(payload.id);
    } else {
      addToCompare(payload);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: data.title,
      text: `Check out this property: ${data.title}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // ignore share cancellation
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copied) {
        window.alert("Property link copied to clipboard.");
        return;
      }
    } catch {
      // Fall through to the manual copy prompt below.
    }

    window.prompt("Copy the property link:", shareUrl);
  };

  return (
    <>
      <div className="col-lg-8">
        <div className="single-property-content mb30-md">
          <h2 className="sp-lg-title">{data.title}</h2>
          <div className="pd-meta mb15 d-md-flex align-items-center">
            <p className="text fz15 mb-0 bdrr1 pr10 bdrrn-sm">
              {data.location}
            </p>
            {secondaryMeta ? (
              <p className="text fz15 mb-0 ms-md-3">{secondaryMeta}</p>
            ) : null}
          </div>
          <div className="property-meta d-flex align-items-center gap-3">
            <a className="ff-heading fz15" href="#">
              <i className="flaticon-house pe-2 align-text-top" />
              {publicMetaLabel}
            </a>

            

            {/* Compare button */}
            <button
              type="button"
              onClick={handleCompare}
              title={inCompare ? "Remove from Compare" : "Add to Compare"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: inCompare ? "#fff0f2" : "#f5f5f5",
                border: inCompare ? "1px solid #ff385c" : "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "5px 14px",
                cursor: "pointer",
                color: inCompare ? "#ff385c" : "#555",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff0f2";
                e.currentTarget.style.borderColor = "#ff385c";
                e.currentTarget.style.color = "#ff385c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = inCompare ? "#fff0f2" : "#f5f5f5";
                e.currentTarget.style.borderColor = inCompare ? "#ff385c" : "#e0e0e0";
                e.currentTarget.style.color = inCompare ? "#ff385c" : "#555";
              }}
            >
              <i className="fas fa-code-compare" style={{ fontSize: 14 }} />
              {inCompare ? "Added to Compare" : "Compare"}
            </button>
          </div>
        </div>
      </div>
      {/* End .col-lg--8 */}

      <div className="col-lg-4">
        <div className="single-property-content">
          <div className="property-action text-lg-end">
            <h3 className="price mb-0">{data.price} </h3>
            {data.details?.sizeInSqFt ? (
              <p className="text space fz15">{data.price/data.details?.sizeInSqFt}/Sq Ft</p>
            ) : null}
            <div className="position-relative">
              <button
                type="button"
                onClick={() => setIsShareOpen((prev) => !prev)}
                title="Share this property"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: "5px 14px",
                  cursor: "pointer",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: 13,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff0f2";
                  e.currentTarget.style.borderColor = "#ff385c";
                  e.currentTarget.style.color = "#ff385c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.color = "#555";
                }}
              >
                <i className="flaticon-share-1" style={{ fontSize: 14 }} />
                Share
              </button>

              {isShareOpen ? (
                <div
                  className="bgc-white bdrs12 border p15 position-absolute"
                  style={{
                    top: 48,
                    right: 0,
                    minWidth: 170,
                    zIndex: 10,
                    boxShadow: "0 20px 40px rgba(55, 63, 104, 0.08)",
                  }}
                >
                  <a
                    className="d-flex align-items-center text-dark mb10"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsShareOpen(false)}
                  >
                    <i className="fab fa-facebook-f me-2" /> Facebook
                  </a>
                  <a
                    className="d-flex align-items-center text-dark mb10"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsShareOpen(false)}
                  >
                    <i className="fab fa-linkedin-in me-2" /> Linkedin
                  </a>
                  <a
                    className="d-flex align-items-center text-dark mb10"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
                      `Check out this property: ${data.title}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsShareOpen(false)}
                  >
                    <i className="fab fa-twitter me-2" /> Twitter
                  </a>
                  <button
                    type="button"
                    className="d-flex align-items-center text-dark p-0 border-0 bg-transparent"
                    onClick={() => {
                      setIsShareOpen(false);
                      handleShare();
                    }}
                  >
                    <i className="fab fa-instagram me-2" /> Instagram
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          
        </div>
      </div>
      {/* End .col-lg--4 */}
    </>
  );
};

export default PropertyHeader;

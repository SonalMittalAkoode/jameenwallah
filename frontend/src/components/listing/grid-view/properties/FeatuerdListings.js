"use client";

import Link from "next/link";
import { getPropertyHref } from "@/utils/propertyRoute";
import { useCompare } from "@/context/CompareContext";

const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
    <rect x="2" y="9" width="20" height="11" rx="2" />
    <path d="M2 15h20M7 9v6M17 9v6" />
  </svg>
);

const IconBath = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h18a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-1a1 1 0 0 1 1-1z" />
    <path d="M6 12V5a2 2 0 0 1 2-2h1M3 16l-1 4M21 16l1 4" />
  </svg>
);

const IconArea = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);

const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const FeaturedListings = ({ data }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const hasValue = (value) => {
    const text = String(value || "").trim();
    return Boolean(
      text &&
        !/^0\s/i.test(text) &&
        !/^(n\/a|na)$/i.test(text) &&
        !/on request|not specified/i.test(text)
    );
  };

  return (
    <>
      {data.map((listing, index) => {
        const inCompare = isInCompare(listing.id);
        const areaLabel =
          hasValue(listing.sqft)
            ? listing.sqft
            : Number(listing.sizeInSqFt) > 0
              ? `${new Intl.NumberFormat("en-IN").format(Number(listing.sizeInSqFt))} Sqft`
              : "";
        const metaItems = [
          hasValue(listing.bed) ? { icon: <IconBed />, label: listing.bed } : null,
          hasValue(listing.bath) ? { icon: <IconBath />, label: listing.bath } : null,
          hasValue(areaLabel) ? { icon: <IconArea />, label: areaLabel } : null,
        ].filter(Boolean);
        if (!metaItems.length) {
          const fallbackLabel =
            (hasValue(listing.propertyType) &&
              !/not specified/i.test(String(listing.propertyType)) &&
              listing.propertyType) ||
            (hasValue(listing.propertyStatus) &&
              !/not specified/i.test(String(listing.propertyStatus)) &&
              listing.propertyStatus) ||
            "Details available";
          metaItems.push({ icon: <IconInfo />, label: fallbackLabel });
        }

        const handleCompare = (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (inCompare) {
            removeFromCompare(listing.id);
          } else {
            addToCompare({
              id: listing.id,
              slug: listing.slug,
              title: listing.title,
              image: listing.image,
              price: listing.price,
              location: listing.location,
              bed: listing.bed,
              bath: listing.bath,
              sqft: listing.sizeInSqFt,
              propertyType: listing.propertyType,
              propertyStatus: listing.propertyStatus,
              category: listing.category,
              parking: listing.parking || "N/A",
            });
          }
        };

        return (
          <div className="col-sm-6 col-lg-4 property-grid-card-col" key={`${listing.uid || listing.id || "property"}-${index}`}>
            <article className="featured-property-card property-listing-premium-card">
              <div className="featured-property-card__image-wrap">
                <img
                  className="featured-property-card__image"
                  src={listing.image || "/images/listings/g1-1.jpg"}
                  alt={listing.title || "Property listing"}
                  loading={index < 3 ? "eager" : "lazy"}
                  onError={(event) => {
                    if (event.currentTarget.src.includes("/images/listings/g1-1.jpg")) return;
                    event.currentTarget.src = "/images/listings/g1-1.jpg";
                  }}
                />

                <div className="featured-property-card__overlay" />

                <div className="featured-property-card__badges">
                  {listing.category ? (
                    <span className="featured-property-card__badge featured-property-card__badge--primary">
                      <i className="flaticon-electricity" />
                      {listing.category}
                    </span>
                  ) : null}

                  <span className="featured-property-card__badge featured-property-card__badge--dark">
                    {listing.listingType || "For Sale"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompare}
                  title={inCompare ? "Remove from Compare" : "Add to Compare"}
                  className={`featured-property-card__compare ${inCompare ? "is-active" : ""}`}
                >
                  <i className="fas fa-code-compare" />
                  <span>{inCompare ? "Added" : "Compare"}</span>
                </button>
              </div>

              <div className="featured-property-card__content">
                <div className="featured-property-card__top">
                  <p className="featured-property-card__location">
                    <i className="far fa-location-dot" />
                    {listing.location || "Gurgaon, Haryana"}
                  </p>

                  <h3 className="featured-property-card__title">
                    <Link href={getPropertyHref(listing)}>{listing.title}</Link>
                  </h3>
                </div>

                <div className="featured-property-card__meta">
                  {metaItems.map((item, metaIndex) => (
                    <span key={`${listing.id}-meta-${metaIndex}`}>
                      {item.icon}
                      {item.label}
                    </span>
                  ))}
                </div>

                <div className="featured-property-card__footer">
                  <div>
                    <span className="featured-property-card__price-label">
                      Starting from
                    </span>
                    <p className="featured-property-card__price">
                      {listing.price || "Price on request"}
                    </p>
                  </div>

                  <Link
                    className="featured-property-card__details"
                    href={getPropertyHref(listing)}
                  >
                    Details
                    <i className="fal fa-arrow-right-long" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        );
      })}
    </>
  );
};

export default FeaturedListings;

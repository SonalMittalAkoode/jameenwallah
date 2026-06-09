
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getPropertyHref } from "@/utils/propertyRoute";

const ListingItems = ({data}) => {
  const hasValue = (value) => String(value || "").trim().length > 0;
  return (
    <>
      {data?.map((listing, index) => (
        <div className="col-md-6" key={`${listing.uid || listing.id || "property"}-${index}`}>
          <div className="listing-style1">
            <div className="list-thumb">
              <Image
                width={382}
                height={248}
                className="w-100 h-100 cover"
                src={listing.image}
                alt="listings"
              />
              <div className="sale-sticker-wrap">
                {listing.featured && (
                  <div className="list-tag fz12">
                    <span className="flaticon-electricity me-2" />
                    FEATURED
                  </div>
                )}
              </div>

              <div className="list-price">
                {listing.price}
                 {/* / <span>mo</span> */}
              </div>
            </div>
            <div className="list-content">
              <h6 className="list-title">
                <Link href={getPropertyHref(listing)}>{listing.title}</Link>
              </h6>
              <p className="list-text">{listing.location}</p>
              <div className="list-meta d-flex align-items-center">
                {hasValue(listing.bed) ? (
                  <a href="#">
                    <span className="flaticon-bed" /> {listing.bed}
                  </a>
                ) : null}
                {hasValue(listing.bath) ? (
                  <a href="#">
                    <span className="flaticon-shower" /> {listing.bath}
                  </a>
                ) : null}
                {hasValue(listing.sqft) ? (
                  <a href="#">
                    <span className="flaticon-expand" /> {listing.sqft}
                  </a>
                ) : null}
              </div>
              <hr className="mt-2 mb-2" />
              <div className="list-meta2 d-flex justify-content-between align-items-center">
                <span className="for-what">For Rent</span>
                <div className="icons d-flex align-items-center">
                  <a href="#">
                    <i className="fas fa-code-compare" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ListingItems;

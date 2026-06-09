import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const PropertyAddress = ({ property }) => {
  const data = normalizePropertyDetail(property);
  const columns = data.addressColumns || [[], []];
  const mapLabel = data.mapQuery || data.address || "Property location";

  return (
    <>
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`col-lg-6 col-md-6 col-sm-12${columnIndex === 1 ? " col-xl-4 offset-xl-2" : " col-xl-4"}`}
        >
          <div className="address-column-wrapper">
            {column.map((item, itemIndex) => (
              <div key={item.label} className="address-row mb10">
                <p className="address-label fw600 ff-heading dark-color mb0">
                  {item.label}
                </p>
                <p className="address-value text mb0">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="col-md-12">
        <iframe
          className="position-relative bdrs12 mt30 h250"
          loading="lazy"
          src={data.mapSrc}
          title={mapLabel}
          aria-label={mapLabel}
        />
      </div>
      {/* End col */}
    </>
  );
};

export default PropertyAddress;

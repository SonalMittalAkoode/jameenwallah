import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const PropertyNearby = ({ property }) => {
  const { nearbyItems } = normalizePropertyDetail(property);

  return (
    <div className="col-md-12">
      <div className="row">
        {nearbyItems.map((item, index) => (
          <div key={`${item}-${index}`} className="col-md-6 mb15">
            <div className="d-flex align-items-start">
              <span className="me-2 mt-1">
                <i className="fas fa-location-dot text-thm" />
              </span>
              <p className="text mb-0">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyNearby;

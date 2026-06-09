import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const PropertyDetails = ({ property }) => {
  const data = normalizePropertyDetail(property);
  const items =
    data.detailItems ||
    (data.detailColumns ? data.detailColumns.flat() : []);

  return (
    <div className="row">
      {items.map((detail) => (
        <div
          key={detail.label}
          className="col-md-6"
        >
          <div className="d-flex justify-content-between align-items-start gap-3 mb10">
            <div className="pd-list">
              <p className="fw600 mb0 ff-heading dark-color">
                {detail.label}
              </p>
            </div>
            <div className="pd-list text-end">
              <p className="text mb0">{detail.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyDetails;

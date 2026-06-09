import React from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const ICON_FALLBACKS = {
  "flaticon-tag": "flaticon-house-price",
  "flaticon-key": "flaticon-house-key",
};

const resolveOverviewIcon = (icon) => {
  const normalized = typeof icon === "string" ? icon.trim() : "";
  return ICON_FALLBACKS[normalized] || normalized || "flaticon-home-1";
};

const OverView = ({ property }) => {
  const data = normalizePropertyDetail(property);
  const overviewData = data.overviewItems?.length
    ? data.overviewItems
    : [
        {
          icon: "flaticon-home-1",
          label: "Property Type",
          value: data.propertyType || "N/A",
        },
      ];
 
  return (
    <>
      {overviewData.map((item, index) => (
        <div
          key={index}
          className="col-sm-6 col-lg-4 mb25"
        >
          <div className="overview-element d-flex align-items-center">
            <span className={`icon ${resolveOverviewIcon(item.icon)}`} aria-hidden="true" />
            <div className="ml15">
              <h6 className="mb-0">{item.label}</h6>
              <p className="text mb-0 fz15">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default OverView;

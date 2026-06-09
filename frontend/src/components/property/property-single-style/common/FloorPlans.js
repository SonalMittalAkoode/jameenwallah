import React from "react";
import Image from "next/image";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const FloorPlans = ({ property }) => {
  const { floorPlans, floorPlanImages, title } = normalizePropertyDetail(property);
  const plans =
    floorPlans.length > 0
      ? floorPlans
      : floorPlanImages.map((image, index) => ({
          id: `floor-plan-image-${index + 1}`,
          title: `Floor Plan ${index + 1}`,
          image,
        }));

  if (!plans.length) return null;

  return (
    <div className="accordion" id="accordionExample">
      {plans.map((floorPlan, index) => (
        <div
          className={`accordion-item ${index === 0 ? "active" : ""}`}
          key={floorPlan.id}
        >
          <h2 className="accordion-header" id={`heading${index}`}>
            <button
              className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse${index}`}
              aria-expanded={index === 0 ? "true" : "false"}
              aria-controls={`collapse${index}`}
            >
              <span className="w-100 d-md-flex align-items-center">
                <span className="mr10-sm">{floorPlan.title}</span>
                <span className="ms-auto d-md-flex align-items-center justify-content-end">
                  {floorPlan.size ? (
                    <span className="me-2 me-md-4">
                      <span className="fw600">Size:</span>
                      <span className="text">{floorPlan.size}</span>
                    </span>
                  ) : null}
                  {floorPlan.bedrooms ? (
                    <span className="me-2 me-md-4">
                      <span className="fw600">Bedrooms:</span>
                      <span className="text">{floorPlan.bedrooms}</span>
                    </span>
                  ) : null}
                  {floorPlan.bathrooms ? (
                    <span className="me-2 me-md-4">
                      <span className="fw600">Bathrooms:</span>
                      <span className="text">{floorPlan.bathrooms}</span>
                    </span>
                  ) : null}
                  {floorPlan.price ? (
                    <span>
                      <span className="fw600">Price:</span>
                      <span className="text">{floorPlan.price}</span>
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </h2>
          <div
            id={`collapse${index}`}
            className={`accordion-collapse collapse ${
              index === 0 ? "show" : ""
            }`}
            aria-labelledby={`heading${index}`}
            data-parent="#accordionExample"
          >
            <div className="accordion-body text-center">
              {floorPlan.image ? (
                <Image
                  width={736}
                  height={544}
                  className="w-100 h-100 cover"
                  src={floorPlan.image}
                  alt={`${title} floor plan`}
                />
              ) : (
                <p className="text mb-0">No floor plan image available.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloorPlans;

import React from "react";
import GalleryBox from "./GalleryBox";
import Map from "./Map";
import RealMapView from "./RealMapView";

const PropertyGallery = ({ property }) => {
  return (
    <>
      <div className="ps-v4-hero-tab">
        <div className="tab-content overflow-visible" id="pills-tabContent2">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <div className="container">
              <div className="row" data-aos="fade-up" data-aos-delay="300">
                <div className="col-lg-12">
                  <div className="ps-v4-hero-slider">
                    <GalleryBox property={property} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End tab-pane gallery */}

          <div
            className="tab-pane fade"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
          >
            <Map />
          </div>
          {/* End tab-pane map */}

          <div
            className="tab-pane fade"
            id="pills-contact"
            role="tabpanel"
            aria-labelledby="pills-contact-tab"
          >
            <RealMapView />
          </div>
          {/* End tab-pane real location */}
        </div>
        {/* End tab-content */}
      </div>
    </>
  );
};

export default PropertyGallery;

import Link from "next/link";
import React from "react";

const Cta = ({ backgroundImage = "" }) => {
  const style = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(24, 26, 32, 0.66), rgba(24, 26, 32, 0.66)), url("${backgroundImage}")`,
      }
    : undefined;

  return (
    <section
      className="cta-banner4 home-cta-section d-flex align-items-center"
      style={style}
    >
      <div className="container">
        <div className="row">
          <div className="col-xl-10 mx-auto" data-aos="fade-in">
            <div className="cta-style4 position-relative text-center">
              <h6 className="sub-title fw400 text-white">Find Your Perfect Property in Gurgaon with JameenWallah</h6>
              <h2 className="cta-title mb30 text-white">
                Luxury apartments to high-return investments, JameenWallah connects you with the best Gurgaon properties.
              </h2>
              <div className="d-block d-sm-flex justify-content-center">
                <Link
                  href="/contact"
                  className="ud-btn btn-thm me-0 me-sm-4"
                >
                  Submit Request
                  <i className="fal fa-arrow-right-long" />
                </Link>
                <Link href="/properties" className="ud-btn btn-white">
                  Browse Properties
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;

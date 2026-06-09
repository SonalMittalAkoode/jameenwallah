import Link from "next/link";
import React from "react";
import Social from "./Social";

const Copyright = () => {
  return (
    <div className="container white-bdrt1 py-4">
      <div className="row align-items-center">
        <div className="col-sm-4">
          <div className="text-center text-sm-start">
            <p className="copyright-text text-gray ff-heading mb-0">
              © {new Date().getFullYear()} JameenWallah. All rights reserved.
            </p>
          </div>
        </div>
        {/* End copyright text */}

        {/* Legal links — pages not yet created, using # as placeholder */}
        <div className="col-sm-4">
          <div className="text-center my-2 my-sm-0">
            <a href="#" className="text-gray fz14 me-3">
              Privacy Policy
            </a>
            <a href="#" className="text-gray fz14">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
        {/* End legal links */}

        <div className="col-sm-4">
          <div className="social-widget text-center text-sm-end">
            <Social />
          </div>
        </div>
        {/* End social */}
      </div>
    </div>
  );
};

export default Copyright;

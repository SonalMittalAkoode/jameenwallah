"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ContactInfo from "./ContactInfo";
import Social from "./Social";
import ProSidebarContent from "./ProSidebarContent";
import ScheduleCallPopover from "@/components/common/ScheduleCallPopover";

const MobileMenu = () => {
  const [navbar, setNavbar] = useState(false);

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, []);

  return (
    <>
      <div 
        className={`mobilie_header_nav stylehome1 ${navbar ? "slideInDown animated" : ""}`}
      style={{ 
        background: "#fff", 
        borderBottom: "1px solid #eaeaea",
        ...(navbar ? { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1030 } : {})
      }}
    >
      <div className="mobile-menu">
        <div className="header innerpage-style">
          <div className="menu_and_widgets">
            <div className="mobile_menu_bar d-flex justify-content-between align-items-center">
              <a
                className="menubar"
                href="#"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileMenu"
                aria-controls="mobileMenu"
              >
                <Image
                  width={25}
                  height={9}
                  src="/images/mobile-dark-nav-icon.svg"
                  alt="mobile icon"
                />
              </a>
              <Link className="mobile_logo" href="/">
                <img
                  width="138"
                  height="44"
                  style={{ width: "138px", height: "auto" }}
                  src="/images/logo-red.png"
                  alt="logo"
                />
              </Link>
              <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                <ScheduleCallPopover
                  triggerClassName="schedule-call-mobile-icon"
                  triggerIconClass="far fa-phone fz16"
                />
                <a 
                  href="mailto:support@jameenwallah.com" 
                  style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,56,92,0.08)", color: "#ff385c", borderRadius: "50%", textDecoration: "none" }}
                >
                  <i className="far fa-envelope fz16" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /.mobile-menu meta */}
      </div>

      <div
        className="offcanvas offcanvas-start mobile_menu-canvas"
        tabIndex="-1"
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
        data-bs-scroll="true"
      >
        <div className="rightside-hidden-bar">
          <div className="hsidebar-header">
            <div
              className="sidebar-close-icon"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            >
              <span className="far fa-times"></span>
            </div>
            <div>
              <img
                width="138"
                height="44"
                style={{ width: "138px", height: "auto" }}
                src="/images/logo-red.png"
                alt="JameenWallah Logo"
              />
            </div>
          </div>
          {/* End header */}

          <div className="hsidebar-content ">
            <div className="hiddenbar_navbar_content">
              <ProSidebarContent />
              {/* End .hiddenbar_navbar_menu */}
              {/* Become a Partner CTA */}
              <div className="px30 pb30 pt20">
                <Link
                  href="/become-partner"
                  data-bs-dismiss="offcanvas"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px 24px",
                    background: "#ff385c",
                    color: "#fff",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: "none",
                    transition: "background 0.3s",
                  }}
                >
                  Become A Partner <i className="fal fa-arrow-right-long" />
                </Link>
              </div>

              <div className="hiddenbar_footer position-relative bdrt1">
                <div className="row pt45 pb30 pl30">
                  <ContactInfo />
                </div>
                {/* End .row */}

                {/* <div className="row pt30 pb30 bdrt1">
                  <div className="col-auto">
                    <div className="social-style-sidebar d-flex align-items-center pl30">
                      <h6 className="me-4 mb-0">Follow us</h6>
                      <Social />
                    </div>
                  </div>
                </div> */}
              </div>
              {/* hiddenbar_footer */}

            </div>
          </div>
          {/* End hsidebar-content */}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;

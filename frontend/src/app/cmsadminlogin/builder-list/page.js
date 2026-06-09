"use client";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import BuilderListTable from "@/components/property/dashboard/dashboard-builder-list/BuilderListTable";
import Link from "next/link";

const BuilderList = () => {
  return (
    <>
      <DashboardHeader />
      <MobileMenu />
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-md">
          <SidebarDashboard />

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content property-page bgc-f7">
              <div className="row pb40 d-block d-lg-none">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
              </div>

              <div className="row align-items-center pb20 pb-md40">
                <div className="col-lg-8">
                  <div className="dashboard_title_area">
                    <h2>Builder Directory</h2>
                    <p
                      className="text"
                      style={{
                        fontSize: "16px",
                        color: "#6c757d",
                        marginTop: "8px",
                      }}
                    >
                      Manage developer partners, update their branding, and keep
                      descriptions current.
                    </p>
                  </div>
                </div>
                <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                  <Link
                    href="/cmsadminlogin/add-builder"
                    className="ud-btn btn-thm"
                  >
                    <span className="flaticon-plus me-2" />
                    Add Builder
                  </Link>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <BuilderListTable />
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};


export default BuilderList;


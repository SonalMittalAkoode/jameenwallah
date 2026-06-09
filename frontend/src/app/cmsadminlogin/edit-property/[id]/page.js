"use client";

import { useParams } from "next/navigation";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import Footer from "@/components/property/dashboard/Footer";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import EditPropertyTabContent from "@/components/property/dashboard/dashboard-add-property/EditPropertyTabContent";

const DashboardEditProperty = () => {
  const params = useParams();
  const propertyId = params?.id;

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

              <div className="row align-items-center pb40">
                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>Edit Property</h2>
                    <p className="text">
                      Update property details, media, status, and assigned agent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 pt30 mb30 overflow-hidden position-relative">
                    <div className="navtab-style1">
                      <EditPropertyTabContent propertyId={propertyId} />
                    </div>
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

export default DashboardEditProperty;



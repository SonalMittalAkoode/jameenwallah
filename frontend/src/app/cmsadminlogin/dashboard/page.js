import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import TopStateBlock from "@/components/property/dashboard/dashboard-home/TopStateBlock";
import PropertyViews from "@/components/property/dashboard/dashboard-home/property-view";
import CityWiseProperties from "@/components/property/dashboard/dashboard-home/CityWiseProperties";
import PieChat from "@/components/property/dashboard/dashboard-home/PieChat";


export const metadata = {
  title: "Dashboard Home || BigCat",
};

const DashboardHome = () => {
  return (
    <>
      {/* Main Header Nav */}
      <DashboardHeader />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* dashboard_content_wrapper */}
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-xl">
          <SidebarDashboard />
          {/* End .dashboard__sidebar */}

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content bgc-f7">
              <div className="row pb40">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
                {/* End .col-12 */}

                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>Howdy, Admin!</h2>
                    <p className="text">We are glad to see you again!</p>
                  </div>
                </div>
                {/* col-lg-12 */}
              </div>
              {/* End .row */}

              <div className="row">
                <TopStateBlock />
              </div>
              {/* End .row */}

              <div className="row">
                <div className="col-xl-8 d-flex">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative chart-widget w-100 h-100">
                    <div className="row">
                      <PropertyViews />
                    </div>
                  </div>
                </div>
                {/* End col-xl-8 */}

                <div className="col-xl-4 d-flex">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative chart-widget w-100 h-100">
                    <PieChat />
                  </div>
                </div>
                {/* End .col-xl-4 */}
              </div>
              {/* End .row */}

              <div className="row mt-4">
                <div className="col-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative chart-widget">
                    <CityWiseProperties />
                  </div>
                </div>
              </div>
            </div>
            
            {/* End .dashboard__content */}

            <Footer />
          </div>
          {/* End .dashboard__main */}
        </div>
      </div>
      {/* dashboard_content_wrapper */}
    </>
  );
};

export default DashboardHome;

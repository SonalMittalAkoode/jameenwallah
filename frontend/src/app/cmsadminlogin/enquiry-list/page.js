"use client";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { useCallback, useEffect, useMemo, useState } from "react";
import EnquirySubmissionTable from "@/components/property/dashboard/dashboard-enquiry-list/EnquirySubmissionTable";
import { getEnquiries } from "@/api/enquiry";

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = window.localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        setEnquiries([]);
        return;
      }

      const response = await getEnquiries(token);

      if (response?.status === "success" && Array.isArray(response.data)) {
        const sorted = [...response.data].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setEnquiries(sorted);
      } else {
        setError(response?.message || "Unable to fetch contact enquiries.");
        setEnquiries([]);
      }
    } catch (err) {
      console.error("Failed to fetch contact enquiries:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to fetch contact enquiries."
      );
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const enquiryCount = useMemo(() => enquiries.length, [enquiries]);

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
        <div className="dashboard dashboard_wrapper pr30 pr0-md">
          <SidebarDashboard />
          {/* End .dashboard__sidebar */}

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content property-page bgc-f7">
              <div className="row pb40 d-block d-lg-none">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className="row align-items-center pb40">
                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                  <h2>Contact Enquiry List</h2>
                  <p
                    className="text"
                    style={{
                      fontSize: "16px",
                      color: "#6c757d",
                      marginTop: "8px",
                    }}
                  >
                    Total enquiries ({enquiryCount})
                    </p>
                  </div>
                </div>
              </div>
              {/* End .row */}

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                  <EnquirySubmissionTable
                    enquiries={enquiries}
                    loading={loading}
                    error={error}
                    onRetry={fetchEnquiries}
                  />
                  </div>
                </div>
              </div>
              {/* End .row */}
            </div>
            {/* End dashboard__content */}

            <Footer />
          </div>
          {/* End .dashboard__main */}
        </div>
      </div>
      {/* dashboard_content_wrapper */}
    </>
  );
};

export default EnquiryList;

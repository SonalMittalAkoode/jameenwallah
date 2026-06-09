"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import TourRequestEnquiryTable from "@/components/property/dashboard/dashboard-enquiry-list/TourRequestEnquiryTable";
import { getTourRequestEnquiries } from "@/api/tourRequestEnquiry";

const TourRequestEnquiryListPage = () => {
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

      const response = await getTourRequestEnquiries(token);

      if (response?.status === "success" && Array.isArray(response.data)) {
        const sorted = [...response.data].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setEnquiries(sorted);
      } else {
        setError(
          response?.message || "Unable to fetch tour request enquiries."
        );
        setEnquiries([]);
      }
    } catch (err) {
      console.error("Failed to fetch tour request enquiries:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to fetch tour request enquiries."
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
                    <h2>Tour Request Enquiry List</h2>
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

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <TourRequestEnquiryTable
                      enquiries={enquiries}
                      loading={loading}
                      error={error}
                      onRetry={fetchEnquiries}
                    />
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

export default TourRequestEnquiryListPage;


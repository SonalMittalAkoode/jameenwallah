"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import CallRequestTable from "@/components/property/dashboard/dashboard-enquiry-list/CallRequestTable";
import { getCallRequests } from "@/api/callRequest";

const CallRequestListPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = window.localStorage.getItem("adminToken");
      if (!token) {
        setError("Authentication required. Please login again.");
        setRequests([]);
        return;
      }

      const response = await getCallRequests(token);
      if (response?.status === "success" && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setError(response?.message || "Unable to fetch call requests.");
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch call requests:", err);
      setError(err?.message || "Failed to fetch call requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const requestCount = useMemo(() => requests.length, [requests]);

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
                    <h2>Call Request List</h2>
                    <p className="text" style={{ fontSize: "16px", color: "#6c757d", marginTop: "8px" }}>
                      Total call requests ({requestCount})
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <CallRequestTable
                      requests={requests}
                      loading={loading}
                      error={error}
                      onRetry={fetchRequests}
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

export default CallRequestListPage;

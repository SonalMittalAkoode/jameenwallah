"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { getBecomePartnerEnquiries } from "@/api/becomePartnerAdmin";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PartnerEnquiryListPage = () => {
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

      const response = await getBecomePartnerEnquiries(token);
      if (response?.status === "success" && Array.isArray(response.data)) {
        setEnquiries(response.data);
      } else {
        setError(response?.message || "Unable to fetch partner enquiries.");
        setEnquiries([]);
      }
    } catch (err) {
      console.error("Failed to fetch partner enquiries:", err);
      setError(err?.message || "Failed to fetch partner enquiries.");
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
                    <h2>Partner Enquiry List</h2>
                    <p className="text" style={{ fontSize: "16px", color: "#6c757d", marginTop: "8px" }}>
                      Total partner enquiries ({enquiryCount})
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    {loading ? (
                      <div className="text-center p40">Loading partner enquiries...</div>
                    ) : error ? (
                      <div className="text-center p40">
                        <p className="text-danger mb20">{error}</p>
                        <button type="button" className="ud-btn btn-thm" onClick={fetchEnquiries}>
                          Retry
                        </button>
                      </div>
                    ) : enquiries.length === 0 ? (
                      <div className="text-center p40">No partner enquiries found.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-borderless align-middle">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>Partner Type</th>
                              <th>Message</th>
                              <th>Submitted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enquiries.map((item) => (
                              <tr key={item._id}>
                                <td className="fw600">{item.fullName || "N/A"}</td>
                                <td>{item.phoneNumber || "N/A"}</td>
                                <td>{item.email || "N/A"}</td>
                                <td>{item.partnertype || "N/A"}</td>
                                <td style={{ minWidth: 260 }}>{item.message || "N/A"}</td>
                                <td>{formatDate(item.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

export default PartnerEnquiryListPage;

"use client";
import React from "react";
import dynamic from "next/dynamic";
import { getEnquiryAnalytics } from "../../../../../api/enquiry";

/**
 * PropertyViews - Enquiry Analytics chart (drop-in replacement for Property Views).
 * Shows Enquiries Over Time: Total Enquiries vs Verified Enquiries.
 * Same layout/size as before; data structure supports future API.
 */

const EnquiryLineChart = dynamic(() => import("./EnquiryLineChart"), {
  loading: () => <div style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading chart...</div>,
});

const PropertyViews = () => {
  const [weeklyData, setWeeklyData] = React.useState([]);
  const [monthlyData, setMonthlyData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const response = await getEnquiryAnalytics(token);
          if (response?.data) {
            setWeeklyData(response.data.weekly);
            setMonthlyData(response.data.monthly);
          }
        }
      } catch (error) {
        console.error("Failed to fetch enquiry analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="col-md-12">
      <div className="navtab-style1">
        <div className="d-sm-flex align-items-center justify-content-between">
          <h4 className="title fz17 mb20">Enquiry Analytics</h4>
          <ul
            className="nav nav-tabs border-bottom-0 mb30"
            id="myTab"
            role="tablist"
          >
            <li className="nav-item">
              <a
                className="nav-link active"
                id="weekly-tab"
                data-bs-toggle="tab"
                href="#weekly"
                role="tab"
                aria-controls="weekly"
                aria-selected="true"
              >
                Weekly
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="monthly-tab"
                data-bs-toggle="tab"
                href="#monthly"
                role="tab"
                aria-controls="monthly"
                aria-selected="false"
              >
                Monthly
              </a>
            </li>
          </ul>
        </div>
        {/* End nav-tabs */}

        <div className="tab-content" id="myTabContent2">
          <div
            className="tab-pane fade show active w-100"
            id="weekly"
            role="tabpanel"
            aria-labelledby="weekly-tab"
            style={{ height: "500px" }}
          >
            <div className="chart-container" style={{ height: "100%" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100">Loading...</div>
              ) : (
                <EnquiryLineChart data={weeklyData} timeLabel="week" />
              )}
            </div>
          </div>
          <div
            className="tab-pane fade w-100"
            id="monthly"
            role="tabpanel"
            aria-labelledby="monthly-tab"
            style={{ height: "500px", maxHeight: "100%" }}
          >
            <div className="chart-container" style={{ height: "100%" }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100">Loading...</div>
              ) : (
                <EnquiryLineChart data={monthlyData} timeLabel="month" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyViews;

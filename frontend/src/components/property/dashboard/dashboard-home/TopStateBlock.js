"use client";

import { useEffect, useState } from "react";
import { getDashboardCounts } from "@/api/adminDashboard";

const defaultCounts = {
  properties: 0,
  propertyEnquiries: 0,
  landingPageEnquiries: 0,
  contactEnquiries: 0,
};

const TopStateBlock = () => {
  const [counts, setCounts] = useState(defaultCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    if (!token) {
      setCounts(defaultCounts);
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        setLoading(true);
        const response = await getDashboardCounts(token);

        if (response?.status === "success" && response?.data) {
          setCounts({
            properties: response.data.properties ?? 0,
            propertyEnquiries: response.data.propertyEnquiries ?? 0,
            landingPageEnquiries: response.data.landingPageEnquiries ?? 0,
            contactEnquiries: response.data.contactEnquiries ?? 0,
          });
        } else {
          setCounts(defaultCounts);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard counts", error);
        setCounts(defaultCounts);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const statisticsData = [
    {
      text: "All Properties",
      value: loading ? "…" : counts.properties,
      icon: "flaticon-home",
    },
    {
      text: "Total Property Enquiries",
      value: loading ? "…" : counts.propertyEnquiries,
      icon: "flaticon-house-2",
    },
    {
      text: "Landing Page Enquiries",
      value: loading ? "…" : counts.landingPageEnquiries,
      icon: "flaticon-pay-per-click",
    },
    {
      text: "Contact Enquiries",
      value: loading ? "…" : counts.contactEnquiries,
      icon: "flaticon-envelope",
    },
  ];

  return (
    <>
      {statisticsData.map((data, index) => (
        <div key={index} className="col-sm-6 col-xxl-3">
          <div className="d-flex justify-content-between statistics_funfact">
            <div className="details">
              <div className="text fz25">{data.text}</div>
              <div className="title">{data.value}</div>
            </div>
            <div className="icon text-center">
              <i className={data.icon} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopStateBlock;

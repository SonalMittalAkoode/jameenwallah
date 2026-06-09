"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { updateProperty, getVerifiedProperties } from "@/api/property";
import { getPropertyHref } from "@/utils/propertyRoute";

const VerifiedPropertyTable = () => {
  const [properties, setProperties] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedProperties = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const data = await getVerifiedProperties(token);
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch verified properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedProperties();
  }, []);

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [propertyId]: true }));
      const token = localStorage.getItem("adminToken");
      
      // Convert display status to API format (lowercase)
      const statusLower = newStatus.toLowerCase();
      
      await updateProperty(propertyId, { status: statusLower }, token);
      
      // Update local state
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId
            ? { ...property, status: statusLower }
            : property
        )
      );
      
      alert(`Property status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Failed to update property status:", error);
      alert("Failed to update property status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  if (loading) {
    return <p className="text-center py-4">Loading verified properties...</p>;
  }

  if (properties.length === 0) {
    return <p className="text-center py-4">No verified properties found.</p>;
  }

  return (
    <table className="table-style3 table at-savesearch">
      <thead className="t-head">
        <tr>
          <th scope="col">Listing title</th>
          <th scope="col">Date Published</th>
          <th scope="col">Status</th>
          <th scope="col">View</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody className="t-body">
        {properties.map((property) => (
          <tr key={property._id}>
            <th scope="row">
              <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                <div className="list-thumb">
                  <Image
                    width={110}
                    height={94}
                    className="w-100"
                    src={
                      property.media?.images?.[0]
                        ? `/images/${property.media.images[0]}`
                        : "/images/listings/list-1.jpg"
                    }
                    alt="property"
                  />
                </div>
                <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                  <div className="h6 list-title">
                    <Link href={getPropertyHref(property)}>
                      {property.description?.title || "Untitled Property"}
                    </Link>
                  </div>
                  <p className="list-text mb-0">
                    {(() => {
                      const city = typeof property.location?.city === "object" 
                        ? property.location.city?.name 
                        : property.location?.city;
                      const state = typeof property.location?.state === "object" 
                        ? property.location.state?.name 
                        : property.location?.state;
                      const parts = [city, state].filter(Boolean);
                      return parts.length > 0 ? parts.join(", ") : "No location provided";
                    })()}
                  </p>
                  <div className="list-price">
                    <a href="#">
                      ₹
                      {property.description?.price
                        ? property.description.price.toLocaleString()
                        : "N/A"}
                    </a>
                  </div>
                </div>
              </div>
            </th>
            <td className="vam">
              {new Date(property.createdAt).toLocaleDateString()}
            </td>
            <td className="vam">
              <select
                className="form-select show-tick"
                style={{ minWidth: "150px", fontSize: "13px" }}
                value={property.status || "verified"}
                onChange={(e) => handleStatusChange(property._id, e.target.value)}
                disabled={updatingStatus[property._id]}
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </td>
            <td className="vam">
              {new Date(property.createdAt).toLocaleDateString()}
            </td>
            <td className="vam">
              <div className="d-flex">
                <Link
                  href={`/cmsadminlogin/verified-property/edit/${property._id}`}
                  className="icon"
                  style={{ border: "none", textDecoration: "none", cursor: "pointer" }}
                  data-tooltip-id={`edit-${property._id}`}
                >
                  <span className="fas fa-pen fa" />
                </Link>
                <button
                  className="icon"
                  style={{ border: "none" }}
                  data-tooltip-id={`delete-${property._id}`}
                >
                  <span className="flaticon-bin" />
                </button>

                <ReactTooltip
                  id={`edit-${property._id}`}
                  place="top"
                  content="Edit"
                />
                <ReactTooltip
                  id={`delete-${property._id}`}
                  place="top"
                  content="Delete"
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VerifiedPropertyTable;


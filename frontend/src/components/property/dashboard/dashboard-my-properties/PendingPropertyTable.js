"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { getPendingProperties, updateProperty } from "@/api/property";
import { getPropertyHref } from "@/utils/propertyRoute";
import PendingPropertyPagination from "./PendingPropertyPagination";

const PendingPropertyTable = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const fetchPendingProperties = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const data = await getPendingProperties(token, page, 10);

        setPendingProperties(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      } catch (error) {
        console.error("Failed to fetch pending properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProperties();
  }, [page]);

  if (loading) {
    return <p className="text-center py-4">Loading pending properties...</p>;
  }

  if (pendingProperties.length === 0) {
    return <p className="text-center py-4">No pending properties found.</p>;
  }

  const getCategoryName = (property) => {
    if (property.description?.category) {
      if (typeof property.description.category === "object") {
        return property.description.category.name || "N/A";
      }
      return property.description.category;
    }
    return "N/A";
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [propertyId]: true }));
      const token = localStorage.getItem("adminToken");
      
      // Convert display status to API format (lowercase)
      const statusLower = newStatus.toLowerCase();
      
      await updateProperty(propertyId, { status: statusLower }, token);
      
      // Update local state
      setPendingProperties((prev) =>
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

  return (
    <>
      <table className="table-style3 table at-savesearch">
      <thead className="t-head">
        <tr>
          <th scope="col">Listing title</th>
          <th scope="col">Date Published</th>
          <th scope="col">Category</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody className="t-body">
        {pendingProperties.map((property) => (
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
              {getCategoryName(property)}
            </td>
            <td className="vam">
              <div className="d-flex">
                <Link
                  href={`/cmsadminlogin/pending-property/edit/${property._id}`}
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

      {/* Pagination */}
      <div className="mt30">
        <PendingPropertyPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </>
  );
};

export default PendingPropertyTable;

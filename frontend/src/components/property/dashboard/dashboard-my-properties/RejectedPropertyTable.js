"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { updateProperty } from "@/api/property";
import { getPropertyHref } from "@/utils/propertyRoute";

const rejectedPropertyData = [
  {
    id: 1,
    title: "Equestrian Family Home",
    imageSrc: "/images/listings/list-1.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$14,000/mo",
    datePublished: "December 31, 2022",
    status: "rejected",
  },
  {
    id: 2,
    title: "Luxury villa in Rego Park",
    imageSrc: "/images/listings/list-2.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$12,500/mo",
    datePublished: "January 15, 2023",
    status: "rejected",
  },
  {
    id: 3,
    title: "Villa on Hollywood Boulevard",
    imageSrc: "/images/listings/list-3.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$18,000/mo",
    datePublished: "February 1, 2023",
    status: "rejected",
  },
  {
    id: 4,
    title: "Modern Downtown Apartment",
    imageSrc: "/images/listings/list-4.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$9,500/mo",
    datePublished: "February 10, 2023",
    status: "rejected",
  },
  {
    id: 5,
    title: "Beachfront Luxury Condo",
    imageSrc: "/images/listings/list-5.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$22,000/mo",
    datePublished: "February 20, 2023",
    status: "rejected",
  },
];

const RejectedPropertyTable = () => {
  const [properties, setProperties] = useState(rejectedPropertyData);
  const [updatingStatus, setUpdatingStatus] = useState({});

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
          property.id === propertyId
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
          <tr key={property.id}>
            <th scope="row">
              <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                <div className="list-thumb">
                  <Image
                    width={110}
                    height={94}
                    className="w-100"
                    src={property.imageSrc}
                    alt="property"
                  />
                </div>
                <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                  <div className="h6 list-title">
                    <Link href={getPropertyHref(property)}>
                      {property.title}
                    </Link>
                  </div>
                  <p className="list-text mb-0">{property.location}</p>
                  <div className="list-price">
                    <a href="#">{property.price}</a>
                  </div>
                </div>
              </div>
            </th>
            <td className="vam">{property.datePublished}</td>
            <td className="vam">
              <select
                className="form-select show-tick"
                style={{ minWidth: "150px", fontSize: "13px" }}
                value={property.status || "rejected"}
                onChange={(e) => handleStatusChange(property.id, e.target.value)}
                disabled={updatingStatus[property.id]}
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </td>
            <td className="vam">{property.datePublished}</td>
            <td className="vam">
              <div className="d-flex">
                <Link
                  href={`/cmsadminlogin/rejected-property/edit/${property.id}`}
                  className="icon"
                  style={{ border: "none", textDecoration: "none", cursor: "pointer" }}
                  data-tooltip-id={`edit-${property.id}`}
                >
                  <span className="fas fa-pen fa" />
                </Link>
                <button
                  className="icon"
                  style={{ border: "none" }}
                  data-tooltip-id={`delete-${property.id}`}
                >
                  <span className="flaticon-bin" />
                </button>

                <ReactTooltip
                  id={`edit-${property.id}`}
                  place="top"
                  content="Edit"
                />
                <ReactTooltip
                  id={`delete-${property.id}`}
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

export default RejectedPropertyTable;


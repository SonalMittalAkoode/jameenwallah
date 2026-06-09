"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { getPropertyHref } from "@/utils/propertyRoute";

const assignedPropertyData = [
  {
    id: 1,
    title: "Equestrian Family Home",
    imageSrc: "/images/listings/list-1.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$14,000/mo",
    datePublished: "December 31, 2022",
    assignedTo: "John Smith",
  },
  {
    id: 2,
    title: "Luxury villa in Rego Park",
    imageSrc: "/images/listings/list-2.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$12,500/mo",
    datePublished: "January 15, 2023",
    assignedTo: "Sarah Johnson",
  },
  {
    id: 3,
    title: "Villa on Hollywood Boulevard",
    imageSrc: "/images/listings/list-3.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$18,000/mo",
    datePublished: "February 1, 2023",
    assignedTo: "Michael Brown",
  },
  {
    id: 4,
    title: "Modern Downtown Apartment",
    imageSrc: "/images/listings/list-4.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$9,500/mo",
    datePublished: "February 10, 2023",
    assignedTo: "Emily Davis",
  },
  {
    id: 5,
    title: "Beachfront Luxury Condo",
    imageSrc: "/images/listings/list-5.jpg",
    location: "Gurgaon, Haryana, India",
    price: "$22,000/mo",
    datePublished: "February 20, 2023",
    assignedTo: "David Wilson",
  },
];

const AssignedPropertyTable = () => {
  return (
    <table className="table-style3 table at-savesearch">
      <thead className="t-head">
        <tr>
          <th scope="col">Listing title</th>
          <th scope="col">Date Published</th>
          <th scope="col">Assigned To</th>
          <th scope="col">View</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody className="t-body">
        {assignedPropertyData.map((property) => (
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
                    <Link href={getPropertyHref(property)}>{property.title}</Link>
                  </div>
                  <p className="list-text mb-0">{property.location}</p>
                  <div className="list-price">
                    <a href="#">{property.price}</a>
                  </div>
                  <p className="list-text mb-0 mt-1" style={{ fontSize: "13px", color: "#666" }}>
                    Assigned To: <strong>{property.assignedTo}</strong>
                  </p>
                </div>
              </div>
            </th>
            <td className="vam">{property.datePublished}</td>
            <td className="vam">{property.assignedTo}</td>
            <td className="vam">{property.datePublished}</td>
            <td className="vam">
              <div className="d-flex">
                <Link
                  href={`/cmsadminlogin/assigned-property/edit/${property.id}`}
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

export default AssignedPropertyTable;


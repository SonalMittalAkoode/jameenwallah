"use client";
import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const enquiryListData = [
  {
    id: 1,
    name: "rAeQtiDlyqLJWtbyNfJRr",
    email: "uberixiyifl3@gmail.com",
    phone: "5370544351",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Oct 30, 2025, 05:30 AM",
    date: "Oct 30, 2025",
  },
  {
    id: 2,
    name: "HVRtZaTxMdpYFssp",
    email: "ienacolemanmt417@gmail.com",
    phone: "9576457880",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Oct 25, 2025, 05:30 AM",
    date: "Oct 26, 2025",
  },
  {
    id: 3,
    name: "Test",
    email: "priya.sonali@akoode.in",
    phone: "6202337371",
    subject: "Test",
    message: "Testing for analytics",
    meetingDateTime: "Oct 10, 2025, 12:00 AM",
    date: "Oct 10, 2025",
  },
  {
    id: 4,
    name: "Test",
    email: "test@example.com",
    phone: "9876543210",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Nov 15, 2025, 10:00 AM",
    date: "Nov 15, 2025",
  },
  {
    id: 5,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "9910377777",
    subject: "Property Inquiry",
    message: "Interested in viewing property",
    meetingDateTime: "Nov 20, 2025, 02:00 PM",
    date: "Nov 20, 2025",
  },
  {
    id: 6,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "0987654321",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Nov 25, 2025, 11:00 AM",
    date: "Nov 25, 2025",
  },
  {
    id: 7,
    name: "Sample User",
    email: "sample@example.com",
    phone: "1122334455",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Dec 01, 2025, 09:00 AM",
    date: "Dec 01, 2025",
  },
  {
    id: 8,
    name: "Demo User",
    email: "demo@example.com",
    phone: "5544332211",
    subject: "Question",
    message: "Need more information",
    meetingDateTime: "Dec 05, 2025, 03:00 PM",
    date: "Dec 05, 2025",
  },
  {
    id: 9,
    name: "Another User",
    email: "another@example.com",
    phone: "6677889900",
    subject: "NA",
    message: "NA",
    meetingDateTime: "Dec 10, 2025, 01:00 PM",
    date: "Dec 10, 2025",
  },
];

const EnquiryListTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(enquiryListData.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = enquiryListData.slice(startIndex, endIndex);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col" style={{ textAlign: "left" }}>Name</th>
              <th scope="col" style={{ textAlign: "left" }}>Email</th>
              <th scope="col" style={{ textAlign: "left" }}>Phone</th>
              <th scope="col" style={{ textAlign: "left" }}>Subject</th>
              <th scope="col" style={{ textAlign: "left" }}>Message</th>
              <th scope="col" style={{ textAlign: "left" }}>Meeting Date Time</th>
              <th scope="col" style={{ textAlign: "left" }}>Date</th>
              <th scope="col" style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {currentData.map((enquiry) => (
              <tr key={enquiry.id}>
                <td style={{ textAlign: "left" }}>
                  <div className="h6 list-title">
                    {enquiry.name}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title">
                    {enquiry.email}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title">
                    {enquiry.phone}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title">
                    {enquiry.subject}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {enquiry.message}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title">
                    {enquiry.meetingDateTime}
                  </div>
                </td>
                <td style={{ textAlign: "left" }}>
                  <div className="list-title">
                    {enquiry.date}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="icon"
                    style={{ border: "none", background: "none", cursor: "pointer" }}
                    data-tooltip-id={`delete-${enquiry.id}`}
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this enquiry?")) {
                        // TODO: Add delete API call
                      }
                    }}
                  >
                    <span className="flaticon-bin" style={{ color: "#6c757d" }} />
                  </button>
                  <ReactTooltip
                    id={`delete-${enquiry.id}`}
                    place="top"
                    content="Delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mbp_pagination text-center mt30">
        <ul className="page_navigation">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <span
              className="page-link pointer"
              onClick={() => handlePageClick(currentPage - 1)}
            >
              <span className="fas fa-angle-left" />
            </span>
          </li>
          <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
            <span
              className="page-link pointer"
              onClick={() => handlePageClick(1)}
            >
              1
            </span>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <span
              className="page-link pointer"
              onClick={() => handlePageClick(currentPage + 1)}
            >
              <span className="fas fa-angle-right" />
            </span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default EnquiryListTable;


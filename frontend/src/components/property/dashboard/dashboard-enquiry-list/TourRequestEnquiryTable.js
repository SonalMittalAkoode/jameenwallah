"use client";

import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTourType = (tourType) => {
  if (!tourType) return "—";
  if (tourType === "in-person") return "In Person";
  if (tourType === "video-chat") return "Video Chat";
  // Fallback: capitalize first letter of each word
  return tourType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const TourRequestEnquiryTable = ({ enquiries, loading, error, onRetry }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [enquiries]);

  const totalPages = useMemo(() => {
    if (!Array.isArray(enquiries) || enquiries.length === 0) return 1;
    return Math.ceil(enquiries.length / ITEMS_PER_PAGE);
  }, [enquiries]);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(enquiries)) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return enquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [enquiries, currentPage]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          Loading tour request enquiries…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p style={{ color: "#dc3545", fontSize: "16px", marginBottom: "16px" }}>
          {error}
        </p>
        {onRetry && (
          <button className="ud-btn btn-thm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col" style={{ textAlign: "left" }}>
                Name
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Email
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Phone
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Tour Type
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Tour Date
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Budget
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Date
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Property
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Agent
              </th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedData.length > 0 ? (
              paginatedData.map((enquiry) => (
                <tr key={enquiry._id || enquiry.id}>
                  <td style={{ textAlign: "left" }}>
                    <div className="h6 list-title mb-0">
                      {enquiry.name || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div
                      className="list-title mb-0"
                      style={{ wordBreak: "break-word" }}
                    >
                      {enquiry.email || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {enquiry.phoneNumber || enquiry.phone || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatTourType(enquiry.tourType)}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatDateTime(enquiry.preferredTourDate)}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {enquiry.budget || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatDate(enquiry.createdAt || enquiry.date)}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", maxWidth: "260px" }}>
                    <div className="list-title mb-0">
                      {enquiry.property?.description?.title ||
                        enquiry.property?.details?.customId ||
                        "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", maxWidth: "240px" }}>
                    <div className="list-title mb-0">
                      {enquiry.assignedAgent?.name || "Unassigned"}
                    </div>
                    {enquiry.assignedAgent?.phoneNumber && (
                      <div
                        className="text"
                        style={{ fontSize: "13px", color: "#6c757d" }}
                      >
                        {enquiry.assignedAgent.phoneNumber}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                  <p style={{ margin: 0, color: "#6c757d" }}>
                    No tour request enquiries found yet.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginatedData.length > 0 && totalPages > 1 && (
        <div className="mbp_pagination text-center mt30">
          <ul className="page_navigation">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <span
                className="page-link pointer"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              >
                <span className="fas fa-angle-left" />
              </span>
            </li>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <span className="page-link pointer" onClick={() => setCurrentPage(page)}>
                  {page}
                </span>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <span
                className="page-link pointer"
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
              >
                <span className="fas fa-angle-right" />
              </span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default TourRequestEnquiryTable;


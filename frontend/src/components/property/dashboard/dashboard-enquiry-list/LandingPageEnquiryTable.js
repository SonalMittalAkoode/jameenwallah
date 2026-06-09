"use client";

import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LandingPageEnquiryTable = ({
  enquiries,
  loading,
  error,
  onRetry,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [enquiries]);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(enquiries)) {
      return [];
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return enquiries.slice(startIndex, endIndex);
  }, [enquiries, currentPage]);

  const totalPages = useMemo(() => {
    if (!Array.isArray(enquiries) || enquiries.length === 0) {
      return 1;
    }

    return Math.ceil(enquiries.length / ITEMS_PER_PAGE);
  }, [enquiries]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          Loading landing page enquiries…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p style={{ color: "#dc3545", fontSize: "16px", marginBottom: "16px" }}>
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load landing page enquiries."}
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
                Message
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Time
              </th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedData.length > 0 ? (
              paginatedData.map((enquiry) => (
                <tr key={enquiry._id || enquiry.id}>
                  <td style={{ textAlign: "left", maxWidth: "220px" }}>
                    <div className="h6 list-title mb-0">
                      {enquiry.name || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", maxWidth: "260px" }}>
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
                  <td style={{ textAlign: "left", maxWidth: "280px" }}>
                    <div
                      className="list-title mb-0"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={enquiry.message || ""}
                    >
                      {enquiry.message || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatDateTime(enquiry.createdAt || enquiry.time)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                  <p style={{ margin: 0, color: "#6c757d" }}>
                    No landing page enquiries found yet.
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
                <span
                  className="page-link pointer"
                  onClick={() => setCurrentPage(page)}
                >
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

export default LandingPageEnquiryTable;


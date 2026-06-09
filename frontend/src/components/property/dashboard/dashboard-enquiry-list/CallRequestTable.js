"use client";

import { useEffect, useMemo, useState } from "react";
import { updateCallRequest } from "@/api/callRequest";

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["new", "contacted", "closed"];

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CallRequestTable = ({ requests, loading, error, onRetry }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState("");
  const [localRows, setLocalRows] = useState([]);

  useEffect(() => {
    setLocalRows(Array.isArray(requests) ? requests : []);
    setCurrentPage(1);
  }, [requests]);

  const totalPages = useMemo(() => {
    if (!localRows.length) return 1;
    return Math.ceil(localRows.length / ITEMS_PER_PAGE);
  }, [localRows.length]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return localRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [localRows, currentPage]);

  const handleStatusChange = async (id, status) => {
    const token = window.localStorage.getItem("adminToken");
    if (!token || !id) return;

    setUpdatingId(id);
    try {
      const response = await updateCallRequest(token, id, { status });
      const nextRow = response?.data;
      if (nextRow) {
        setLocalRows((rows) =>
          rows.map((row) => (row._id === id ? { ...row, ...nextRow } : row))
        );
      }
    } catch (err) {
      console.error("Failed to update call request", err);
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          Loading call requests…
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
              <th scope="col" style={{ textAlign: "left" }}>Name</th>
              <th scope="col" style={{ textAlign: "left" }}>Phone Number</th>
              <th scope="col" style={{ textAlign: "left" }}>Service</th>
              <th scope="col" style={{ textAlign: "left" }}>Source Page</th>
              <th scope="col" style={{ textAlign: "left" }}>Status</th>
              <th scope="col" style={{ textAlign: "left" }}>Time</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedData.length ? (
              paginatedData.map((request) => (
                <tr key={request._id || request.id}>
                  <td style={{ textAlign: "left", maxWidth: 220 }}>
                    <div className="h6 list-title mb-0">{request.name || "—"}</div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <a
                      href={request.phoneNumber ? `tel:${request.phoneNumber}` : undefined}
                      className="list-title mb-0"
                    >
                      {request.phoneNumber || "—"}
                    </a>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">{request.service || "—"}</div>
                  </td>
                  <td style={{ textAlign: "left", maxWidth: 260 }}>
                    <div
                      className="list-title mb-0"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={request.sourcePage || ""}
                    >
                      {request.sourcePage || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", minWidth: 150 }}>
                    <select
                      className="form-select"
                      value={request.status || "new"}
                      disabled={updatingId === request._id}
                      onChange={(event) => handleStatusChange(request._id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatDateTime(request.createdAt)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                  <p style={{ margin: 0, color: "#6c757d" }}>
                    No call requests found yet.
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
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <span className="page-link pointer" onClick={() => setCurrentPage(page)}>
                  {page}
                </span>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <span
                className="page-link pointer"
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
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

export default CallRequestTable;

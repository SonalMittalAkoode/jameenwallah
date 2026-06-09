"use client";

import { useEffect, useMemo, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { updateSubscriber, deleteSubscriber } from "@/api/subscribe";

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

const SubscriberTable = ({ subscribers, loading, error, onRetry }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [subscribers]);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(subscribers)) {
      return [];
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return subscribers.slice(startIndex, endIndex);
  }, [subscribers, currentPage]);

  const totalPages = useMemo(() => {
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return 1;
    }

    return Math.ceil(subscribers.length / ITEMS_PER_PAGE);
  }, [subscribers]);

  const getAdminToken = () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("adminToken");
  };

  const handleToggleStatus = async (subscriber) => {
    try {
      const token = getAdminToken();
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const id = subscriber._id || subscriber.id;
      setActionLoadingId(id);

      await updateSubscriber(id, !subscriber.isActive, token);

      if (onRetry) {
        await onRetry();
      }
    } catch (err) {
      console.error("Failed to update subscriber status:", err);
      alert(err.message || "Failed to update subscriber status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteClick = async (subscriber) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete subscriber "${subscriber.email}"?`
    );
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const id = subscriber._id || subscriber.id;
      setActionLoadingId(id);

      await deleteSubscriber(id, token);

      if (onRetry) {
        await onRetry();
      }
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
      alert(err.message || "Failed to delete subscriber.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          Loading subscribers…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p
          style={{ color: "#dc3545", fontSize: "16px", marginBottom: "16px" }}
        >
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load subscribers."}
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
                Email
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Status
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Subscribed On
              </th>
              <th scope="col" style={{ textAlign: "right" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedData.length > 0 ? (
              paginatedData.map((subscriber) => (
                <tr key={subscriber._id || subscriber.id}>
                  <td style={{ textAlign: "left", maxWidth: "260px" }}>
                    <div
                      className="list-title mb-0"
                      style={{ wordBreak: "break-word" }}
                    >
                      {subscriber.email || "—"}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <span
                      className={`badge ${
                        subscriber.isActive !== false ? "badge-success" : "badge-secondary"
                      }`}
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "500",
                        backgroundColor: subscriber.isActive !== false ? "#d1fae5" : "#e5e7eb",
                        color: subscriber.isActive !== false ? "#065f46" : "#374151",
                      }}
                    >
                      {subscriber.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div className="list-title mb-0">
                      {formatDateTime(subscriber.createdAt)}
                    </div>
                  </td>
                  <td className="vam" style={{ textAlign: "right" }}>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="icon"
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
                        data-tooltip-id={`edit-subscriber-${subscriber._id || subscriber.id}`}
                        onClick={() => handleToggleStatus(subscriber)}
                        disabled={actionLoadingId === (subscriber._id || subscriber.id)}
                      >
                        <span
                          className="fas fa-pen fa"
                          style={{ color: "#6c757d" }}
                        />
                      </button>
                      <button
                        type="button"
                        className="icon"
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                        }}
                        data-tooltip-id={`delete-subscriber-${subscriber._id || subscriber.id}`}
                        onClick={() => handleDeleteClick(subscriber)}
                        disabled={actionLoadingId === (subscriber._id || subscriber.id)}
                      >
                        <span
                          className="flaticon-bin"
                          style={{ color: "#6c757d" }}
                        />
                      </button>

                      <ReactTooltip
                        id={`edit-subscriber-${subscriber._id || subscriber.id}`}
                        place="top"
                        content="Toggle Active / Inactive"
                      />
                      <ReactTooltip
                        id={`delete-subscriber-${subscriber._id || subscriber.id}`}
                        place="top"
                        content="Delete"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  <p style={{ margin: 0, color: "#6c757d" }}>
                    No subscribers found yet.
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
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
              >
                <span className="fas fa-angle-left" />
              </span>
            </li>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <li
                  key={page}
                  className={`page-item ${
                    currentPage === page ? "active" : ""
                  }`}
                >
                  <span
                    className="page-link pointer"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </span>
                </li>
              )
            )}
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

export default SubscriberTable;



"use client";
import Link from "next/link";
import React, { useCallback, useState, useEffect } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { getAllFinancers, deleteFinancer } from "@/api/financer";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 300;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FinancerListTable = () => {
  const [financers, setFinancers] = useState([]);
  const [filteredFinancers, setFilteredFinancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchFinancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await getAllFinancers(token);
      
      if (response.status === "success" && response.data) {
        setFinancers(response.data);
        setFilteredFinancers(response.data);
        const pages = Math.max(1, Math.ceil(response.data.length / ITEMS_PER_PAGE));
        setTotalPages(pages);
        setCurrentPage((prev) => (prev > pages ? 1 : prev));
      } else {
        setError("Failed to fetch financers");
      }
    } catch (err) {
      console.error("Error fetching financers:", err);
      setError(err.response?.data?.message || "Failed to fetch financers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancers();
  }, [fetchFinancers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim().toLowerCase();
      setSearchTerm(term);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const filtered = financers.filter((financer) => {
      const name = financer.name?.toLowerCase() || "";
      const email = financer.email?.toLowerCase() || "";
      const phone = financer.phoneNumber?.toLowerCase?.() || "";
      const status = financer.status?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        status === searchTerm;

      const matchesStatusFilter =
        !statusFilter || status === statusFilter;

      return matchesSearch && matchesStatusFilter;
    });

    setFilteredFinancers(filtered);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    setTotalPages(pages);

    if (total === 0) {
      setCurrentPage(1);
    } else if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [searchTerm, statusFilter, financers, currentPage]);

  const handleDelete = async (financerId) => {
    if (!confirm("Are you sure you want to delete this financer?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      await deleteFinancer(financerId, token);
      alert("Financer deleted successfully!");
      fetchFinancers();
    } catch (err) {
      console.error("Error deleting financer:", err);
      alert(err.response?.data?.message || "Failed to delete financer");
    }
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get paginated financers
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFinancers = filteredFinancers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading financers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          className="ud-btn btn-thm mt-3"
          onClick={fetchFinancers}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard_search_meta d-flex flex-column flex-md-row align-items-md-center justify-content-end gap-2 mb20">
        <div className="search_area w-100" style={{ maxWidth: "360px" }}>
          <input
            type="text"
            className="form-control bdrs12"
            placeholder="Search financers"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
          />
          <label>
            <span className="flaticon-search" />
          </label>
        </div>

        <div className="d-flex gap-2 align-items-center" style={{ maxWidth: "220px" }}>
          <label
            htmlFor="financerStatusFilter"
            className="mb-0 text-nowrap"
            style={{ fontSize: "14px", color: "#6c757d" }}
          >
            Status:
          </label>
          <select
            id="financerStatusFilter"
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredFinancers.length === 0 ? (
        <div
          className="text-center py-4"
          style={{
            padding: "60px 20px",
            color: "#6c757d",
            fontSize: "16px",
          }}
        >
          <p style={{ margin: 0 }}>No financers found.</p>
        </div>
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col" style={{ textAlign: "left" }}>Name</th>
              <th scope="col" style={{ textAlign: "left" }}>Email</th>
              <th scope="col" style={{ textAlign: "left" }}>Phone Number</th>
              <th scope="col" style={{ textAlign: "left" }}>Date</th>
              <th scope="col" style={{ textAlign: "left" }}>Status</th>
              <th scope="col" style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedFinancers.map((financer) => (
              <tr key={financer._id}>
                <th scope="row" style={{ textAlign: "left" }}>
                  <div className="h6 list-title">
                    {financer.name}
                  </div>
                </th>
                <td className="vam" style={{ textAlign: "left" }}>
                  {financer.email || "N/A"}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  {financer.phoneNumber || "N/A"}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  {formatDate(financer.createdAt)}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  <span
                    style={{
                      backgroundColor: financer.status === "active" ? "#28a745" : "#6c757d",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}
                  >
                    {financer.status || "Active"}
                  </span>
                </td>
                <td className="vam" style={{ textAlign: "right" }}>
                  <div className="d-flex justify-content-end gap-2">
                    <Link
                      href={`/cmsadminlogin/add-financer?edit=${financer._id}`}
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`edit-${financer._id}`}
                    >
                      <span className="fas fa-pen fa" style={{ color: "#6c757d" }} />
                    </Link>
                    <button
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`delete-${financer._id}`}
                      onClick={() => handleDelete(financer._id)}
                    >
                      <span className="flaticon-bin" style={{ color: "#6c757d" }} />
                    </button>

                    <ReactTooltip
                      id={`edit-${financer._id}`}
                      place="top"
                      content="Edit"
                    />
                    <ReactTooltip
                      id={`delete-${financer._id}`}
                      place="top"
                      content="Delete"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <span
                  className="page-link pointer"
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </span>
              </li>
            ))}
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
      )}
    </>
  );
};

export default FinancerListTable;


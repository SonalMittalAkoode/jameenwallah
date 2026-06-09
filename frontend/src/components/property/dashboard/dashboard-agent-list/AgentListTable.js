"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { deleteAgent, getAllAgents } from "@/api/agent";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 300;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AgentListTable = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }
      const response = await getAllAgents(token);
      if (response?.status === "success" && Array.isArray(response.data)) {
        setAgents(response.data);
        setFilteredAgents(response.data);
        const pages = Math.max(1, Math.ceil(response.data.length / ITEMS_PER_PAGE));
        setTotalPages(pages);
        setCurrentPage((prev) => (prev > pages ? 1 : prev));
      } else {
        setError("Failed to fetch agents");
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const filtered = agents.filter((agent) => {
      const name = agent.name?.toLowerCase() || "";
      const email = agent.email?.toLowerCase() || "";
      const phone = String(agent.phoneNumber || "").toLowerCase();
      const status = agent.status?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm);

      const matchesStatusFilter = !statusFilter || status === statusFilter;

      return matchesSearch && matchesStatusFilter;
    });

    setFilteredAgents(filtered);
    const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setTotalPages(pages);
    if (filtered.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [searchTerm, statusFilter, agents, currentPage]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
      await deleteAgent(id, token);
      alert("Agent deleted successfully.");
      fetchAgents();
    } catch (err) {
      console.error("Error deleting agent:", err);
      alert(err.response?.data?.message || "Failed to delete agent");
    }
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading agents…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p style={{ color: "red" }}>Error: {error}</p>
        <button type="button" className="ud-btn btn-thm mt-3" onClick={fetchAgents}>
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
            placeholder="Search agents"
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
            htmlFor="agentStatusFilter"
            className="mb-0 text-nowrap"
            style={{ fontSize: "14px", color: "#6c757d" }}
          >
            Status:
          </label>
          <select
            id="agentStatusFilter"
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

      {filteredAgents.length === 0 ? (
        <div
          className="text-center py-4"
          style={{ padding: "60px 20px", color: "#6c757d", fontSize: "16px" }}
        >
          <p style={{ margin: 0 }}>No agents found.</p>
        </div>
      ) : (
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
                Date
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Status
              </th>
              <th scope="col" style={{ textAlign: "right" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedAgents.map((agent) => (
              <tr key={agent._id}>
                <th scope="row" style={{ textAlign: "left" }}>
                  <div className="h6 list-title">{agent.name}</div>
                </th>
                <td className="vam" style={{ textAlign: "left" }}>
                  {agent.email || "N/A"}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  {agent.phoneNumber || "N/A"}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  {formatDate(agent.createdAt)}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  <span
                    style={{
                      backgroundColor: agent.status === "active" ? "#28a745" : "#6c757d",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}
                  >
                    {agent.status || "—"}
                  </span>
                </td>
                <td className="vam" style={{ textAlign: "right" }}>
                  <div className="d-flex justify-content-end gap-2">
                    <Link
                      href={`/cmsadminlogin/add-broker?edit=${agent._id}`}
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`edit-agent-${agent._id}`}
                    >
                      <span className="fas fa-pen fa" style={{ color: "#6c757d" }} />
                    </Link>
                    <button
                      type="button"
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`delete-agent-${agent._id}`}
                      onClick={() => handleDelete(agent._id)}
                    >
                      <span className="flaticon-bin" style={{ color: "#6c757d" }} />
                    </button>
                    <ReactTooltip id={`edit-agent-${agent._id}`} place="top" content="Edit" />
                    <ReactTooltip id={`delete-agent-${agent._id}`} place="top" content="Delete" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
                <span className="page-link pointer" onClick={() => handlePageClick(page)}>
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

export default AgentListTable;

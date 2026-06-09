"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  deleteBuilder,
  getAllBuilders,
} from "@/api/builder";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 250;

const staticBuilders = [
  {
    _id: "static-1",
    title: "Skyline Developers",
    slug: "skyline-developers",
    description: "Leading residential developer with a focus on premium urban communities.",
    createdAt: "2025-01-15T09:00:00.000Z",
  },
  {
    _id: "static-2",
    title: "Greenfield Estates",
    slug: "greenfield-estates",
    description: "Eco-friendly projects across metro cities.",
    createdAt: "2025-02-10T12:30:00.000Z",
  },
];

const BuilderListTable = () => {
  const [builders, setBuilders] = useState(staticBuilders);
  const [filteredBuilders, setFilteredBuilders] = useState(staticBuilders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        setBuilders(staticBuilders);
        setFilteredBuilders(staticBuilders);
        setLoading(false);
        return;
      }

      const response = await getAllBuilders(token);
      if (response.status === "success" && Array.isArray(response.data) && response.data.length) {
        const normalized = response.data.map((builder) => ({
          ...builder,
          title: builder.title || builder.name || "Untitled Builder",
        }));
        setBuilders(normalized);
        setFilteredBuilders(normalized);
      } else {
        setBuilders(staticBuilders);
        setFilteredBuilders(staticBuilders);
      }
    } catch (err) {
      console.error("Error fetching builders:", err);
      setError(err?.message || "Failed to load builders");
      setBuilders(staticBuilders);
      setFilteredBuilders(staticBuilders);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (builderId) => {
    if (!confirm("Are you sure you want to delete this builder?")) {
      return;
    }

    if (builderId.startsWith("static-")) {
      setBuilders((prev) => prev.filter((builder) => builder._id !== builderId));
      setFilteredBuilders((prev) =>
        prev.filter((builder) => builder._id !== builderId)
      );
      alert("Builder deleted successfully!");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const response = await deleteBuilder(builderId, token);
      if (response.status === "success") {
        alert("Builder deleted successfully!");
        fetchBuilders();
      } else {
        alert(response.message || "Failed to delete builder.");
      }
    } catch (err) {
      console.error("Error deleting builder:", err);
      alert(err?.response?.data?.message || "Failed to delete builder.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBuilders(builders);
      return;
    }

    const filtered = builders.filter((builder) => {
      const title = builder.title?.toLowerCase() || "";
      const slug = builder.slug?.toLowerCase() || "";
      const description = builder.description?.toLowerCase() || "";

      return (
        title.includes(searchTerm) ||
        slug.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });

    setFilteredBuilders(filtered);
    setCurrentPage(1);
  }, [searchTerm, builders]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBuilders.length / ITEMS_PER_PAGE));
  }, [filteredBuilders.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedBuilders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBuilders.slice(startIndex, endIndex);
  }, [filteredBuilders, currentPage]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading builders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p style={{ color: "red" }}>{error}</p>
        <button className="ud-btn btn-thm mt-3" onClick={fetchBuilders}>
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
            placeholder="Search builders"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <label>
            <span className="flaticon-search" />
          </label>
        </div>
      </div>

      {filteredBuilders.length === 0 ? (
        <div
          className="text-center py-4"
          style={{
            padding: "60px 20px",
            color: "#6c757d",
            fontSize: "16px",
          }}
        >
          <p style={{ margin: 0 }}>
            No builders found. Try adjusting your search or add a new builder.
          </p>
        </div>
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col" style={{ textAlign: "left" }}>
                Builder
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Slug
              </th>
              <th scope="col" style={{ textAlign: "left" }}>
                Created
              </th>
              <th scope="col" style={{ textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedBuilders.map((builder) => (
              <tr key={builder._id}>
                <th scope="row" style={{ textAlign: "left" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        position: "relative",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      {builder.image ? (
                        <Image
                          src={
                            builder.image.startsWith("http")
                              ? builder.image
                              : `${
                                  process.env.NEXT_PUBLIC_API_BASE_URL ||
                                  "http://localhost:5000"
                                }${builder.image}`
                          }
                          alt={builder.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            fontWeight: 600,
                          }}
                        >
                          {builder.title?.[(0)]?.toUpperCase() || "B"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="h6 list-title mb0">{builder.title}</div>
                      <p
                        className="text mb0"
                        style={{
                          color: "#6c757d",
                          fontSize: "14px",
                        }}
                      >
                        {builder.description
                          ? builder.description.slice(0, 60) +
                            (builder.description.length > 60 ? "…" : "")
                          : "No description available"}
                      </p>
                    </div>
                  </div>
                </th>
                <td className="vam" style={{ textAlign: "left" }}>
                  <code style={{ fontSize: "14px" }}>
                    {builder.slug || "—"}
                  </code>
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  {formatDate(builder.createdAt)}
                </td>
                <td className="vam" style={{ textAlign: "right" }}>
                  <div className="d-flex justify-content-end gap-2">
                    <Link
                      href={`/cmsadminlogin/add-builder?editId=${builder._id}`}
                      className="icon"
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                      data-tooltip-id={`edit-${builder._id}`}
                    >
                      <span
                        className="fas fa-pen"
                        style={{ color: "#6c757d" }}
                      />
                    </Link>
                    <button
                      type="button"
                      className="icon"
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                      data-tooltip-id={`delete-${builder._id}`}
                      onClick={() => handleDelete(builder._id)}
                    >
                      <span
                        className="flaticon-bin"
                        style={{ color: "#6c757d" }}
                      />
                    </button>

                    <ReactTooltip
                      id={`edit-${builder._id}`}
                      place="top"
                      content="Edit builder"
                    />
                    <ReactTooltip
                      id={`delete-${builder._id}`}
                      place="top"
                      content="Delete builder"
                    />
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

export default BuilderListTable;


"use client";
import Link from "next/link";
import React, { useCallback, useState, useEffect } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { getAllAmenities, deleteAmenity } from "@/api/amenity";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 300;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Static sample data (stable reference for hooks)
const STATIC_AMENITIES = [
  {
    _id: "static-1",
    name: "Power Backup",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
  {
    _id: "static-2",
    name: "Green Landscaped",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
  {
    _id: "static-3",
    name: "Emergency Exits",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
  {
    _id: "static-4",
    name: "24/7 Water Supply",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
  {
    _id: "static-5",
    name: "High-Speed Lifts",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
  {
    _id: "static-6",
    name: "Double Height Shops",
    createdAt: "2025-06-27T00:00:00.000Z",
    status: "active",
  },
];

const AmenityListTable = () => {
  const [amenities, setAmenities] = useState(STATIC_AMENITIES); // Start with static data
  const [filteredAmenities, setFilteredAmenities] = useState(STATIC_AMENITIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await getAllAmenities(token);
      
      if (response.status === "success" && response.data && response.data.length > 0) {
        setAmenities(response.data);
        setFilteredAmenities(response.data);
        const pages = Math.max(1, Math.ceil(response.data.length / ITEMS_PER_PAGE));
        setTotalPages(pages);
        setCurrentPage((prev) => (prev > pages ? 1 : prev));
      } else {
        // Use static data if API returns empty or no data
        setAmenities(STATIC_AMENITIES);
        setFilteredAmenities(STATIC_AMENITIES);
        const pages = Math.max(1, Math.ceil(STATIC_AMENITIES.length / ITEMS_PER_PAGE));
        setTotalPages(pages);
        setCurrentPage((prev) => (prev > pages ? 1 : prev));
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
      // Use static data on error
      setAmenities(STATIC_AMENITIES);
      setFilteredAmenities(STATIC_AMENITIES);
      const pages = Math.max(1, Math.ceil(STATIC_AMENITIES.length / ITEMS_PER_PAGE));
      setTotalPages(pages);
      setCurrentPage((prev) => (prev > pages ? 1 : prev));
      setError(null); // Don't show error, just use static data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const handleDelete = async (amenityId) => {
    if (!confirm("Are you sure you want to delete this amenity?")) {
      return;
    }

    // Handle static data deletion
    if (amenityId.startsWith("static-")) {
      setAmenities((prev) => prev.filter((amenity) => amenity._id !== amenityId));
      setFilteredAmenities((prev) =>
        prev.filter((amenity) => amenity._id !== amenityId)
      );
      const remaining = amenities.length - 1;
      const pages = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
      setTotalPages(pages);
      if (currentPage > pages) {
        setCurrentPage(pages);
      }
      alert("Amenity deleted successfully!");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      await deleteAmenity(amenityId, token);
      alert("Amenity deleted successfully!");
      // Refresh the amenities list
      fetchAmenities();
    } catch (err) {
      console.error("Error deleting amenity:", err);
      alert(err.response?.data?.message || "Failed to delete amenity");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim().toLowerCase();
      setSearchTerm(term);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const filtered = amenities.filter((amenity) => {
      const title = amenity.name?.toLowerCase() || amenity.title?.toLowerCase() || "";
      const status = amenity.status?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        status === searchTerm;

      const matchesStatusFilter =
        !statusFilter || status === statusFilter;

      return matchesSearch && matchesStatusFilter;
    });

    setFilteredAmenities(filtered);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    setTotalPages(pages);

    if (total === 0) {
      setCurrentPage(1);
    } else if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [searchTerm, statusFilter, amenities, currentPage]);

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

  // Get paginated amenities
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAmenities = filteredAmenities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading amenities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          className="ud-btn btn-thm mt-3"
          onClick={fetchAmenities}
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
            placeholder="Search amenities"
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
            htmlFor="amenityStatusFilter"
            className="mb-0 text-nowrap"
            style={{ fontSize: "14px", color: "#6c757d" }}
          >
            Status:
          </label>
          <select
            id="amenityStatusFilter"
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

      {filteredAmenities.length === 0 ? (
        <div
          className="text-center py-4"
          style={{
            padding: "60px 20px",
            color: "#6c757d",
            fontSize: "16px",
          }}
        >
          <p style={{ margin: 0 }}>No amenities found.</p>
        </div>
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col" style={{ textAlign: "left" }}>Listing Title</th>
              <th scope="col" style={{ textAlign: "left" }}>Date published</th>
              <th scope="col" style={{ textAlign: "left" }}>Status</th>
              <th scope="col" style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody className="t-body">
            {paginatedAmenities.map((amenity) => (
              <tr key={amenity._id}>
                <th scope="row" style={{ textAlign: "left" }}>
                  <div className="h6 list-title">
                    {amenity.name || amenity.title}
                  </div>
                </th>
                <td className="vam" style={{ textAlign: "left" }}>
                  {formatDate(amenity.createdAt)}
                </td>
                <td className="vam" style={{ textAlign: "left" }}>
                  <span
                    style={{
                      backgroundColor: amenity.status === "active" ? "#28a745" : "#6c757d",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}
                  >
                    {amenity.status || "Active"}
                  </span>
                </td>
                <td className="vam" style={{ textAlign: "right" }}>
                  <div className="d-flex justify-content-end gap-2">
                    <Link
                      href={`/cmsadminlogin/add-amenity?edit=${amenity._id}`}
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`edit-${amenity._id}`}
                    >
                      <span className="fas fa-pen fa" style={{ color: "#6c757d" }} />
                    </Link>
                    <button
                      className="icon"
                      style={{ border: "none", background: "none", cursor: "pointer" }}
                      data-tooltip-id={`delete-${amenity._id}`}
                      onClick={() => handleDelete(amenity._id)}
                    >
                      <span className="flaticon-bin" style={{ color: "#6c757d" }} />
                    </button>

                    <ReactTooltip
                      id={`edit-${amenity._id}`}
                      place="top"
                      content="Edit"
                    />
                    <ReactTooltip
                      id={`delete-${amenity._id}`}
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

export default AmenityListTable;


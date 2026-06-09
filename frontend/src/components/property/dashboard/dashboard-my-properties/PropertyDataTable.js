"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  getAllProperties,
  deletePropertyByAdmin,
} from "@/api/property";
import FilterHeader from "./FilterHeader";

const statusStyles = {
  pending: "pending-style style1",
  verified: "pending-style style2",
  assigned: "pending-style style1",
  rejected: "pending-style style3",
  sold: "pending-style style2",
};

const getStatusStyle = (status) =>
  statusStyles[status?.toLowerCase?.()] || "pending-style style1";

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveMediaUrl = (path) => {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const extractImage = (media) => {
  if (Array.isArray(media?.images) && media.images.length > 0) {
    const firstValidImage = media.images.find(
      (imagePath) => typeof imagePath === "string" && imagePath.trim()
    );

    const resolved = resolveMediaUrl(firstValidImage);
    if (resolved) {
      return resolved;
    }
  }
  return "/images/listings/list-1.jpg";
};

const extractLocation = (location) => {
  if (!location) return "N/A";
  const parts = [
    typeof location.city === "object" ? location.city?.name : location.city,
    typeof location.state === "object" ? location.state?.name : location.state,
  ]
    .filter(Boolean)
    .join(", ");
  return parts || "N/A";
};

const mapPropertyToRow = (property) => ({
  id: property._id || property.id,
  title: property.description?.title || "Untitled Property",
  imageSrc: extractImage(property.media),
  location: extractLocation(property.location),
  price: formatCurrency(property.description?.price),
  status: property.status || "pending",
  datePublished: formatDate(property.createdAt),
  createdBy: property.createdBy || "user",
});

const statusFilterOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" },
];

const sortOptionsList = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "-description.price", label: "Price (high to low)" },
  { value: "description.price", label: "Price (low to high)" },
];

const pageSizeOptions = [10, 20, 50];

const PropertyDataTable = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: pageSizeOptions[0],
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState(sortOptionsList[0].value);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev
      );

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("adminToken")
            : null;

        if (!token) {
          if (!isMounted) return;
          setError("Admin authentication required. Please log in again.");
          setProperties([]);
          setPagination((prev) => ({
            ...prev,
            total: 0,
            page: 1,
            limit: pageSize,
            totalPages: 0,
          }));
          return;
        }

        const params = {
          page: currentPage,
          limit: pageSize,
          sort: sortOption,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await getAllProperties(token, params);

        if (!isMounted) return;

        const data = Array.isArray(response?.data) ? response.data : [];
        const paginationInfo = {
          total: response?.pagination?.total ?? data.length,
          page: response?.pagination?.page ?? currentPage,
          limit: response?.pagination?.limit ?? pageSize,
          totalPages:
            response?.pagination?.totalPages ??
            (data.length > 0 ? Math.ceil(data.length / pageSize) : 0),
        };

        if (
          paginationInfo.totalPages > 0 &&
          currentPage > paginationInfo.totalPages
        ) {
          setCurrentPage(paginationInfo.totalPages);
          return;
        }

        if (paginationInfo.total === 0 && currentPage !== 1) {
          setCurrentPage(1);
          return;
        }

        setProperties(data.map(mapPropertyToRow));
        setPagination(paginationInfo);

        if (paginationInfo.page && paginationInfo.page !== currentPage) {
          setCurrentPage(paginationInfo.page);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load properties:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load property list."
        );
        setProperties([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          page: 1,
          limit: pageSize,
          totalPages: 0,
        }));
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    statusFilter,
    sortOption,
    refreshToken,
  ]);

  const totalItems = pagination.total ?? properties.length;
  const limit = pagination.limit ?? pageSize;
  const totalPages =
    pagination.totalPages ??
    (totalItems > 0 ? Math.ceil(totalItems / limit) : 0);

  const pageNumbers = useMemo(() => {
    if (!totalPages || totalPages <= 1) {
      return [];
    }

    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const numbers = [];
    for (let i = start; i <= end; i += 1) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages, currentPage]);

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(startItem + limit - 1, totalItems);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (!page || page === currentPage) return;
    if (page < 1) return;
    if (totalPages && page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRetry = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const handleDelete = async (propertyId) => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            "Are you sure you want to delete this property? This action cannot be undone."
          );

    if (!confirmed) {
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    if (!token) {
      setFeedback({
        type: "error",
        message: "Admin authentication required. Please log in again.",
      });
      return;
    }

    try {
      setDeletingId(propertyId);
      setFeedback({ type: "", message: "" });
      await deletePropertyByAdmin(propertyId, token);
      setProperties((prev) => prev.filter((item) => item.id !== propertyId));
      setRefreshToken((prev) => prev + 1);
      setFeedback({
        type: "success",
        message: "Property deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete property:", err);
      setFeedback({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete property. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="mb30">
        <FilterHeader
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          statusOptions={statusFilterOptions}
          sortOptions={sortOptionsList}
        />
      </div>

      {feedback.message && (
        <div
          className={`mb20 ${
            feedback.type === "success" ? "text-success" : "text-danger"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {loading && (
        <div className="p30">
          <p className="mb-0">Loading properties...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p30 text-danger">
          <p className="mb-2">{error}</p>
          <button className="ud-btn btn-thm" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="p30">
          <p className="mb-0">No properties found.</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb20">
            <p className="mb-0 small">
              Showing {startItem.toLocaleString()}-
              {endItem.toLocaleString()} of {totalItems.toLocaleString()}{" "}
              properties
            </p>
          </div>

          <div className="table-responsive">
            <table className="table-style3 table at-savesearch">
              <thead className="t-head">
                <tr>
                  <th scope="col">Listing title</th>
                  <th scope="col">Date Created</th>
                  <th scope="col">Status</th>
                  <th scope="col">Price</th>
                  <th scope="col">Created By</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="t-body">
                {properties.map((property) => (
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
                            <Link
                              href={`/cmsadminlogin/edit-property/${property.id}`}
                            >
                              {property.title}
                            </Link>
                          </div>
                          <p className="list-text mb-0">{property.location}</p>
                        </div>
                      </div>
                    </th>
                    <td className="vam">{property.datePublished}</td>
                    <td className="vam">
                      <span className={getStatusStyle(property.status)}>
                        {property.status}
                      </span>
                    </td>
                    <td className="vam">{property.price}</td>
                    <td className="vam text-capitalize">{property.createdBy}</td>
                    <td className="vam">
                      <div className="d-flex">
                        <Link
                          href={`/cmsadminlogin/edit-property/${property.id}`}
                          className="icon d-inline-flex align-items-center justify-content-center"
                          style={{ border: "none" }}
                          data-tooltip-id={`edit-${property.id}`}
                        >
                          <span className="fas fa-pen fa" />
                        </Link>
                        <button
                          className="icon"
                          style={{ border: "none" }}
                          data-tooltip-id={`delete-${property.id}`}
                          onClick={() => handleDelete(property.id)}
                          disabled={deletingId === property.id}
                        >
                          <span
                            className={`flaticon-bin ${
                              deletingId === property.id ? "opacity-50" : ""
                            }`}
                          />
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
          </div>

          {totalPages > 1 && (
            <div className="mbp_pagination text-center mt30">
              <ul className="page_navigation">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <span
                    className="page-link pointer"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <span className="fas fa-angle-left" />
                  </span>
                </li>

                {pageNumbers[0] > 1 && (
                  <li className="page-item">
                    <span
                      className="page-link pointer"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </span>
                  </li>
                )}

                {pageNumbers[0] > 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}

                {pageNumbers.map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    <span
                      className="page-link pointer"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </span>
                  </li>
                ))}

                {pageNumbers.length > 0 &&
                  pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}

                {pageNumbers.length > 0 &&
                  pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <li className="page-item">
                      <span
                        className="page-link pointer"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </span>
                    </li>
                  )}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <span
                    className="page-link pointer"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span className="fas fa-angle-right" />
                  </span>
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PropertyDataTable;

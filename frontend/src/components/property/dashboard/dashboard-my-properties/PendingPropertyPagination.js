"use client";
import React from "react";

const PendingPropertyPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="mbp_pagination text-center">
      <ul className="page_navigation">
        <li className="page-item">
          <span
            className="page-link pointer"
            onClick={() => handlePageClick(currentPage - 1)}
            style={{
              pointerEvents: currentPage === 1 ? "none" : "auto",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <span className="fas fa-angle-left" />
          </span>
        </li>

        {generatePageNumbers().map((page) => (
          <li
            key={page}
            className={`page-item${page === currentPage ? " active" : ""}`}
          >
            <span className="page-link pointer" onClick={() => handlePageClick(page)}>
              {page}
            </span>
          </li>
        ))}

        <li className="page-item pointer">
          <span
            className="page-link"
            onClick={() => handlePageClick(currentPage + 1)}
            style={{
              pointerEvents: currentPage === totalPages ? "none" : "auto",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <span className="fas fa-angle-right" />
          </span>
        </li>
      </ul>
      <p className="mt10 pagination_page_count text-center">
        {totalItems > 0
          ? `${startItem}-${endItem} of ${totalItems} properties`
          : "No properties available"}
      </p>
    </div>
  );
};

export default PendingPropertyPagination;
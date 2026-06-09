"use client";
import React, { useState } from "react";

const PaginationTwo = (
    {
        pageNumber,
        setPageNumber,
        data,
        pageCapacity,
        totalCount,
      }
) => {
    const total =
      totalCount != null ? totalCount : (Array.isArray(data) ? data.length : 0);
    const totalPages =
      total === 0 ? 0 : Math.max(1, Math.ceil(total / pageCapacity));

    const handlePrevious = () => {
        if (pageNumber == 1) {
        } else {
          setPageNumber((pre) => pre - 1);
        }
      };
      const handleNext = () => {
        if (totalPages > 0 && totalPages > pageNumber) {
          setPageNumber((pre) => pre + 1);
        }
      };

  return (
    <div className="mbp_pagination text-center">
      <ul className="page_navigation">
        <li className="page-item">
          <span
            className="page-link pointer"
            href="#"
            onClick={handlePrevious}
          >
            <span className="fas fa-angle-left" />
          </span>
        </li>

        <li
          onClick={() => setPageNumber(1)}
          className={pageNumber == 1 ? "active page-item" : "page-item"}
          href="#"
        >
            <span
        className="page-link pointer">1</span>
          
        </li>
        {total > pageCapacity ? (
          <li
            onClick={() => setPageNumber(2)}
            className={pageNumber == 2 ? "active page-item" : "page-item"}
            href="#"
          >
            <span
        className="page-link pointer">2</span>
            
          </li>
        ) : (
          ""
        )}
        {total > pageCapacity * 2 ? (
          <li
            onClick={() => setPageNumber(3)}
            className={pageNumber == 3 ? "active page-item" : "page-item"}
            href="#"
          >
            <span
        className="page-link pointer">3</span>
            
          </li>
        ) : (
          ""
        )}

        {total > pageCapacity * 4 && pageNumber != 4 && <span>...</span>}
        {pageNumber >  3 && totalPages != pageNumber ? (
          <li
            className={
             
               "active page-item"
               
            }
            onClick={() => setPageNumber(totalPages)}
          >
            <span
        className="page-link pointer">
            {pageNumber}</span>
          </li>
        ) : (
          ""
        )}
        {total >  pageCapacity * 4 ? (
          <li
            className={
              pageNumber == totalPages
                ? "active page-item"
                : "page-item"
            }
            onClick={() => setPageNumber(totalPages)}
          >
            <span
        className="page-link pointer">
            {totalPages}</span>
          </li>
        ) : (
          ""
        )}



     



        <li className="page-item pointer">
          <span
            className="page-link"
            href="#"
            onClick={handleNext}
          >
            <span className="fas fa-angle-right" />
          </span>
        </li>
      </ul>
      <p className="mt10 pagination_page_count text-center">

        {total === 0
          ? "0 properties available"
          : `${(pageNumber - 1) * pageCapacity + 1}-${Math.min(pageNumber * pageCapacity, total)} of ${total} properties available`}
      </p>
    </div>
  );
};

export default PaginationTwo;

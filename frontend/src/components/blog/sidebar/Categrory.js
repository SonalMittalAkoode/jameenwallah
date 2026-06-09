"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBlogCategories } from "@/api/blog";

const Category = () => {
  // Use a sensible default but wait for API
  const [categories, setCategories] = useState([
    { _id: "", title: "Houses" },
    { _id: "", title: "Apartments" },
    { _id: "", title: "Office" },
    { _id: "", title: "Villa" },
    { _id: "", title: "Townhome" },
  ]);

  useEffect(() => {
    let cancelled = false;
    getBlogCategories()
      .then((res) => {
        if (!cancelled && res && res.data && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setCategories(res.data);
          }
        }
      })
      .catch((err) => console.error("Error fetching blog categories:", err));
      
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="sidebar-widget mb30">
      <h6 className="widget-title">Categories</h6>
      <div className="category-list d-flex flex-column mt20">
        <Link href="/blog">All Categories</Link>
        {categories.map((category, index) => {
          // Fallback ID if missing
          const catId = category._id || category.id || category.title;
          return (
            <Link href={`/blog?category=${encodeURIComponent(catId)}`} key={category._id || index}>
              {category.title || category.name || category}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Category;


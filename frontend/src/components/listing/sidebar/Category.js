'use client'

import React, { useEffect, useRef, useState } from "react";
import { getActiveCategories } from "@/api/category";

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[-_\s]+/g, "")
    .trim();

const Category = ({ filterFunctions }) => {
  const [options, setOptions] = useState([]);
  const seededRef = useRef(false);

  useEffect(() => {
    getActiveCategories()
      .then(res => {
        if (res && res.data) {
          setOptions(res.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (seededRef.current) return;
    const slug = filterFunctions?.effectiveCategory;
    if (!slug || !options.length) return;
    if (filterFunctions?.categories?.length) return;
    const match = options.find(
      (o) => normalize(o.name) === normalize(slug) || o.slug === slug
    );
    if (match) {
      seededRef.current = true;
      filterFunctions?.handlecategories(match.name);
    }
  }, [options, filterFunctions?.effectiveCategory]);

  return (
    <>
      <label className="custom_checkbox">
        All
        <input
          type="checkbox"
          checked={!filterFunctions?.categories?.length}
          onChange={() => filterFunctions?.handlecategories("All")}
        />
        <span className="checkmark" />
      </label>
      {options.map((option, index) => (
        <label className="custom_checkbox" key={index}>
          {option.name}
          <input
            type="checkbox"
            checked={filterFunctions?.categories?.includes(option.name)}
            onChange={() => filterFunctions?.handlecategories(option.name)}
          />
          <span className="checkmark" />
        </label>
      ))}
    </>
  );
};

export default Category;

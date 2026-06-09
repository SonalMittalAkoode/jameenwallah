"use client";

import React from "react";

const PropertyType = ({ filterFunctions }) => {
  const options = filterFunctions?.propertyTypeOptions || [];
  const loading = filterFunctions?.loadingPropertyTypes;

  if (loading && options.length === 0) {
    return <p className="text-muted fz14 mb-0">Loading types…</p>;
  }

  if (!options.length) {
    return (
      <p className="text-muted fz14 mb-0">No types for this category</p>
    );
  }

  const selected = (filterFunctions?.propertyTypes || []).map(String);

  return (
    <>
      <label className="custom_checkbox">
        All
        <input
          type="checkbox"
          checked={selected.length === 0}
          onChange={() => filterFunctions?.setPropertyTypes([])}
        />
        <span className="checkmark" />
      </label>
      {options.map((pt) => (
        <label className="custom_checkbox" key={pt._id}>
          {pt.name}
          <input
            type="checkbox"
            checked={selected.includes(String(pt._id))}
            onChange={() => filterFunctions?.handlepropertyTypes(pt._id)}
          />
          <span className="checkmark" />
        </label>
      ))}
    </>
  );
};

export default PropertyType;

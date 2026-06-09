'use client'
import React from "react";
import { getAmenitiesByCategory } from "@/data/amenitiesConfig";

const Amenities = ({ propertyCategory }) => {
  const amenitiesList = getAmenitiesByCategory(propertyCategory);

  if (!amenitiesList?.length) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap gap-2 mt20">
      {amenitiesList.map((amenity, index) => (
        <span
          key={`${amenity}-${index}`}
          className="px-3 py-2 bgc-gray-200 bdrs12 heading-color fw500"
        >
          {amenity}
        </span>
      ))}
    </div>
  );
};

export default Amenities;

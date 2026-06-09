"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const structureTypeOptions = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Farmhouse", label: "Farmhouse" },
  { value: "Plot", label: "Plot" },
];

const customStyles = {
  option: (styles, { isFocused, isSelected, isHovered }) => ({
    ...styles,
    backgroundColor: isSelected
      ? "#FC9401"
      : isHovered
      ? "#eb675312"
      : isFocused
      ? "#eb675312"
      : undefined,
  }),
};

const StructureType = () => {
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => {
    setShowSelect(true);
  }, []);
  return (
    <div className="col-sm-6 col-xl-4">
      <div className="mb20">
        <label className="heading-color ff-heading fw600 mb10">
          Structure type
        </label>
        <div className="location-area">
          {showSelect && (
            <Select
              styles={customStyles}
              className="select-custom pl-0"
              classNamePrefix="select"
              required
              isMulti
              defaultValue={[structureTypeOptions[0]]}
              name="structureType"
              options={structureTypeOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureType;

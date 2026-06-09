"use client";
import { useEffect, useState } from "react";
import Select from "react-select";

import { useDropdownDirection } from "./useDropdownDirection";

const Location = ({ options = [], value, onChange, isLoading }) => {
  const { wrapperRef, openUp, checkViewportSpace } = useDropdownDirection();
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => {
    setShowSelect(true);
  }, []);

  const customStyles = {
    option: (styles, { isFocused, isSelected, isHovered }) => ({
      ...styles,
      backgroundColor: isSelected
        ? "#eb6753"
        : isHovered
          ? "#eb675312"
          : isFocused
            ? "#eb675312"
            : undefined,
    }),
  };

  return (
    <div ref={wrapperRef} className={openUp ? "dropdown-up" : ""}>
      {showSelect && (
        <Select
          value={value}
          onChange={onChange}
          name="area"
          options={options}
          isLoading={isLoading}
          isDisabled={isLoading || options.length === 0}
          styles={customStyles}
          className="text-start select-borderless"
          classNamePrefix="select"
          placeholder={isLoading ? "Loading…" : "Select area"}
          isClearable={false}
          menuPlacement={openUp ? "top" : "bottom"}
          onMenuOpen={checkViewportSpace}
        />
      )}
    </div>
  );
};

export default Location;

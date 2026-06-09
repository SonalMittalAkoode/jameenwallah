"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const options = {
  countries: [
    "Delhi",
    "Haryana",
    "Uttar Pradesh",
  ],
  cities: [
    "Gurgaon",
    "Noida",
    "Greater Noida",
    "Delhi NCR",
  ],
  additionalCountries: [
    "Sohna Road",
    "IIFCO chowk",
    "MG Road",

  ],
};

const customStyles = {
  option: (styles, { isFocused, isSelected, isHovered }) => {
    return {
      ...styles,
      backgroundColor: isSelected
        ? "#FC9401"
        : isHovered
        ? "#eb675312"
        : isFocused
        ? "#eb675312"
        : undefined,
      padding: '10px 12px',
    };
  },
  menuList: (styles) => ({
    ...styles,
    paddingTop: '8px',
    paddingBottom: '8px',
    maxHeight: '250px',
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: 9999,
  }),
};

const SelectMultiField = () => {
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => {
    setShowSelect(true);
  }, []);
  const fieldTitles = ["State", "City", "Area"];
  return (
    <>
      {Object.keys(options).map((key, index) => (
        <div className="col-sm-6 col-xl-4" key={index}>
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              {fieldTitles[index]}
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  styles={customStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  required
                  isMulti
                  options={options[key].map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SelectMultiField;

"use client";
import Select from "react-select";

const Location = ({ filterFunctions }) => {
  const locationOptions = [
    { value: "All Cities", label: "All Cities" },
    { value: "Delhi", label: "Delhi" },
    { value: "Gurgaon", label: "Gurgaon" },
    { value: "Noida", label: "Noida" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Pune", label: "Pune" },
    { value: "Bengaluru", label: "Bengaluru" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Chennai", label: "Chennai" },
  ];

  const selectedValue = filterFunctions?.location || "All Cities";
  const options = locationOptions.some((opt) => opt.value === selectedValue)
    ? locationOptions
    : [{ value: selectedValue, label: selectedValue }, ...locationOptions];

  const customStyles = {
    option: (styles, { isFocused, isSelected, isHovered }) => {
      return {
        ...styles,
        backgroundColor: isSelected
          ? "#eb6753"
          : isHovered
          ? "#eb675312"
          : isFocused
          ? "#eb675312"
          : undefined,
      };
    },
  };

  return (
    <Select
      instanceId="listing-sidebar-location"
      defaultValue={[locationOptions[0]]}
      name="colors"
      styles={customStyles}
      options={options}
      value={{
        value: selectedValue,
        label: selectedValue,
      }}
      className="select-custom filterSelect"
      classNamePrefix="select"
      onChange={(e) => filterFunctions?.handlelocation(e.value)}
      required
    />
  );
};

export default Location;

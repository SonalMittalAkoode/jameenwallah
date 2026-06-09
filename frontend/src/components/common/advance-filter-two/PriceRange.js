"use client";
import React, { useState } from "react";
import Slider, { Range } from "rc-slider";

const PRICE_FILTER_MAX = 1000000000;

const formatIndianPrice = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
};

const PriceRange = ({ filterFunctions }) => {
  const [price, setPrice] = useState(filterFunctions?.priceRange || [0, PRICE_FILTER_MAX]);

  // price range handler
  const handleOnChange = (value) => {
    setPrice(value);
    filterFunctions?.handlepriceRange(value);
  };

  return (
    <>
      <div className="range-wrapper">
        <Slider
          range
          max={PRICE_FILTER_MAX}
          min={0}
          step={5000000}
          defaultValue={[
            filterFunctions?.priceRange[0],
            filterFunctions?.priceRange[1],
          ]}
          onChange={(value) => handleOnChange(value)}
          id="slider"
        />
        <div className="d-flex align-items-center">
          <span id="slider-range-value1">{formatIndianPrice(price[0])}</span>
          <i className="fa-sharp fa-solid fa-minus mx-2 dark-color icon" />
          <span id="slider-range-value2">{formatIndianPrice(price[1])}</span>
        </div>
      </div>
    </>
  );
};

export default PriceRange;

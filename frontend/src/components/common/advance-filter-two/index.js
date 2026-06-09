"use client";
import Select from "react-select";
import PriceRange from "./PriceRange";
import Bedroom from "./Bedroom";
import Bathroom from "./Bathroom";
import Amenities from "./Amenities";
import { useEffect, useState } from "react";

const AdvanceFilterModal = ({ filterFunctions }) => {
  const [showSelect, setShowSelect] = useState(false);
  const catOptions = (filterFunctions?.propertyTypeOptions || []).map((type) => ({
    value: String(type._id),
    label: type.name,
  }));

  const locationOptions = [
    { value: "All Cities", label: "All Cities" },
    { value: "Gurgaon", label: "Gurgaon" },
    { value: "Delhi", label: "Delhi" },
    { value: "Noida", label: "Noida" },
    { value: "Goa", label: "Goa" },
  ];

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

  useEffect(() => {
    setShowSelect(true);
  }, []);

  return (
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header pl30 pr30">
          <h5 className="modal-title" id="exampleModalLabel">
            More Filter
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        {/* End modal-header */}

        <div className="modal-body pb-0">
          <div className="row">
            <div className="col-lg-12">
              <div className="widget-wrapper">
                <h6 className="list-title mb20">Price Range</h6>
                <div className="range-slider-style modal-version">
                  <PriceRange filterFunctions={filterFunctions} />
                </div>
              </div>
            </div>
          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Type</h6>
                <div className="form-style2 input-group">
                  {showSelect ? (
                    <Select
                      instanceId="advance-filter-type"
                      value={catOptions.find((option) =>
                        filterFunctions?.propertyTypes?.includes(option.value)
                      ) || null}
                      name="colors"
                      options={catOptions}
                      isClearable
                      styles={customStyles}
                      onChange={(e) =>
                        filterFunctions?.setPropertyTypes(e?.value ? [e.value] : [])
                      }
                      className="select-custom"
                      classNamePrefix="select"
                      required
                    />
                  ) : null}
                </div>
              </div>
            </div>
            {/* End .col-6 */}

          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Bedrooms</h6>
                <div className="d-flex">
                  <Bedroom filterFunctions={filterFunctions} />
                </div>
              </div>
            </div>
            {/* End .col-md-6 */}

            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Bathrooms</h6>
                <div className="d-flex">
                  <Bathroom filterFunctions={filterFunctions} />
                </div>
              </div>
            </div>
            {/* End .col-md-6 */}
          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Location</h6>
                <div className="form-style2 input-group">
                  {showSelect ? (
                    <Select
                      instanceId="advance-filter-location"
                      defaultValue={[locationOptions[0]]}
                      name="colors"
                      styles={customStyles}
                      options={locationOptions}
                      className="select-custom filterSelect"
                      value={{
                        value: filterFunctions?.location,
                        label: filterFunctions?.location,
                      }}
                      classNamePrefix="select"
                      onChange={(e) => filterFunctions?.handlelocation(e.value)}
                      required
                    />
                  ) : null}
                </div>
              </div>
            </div>
            {/* End .col-md-6 */}

            <div className="col-sm-6">
              <div className="widget-wrapper">
                <h6 className="list-title">Square Feet</h6>
                <div className="space-area">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="form-style1">
                      <input
                        type="number"
                        className="form-control filterInput"
                        onChange={(e) =>
                          filterFunctions?.handlesquirefeet([
                            e.target.value,
                            document.getElementById("maxFeet3").value / 1,
                          ])
                        }
                        placeholder="Min."
                        id="minFeet3"
                      />
                    </div>
                    <span className="dark-color">-</span>
                    <div className="form-style1">
                      <input
                        type="number"
                        className="form-control filterInput"
                        placeholder="Max"
                        id="maxFeet3"
                        onChange={(e) =>
                          filterFunctions?.handlesquirefeet([
                            document.getElementById("minFeet3").value / 1,
                            e.target.value,
                          ])
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End .col-md-6 */}
          </div>
          {/* End .row */}

          <div className="row">
            <div className="col-lg-12">
              <div className="widget-wrapper mb0">
                <h6 className="list-title mb10">Amenities</h6>
              </div>
            </div>
            <Amenities filterFunctions={filterFunctions} />
          </div>
        </div>
        {/* End modal body */}

        <div className="modal-footer justify-content-between">
          <button
            className="reset-button"
            onClick={() => filterFunctions?.resetFilter()}
          >
            <span className="flaticon-turn-back" />
            <u>Reset all filters</u>
          </button>
          <div className="btn-area">
            <button type="submit" className="ud-btn btn-thm">
              <span className="flaticon-search align-text-top pr10" />
              Search
            </button>
          </div>
        </div>
        {/* End modal-footer */}
      </div>
    </div>
  );
};

export default AdvanceFilterModal;

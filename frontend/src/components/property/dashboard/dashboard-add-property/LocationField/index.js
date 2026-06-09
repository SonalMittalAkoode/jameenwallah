import Select from "react-select";

const LocationField = ({
  data,
  onInputChange,
  onStateChange,
  onCityChange,
  onAreaChange,
  stateOptions,
  cityOptions,
  areaOptions,
  selectStyles,
  showSelect,
  loadingStates,
  loadingCities,
  loadingAreas,
}) => {
  const selectedState =
    stateOptions.find((option) => option.value === data.state) || null;
  const selectedCity =
    cityOptions.find((option) => option.value === data.city) || null;
  const selectedArea =
    areaOptions.find((option) => option.value === data.area) || null;

  return (
    <div className="form-style1" style={{ paddingBottom: "40px" }}>
      <div className="row">
        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter street address"
              value={data.address}
              onChange={(e) => onInputChange("address", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">State</label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={stateOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedState}
                  onChange={onStateChange}
                  isClearable
                  placeholder={loadingStates ? "Loading states..." : "Select state"}
                  isDisabled={loadingStates}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  noOptionsMessage={() =>
                    loadingStates ? "Loading..." : "No states available"
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">City</label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={cityOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedCity}
                  onChange={onCityChange}
                  isClearable
                  placeholder={
                    loadingCities
                      ? "Loading cities..."
                      : selectedState
                      ? "Select city"
                      : "Select state first"
                  }
                  isDisabled={!selectedState || loadingCities}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  noOptionsMessage={() =>
                    selectedState
                      ? loadingCities
                        ? "Loading..."
                        : "No cities available"
                      : "Select a state first"
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Area</label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={areaOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedArea}
                  onChange={onAreaChange}
                  isClearable
                  placeholder={
                    loadingAreas
                      ? "Loading areas..."
                      : selectedCity
                      ? "Select area"
                      : "Select city first"
                  }
                  isDisabled={!selectedCity || loadingAreas}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  noOptionsMessage={() =>
                    selectedCity
                      ? loadingAreas
                        ? "Loading..."
                        : "No areas available"
                      : "Select a city first"
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Zip</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter zip/postal code"
              value={data.zip}
              onChange={(e) => onInputChange("zip", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Near By
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Separate with semicolon (;) to make each point on next line"
              value={data.nearBy}
              onChange={(e) => onInputChange("nearBy", e.target.value)}
            />
            <small className="text-muted" style={{ fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Example: School; Hospital; Bus Stop; Mall; Cinema
            </small>
          </div>
        </div>
        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Map Embed Code
            </label>
            <textarea
              className="form-control"
              placeholder="Paste Google Maps iframe embed code here"
              value={data.mapEmbedCode}
              onChange={(e) => onInputChange("mapEmbedCode", e.target.value)}
              rows={4}
            />
            <small className="text-muted" style={{ fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Provide the iframe snippet for property location. We will store and render this on the property detail page.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationField;

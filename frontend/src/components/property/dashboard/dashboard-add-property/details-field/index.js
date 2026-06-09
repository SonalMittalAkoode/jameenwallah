"use client";

import Select from "react-select";

const DetailsFiled = ({
  data,
  onChange,
  basementOptions,
  parkingOptions,
  facingOptions,
  shellStatusOptions,
  waterSourceOptions,
  electricityPhaseOptions,
  boundaryStatusOptions,
  washroomAvailabilityOptions,
  pantryAvailabilityOptions,
  boundaryWallOptions,
  gatedCommunityOptions,
  cornerPlotOptions,
  legalStatusOptions,
  constructionOptions,
  furnishingOptions,
  ownershipTypeOptions,
  propertyStatusOptions,
  buildingStatusOptions,
  selectStyles,
  showSelect,
  category,
  categoryOptions,
}) => {
  // Get category name from category ID
  const categoryName = categoryOptions?.find(
    (opt) => opt.value === category
  )?.label?.toLowerCase() || "";

  // Determine which fields to show based on category
  const isResidential = categoryName.includes("residential");
  const isCommercial = categoryName.includes("commercial");
  const isPlot = categoryName.includes("plot");
  const isFarmhouse = categoryName.includes("farmhouse");

  // Common fields that show for all categories
  const showCommonFields = true;
  const selectedBasement =
    basementOptions.find((option) => option.value === data.basement) || null;
  const selectedParking =
    parkingOptions.find((option) => option.value === data.parking) || null;
  const selectedFacing =
    facingOptions?.find((option) => option.value === data.facing) || null;
  const selectedShellStatus =
    shellStatusOptions?.find((option) => option.value === data.shellStatus) || null;
  const selectedWaterSource =
    waterSourceOptions?.find((option) => option.value === data.waterSource) || null;
  const selectedElectricityPhase =
    electricityPhaseOptions?.find((option) => option.value === data.electricityPhase) || null;
  const selectedBoundaryStatus =
    boundaryStatusOptions?.find((option) => option.value === data.boundaryStatus) || null;
  const selectedWashroomAvailability =
    washroomAvailabilityOptions?.find((option) => option.value === data.washroomAvailability) || null;
  const selectedPantryAvailability =
    pantryAvailabilityOptions?.find((option) => option.value === data.pantryAvailability) || null;
  const selectedBoundaryWall =
    boundaryWallOptions?.find((option) => option.value === data.boundaryWall) || null;
  const selectedGatedCommunity =
    gatedCommunityOptions?.find((option) => option.value === data.gatedCommunity) || null;
  const selectedCornerPlot =
    cornerPlotOptions?.find((option) => option.value === data.cornerPlot) || null;
  const selectedLegalStatus =
    legalStatusOptions?.find((option) => option.value === data.legalStatus) || null;
  const selectedConstruction =
    constructionOptions?.find((option) => option.value === data.construction) || null;
  const selectedFurnishingStatus =
    furnishingOptions?.find((option) => option.value === data.furnishingStatus) || null;
  const selectedOwnershipType =
    ownershipTypeOptions?.find((option) => option.value === data.ownershipType) || null;
  const selectedPropertyStatus =
    propertyStatusOptions?.find((option) => option.value === data.propertyStatus) || null;
  const selectedBuildingStatus =
    buildingStatusOptions?.find((option) => option.value === data.buildingStatus) || null;
  const showNumberOfParkings = data.parking && data.parking !== "Not Available";

  return (
    <div className="form-style1" style={{ paddingBottom: "130px" }}>
      <div className="row">
        {/* Size in Sq.ft - Residential & Commercial */}
        {(isResidential || isCommercial) && (
          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Size in Sq.ft
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter size in square feet"
                value={data.sizeInSqFt}
                onChange={(e) => onChange("sizeInSqFt", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Residential Fields */}
        {isResidential && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  BHK
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter BHK"
                  value={data.bhk}
                  onChange={(e) => onChange("bhk", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Total Floors
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter total floors"
                  value={data.totalFloors}
                  onChange={(e) => onChange("totalFloors", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Total Towers
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter total towers"
                  value={data.totalTowers}
                  onChange={(e) => onChange("totalTowers", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Facing
                </label>
                <div className="location-area">
                  {showSelect && facingOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={facingOptions}
                      value={selectedFacing}
                      onChange={(option) =>
                        onChange("facing", option?.value || "")
                      }
                      isClearable
                      placeholder="Select facing"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter facing"
                      value={data.facing}
                      onChange={(e) => onChange("facing", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Furnishing Status
                </label>
                <div className="location-area">
                  {showSelect && furnishingOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={furnishingOptions}
                      value={selectedFurnishingStatus}
                      onChange={(option) =>
                        onChange("furnishingStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select furnishing status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter furnishing status"
                      value={data.furnishingStatus}
                      onChange={(e) => onChange("furnishingStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Property Status
                </label>
                <div className="location-area">
                  {showSelect && propertyStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={propertyStatusOptions}
                      value={selectedPropertyStatus}
                      onChange={(option) =>
                        onChange("propertyStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select property status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter property status"
                      value={data.propertyStatus}
                      onChange={(e) => onChange("propertyStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Commercial Fields */}
        {isCommercial && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Total Towers
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter total towers"
                  value={data.totalTowers}
                  onChange={(e) => onChange("totalTowers", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Total Floors
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter total floors"
                  value={data.totalFloors}
                  onChange={(e) => onChange("totalFloors", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Shell Status
                </label>
                <div className="location-area">
                  {showSelect && shellStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={shellStatusOptions}
                      value={selectedShellStatus}
                      onChange={(option) =>
                        onChange("shellStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select shell status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter shell status"
                      value={data.shellStatus}
                      onChange={(e) => onChange("shellStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10"> 
                  Ceiling Height (in feet)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter ceiling height"
                  value={data.ceilingHeight}
                  onChange={(e) => onChange("ceilingHeight", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Floor Load Capacity (in kg/m²)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter floor load capacity"
                  value={data.floorLoadCapacity}
                  onChange={(e) => onChange("floorLoadCapacity", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Washroom Availability
                </label>
                <div className="location-area">
                  {showSelect && washroomAvailabilityOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={washroomAvailabilityOptions}
                      value={selectedWashroomAvailability}
                      onChange={(option) =>
                        onChange("washroomAvailability", option?.value || "")
                      }
                      isClearable
                      placeholder="Select washroom availability"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter washroom availability"
                      value={data.washroomAvailability}
                      onChange={(e) => onChange("washroomAvailability", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Pantry Availability
                </label>
                <div className="location-area">
                  {showSelect && pantryAvailabilityOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={pantryAvailabilityOptions}
                      value={selectedPantryAvailability}
                      onChange={(option) =>
                        onChange("pantryAvailability", option?.value || "")
                      }
                      isClearable
                      placeholder="Select pantry availability"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter pantry availability"
                      value={data.pantryAvailability}
                      onChange={(e) => onChange("pantryAvailability", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Number of Entrances
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter number of entrances"
                  value={data.numberOfEntrances}
                  onChange={(e) => onChange("numberOfEntrances", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Property Status
                </label>
                <div className="location-area">
                  {showSelect && propertyStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={propertyStatusOptions}
                      value={selectedPropertyStatus}
                      onChange={(option) =>
                        onChange("propertyStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select property status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter property status"
                      value={data.propertyStatus}
                      onChange={(e) => onChange("propertyStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Custom ID
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter custom ID"
              value={data.customId || ""}
              onChange={(e) => onChange("customId", e.target.value)}
            />
            <small className="text-muted">Auto-generated if left empty</small>
          </div>
        </div>


        {/* Plot Fields */}
        {isPlot && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Plot Size (in square feet)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter plot size"
                  value={data.plotSize || ""}
                  onChange={(e) => onChange("plotSize", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Plot Dimension Length (in feet)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter plot dimension length"
                  value={data.plotDimensionLength}
                  onChange={(e) => onChange("plotDimensionLength", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Plot Dimension Width (in feet)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter plot dimension width"
                  value={data.plotDimensionWidth}
                  onChange={(e) => onChange("plotDimensionWidth", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Facing
                </label>
                <div className="location-area">
                  {showSelect && facingOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={facingOptions}
                      value={selectedFacing}
                      onChange={(option) =>
                        onChange("facing", option?.value || "")
                      }
                      isClearable
                      placeholder="Select facing"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter facing"
                      value={data.facing}
                      onChange={(e) => onChange("facing", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Boundary Wall
                </label>
                <div className="location-area">
                  {showSelect && boundaryWallOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={boundaryWallOptions}
                      value={selectedBoundaryWall}
                      onChange={(option) =>
                        onChange("boundaryWall", option?.value || "")
                      }
                      isClearable
                      placeholder="Select boundary wall"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter boundary wall"
                      value={data.boundaryWall}
                      onChange={(e) => onChange("boundaryWall", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Gated Community
                </label>
                <div className="location-area">
                  {showSelect && gatedCommunityOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={gatedCommunityOptions}
                      value={selectedGatedCommunity}
                      onChange={(option) =>
                        onChange("gatedCommunity", option?.value || "")
                      }
                      isClearable
                      placeholder="Enter gated community"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter gated community"
                      value={data.gatedCommunity}
                      onChange={(e) => onChange("gatedCommunity", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Corner Plot
                </label>
                <div className="location-area">
                  {showSelect && cornerPlotOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={cornerPlotOptions}
                      value={selectedCornerPlot}
                      onChange={(option) =>
                        onChange("cornerPlot", option?.value || "")
                      }
                      isClearable
                      placeholder="Select corner plot"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter corner plot"
                      value={data.cornerPlot}
                      onChange={(e) => onChange("cornerPlot", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Legal Status
                </label>
                <div className="location-area">
                  {showSelect && legalStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={legalStatusOptions}
                      value={selectedLegalStatus}
                      onChange={(option) =>
                        onChange("legalStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select legal status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter legal status"
                      value={data.legalStatus}
                      onChange={(e) => onChange("legalStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Construction
                </label>
                <div className="location-area">
                  {showSelect && constructionOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={constructionOptions}
                      value={selectedConstruction}
                      onChange={(option) =>
                        onChange("construction", option?.value || "")
                      }
                      isClearable
                      placeholder="Select construction"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter construction"
                      value={data.construction}
                      onChange={(e) => onChange("construction", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Available From
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter available from"
                  value={data.availableFrom || ""}
                  onChange={(e) => onChange("availableFrom", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Farmhouse Fields */}
        {isFarmhouse && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Total Area in Sq.ft
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter total area in square feet"
                  value={data.totalAreaInSqFt}
                  onChange={(e) => onChange("totalAreaInSqFt", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Bedrooms
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter number of bedrooms"
                  value={data.bedrooms}
                  onChange={(e) => onChange("bedrooms", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Water Source
                </label>
                <div className="location-area">
                  {showSelect && waterSourceOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={waterSourceOptions}
                      value={selectedWaterSource}
                      onChange={(option) =>
                        onChange("waterSource", option?.value || "")
                      }
                      isClearable
                      placeholder="Select water source"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter water source"
                      value={data.waterSource}
                      onChange={(e) => onChange("waterSource", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Electricity Phase
                </label>
                <div className="location-area">
                  {showSelect && electricityPhaseOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={electricityPhaseOptions}
                      value={selectedElectricityPhase}
                      onChange={(option) =>
                        onChange("electricityPhase", option?.value || "")
                      }
                      isClearable
                      placeholder="Select electricity phase"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter electricity phase"
                      value={data.electricityPhase}
                      onChange={(e) => onChange("electricityPhase", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Boundary Status
                </label>
                <div className="location-area">
                  {showSelect && boundaryStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={boundaryStatusOptions}
                      value={selectedBoundaryStatus}
                      onChange={(option) =>
                        onChange("boundaryStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select boundary status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter boundary status"
                      value={data.boundaryStatus}
                      onChange={(e) => onChange("boundaryStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Facing
                </label>
                <div className="location-area">
                  {showSelect && facingOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={facingOptions}
                      value={selectedFacing}
                      onChange={(option) =>
                        onChange("facing", option?.value || "")
                      }
                      isClearable
                      placeholder="Select facing"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter facing"
                      value={data.facing}
                      onChange={(e) => onChange("facing", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Furnishing Status
                </label>
                <div className="location-area">
                  {showSelect && furnishingOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={furnishingOptions}
                      value={selectedFurnishingStatus}
                      onChange={(option) =>
                        onChange("furnishingStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select furnishing status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter furnishing status"
                      value={data.furnishingStatus}
                      onChange={(e) => onChange("furnishingStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Building Status
                </label>
                <div className="location-area">
                  {showSelect && buildingStatusOptions ? (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      options={buildingStatusOptions}
                      value={selectedBuildingStatus}
                      onChange={(option) =>
                        onChange("buildingStatus", option?.value || "")
                      }
                      isClearable
                      placeholder="Select building status"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter building status"
                      value={data.buildingStatus}
                      onChange={(e) => onChange("buildingStatus", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Date Fields - Residential & Commercial */}
        {(isResidential || isCommercial) && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Completion Date
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter completion date"
                  value={data.completionDate || ""}
                  onChange={(e) => onChange("completionDate", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Possession Date
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter possession date"
                  value={data.possessionDate || ""}
                  onChange={(e) => onChange("possessionDate", e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-6 col-xl-4">
              <div className="mb20">
                <label className="heading-color ff-heading fw600 mb10">
                  Revised Possession Date
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter revised possession date"
                  value={data.revisedPossessionDate || ""}
                  onChange={(e) => onChange("revisedPossessionDate", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Basement - Residential, Commercial & Farmhouse */}
        {(isResidential || isCommercial || isFarmhouse) && (
          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Basement
              </label>
              <div className="location-area">
                {showSelect && (
                  <Select
                    styles={selectStyles}
                    className="select-custom pl-0"
                    classNamePrefix="select"
                    options={basementOptions}
                    value={selectedBasement}
                    onChange={(option) =>
                      onChange("basement", option?.value || "")
                    }
                    isClearable
                    placeholder="Select basement"
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Ownership Type
            </label>
            <div className="location-area">
              {showSelect && ownershipTypeOptions ? (
                <Select
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  options={ownershipTypeOptions}
                  value={selectedOwnershipType}
                  onChange={(option) =>
                    onChange("ownershipType", option?.value || "")
                  }
                  isClearable
                  placeholder="Select ownership type"
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                />
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ownership type"
                  value={data.ownershipType}
                  onChange={(e) => onChange("ownershipType", e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Parking - Common Field for All Categories */}
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Parking
            </label>
            <div className="location-area">
              {showSelect && parkingOptions ? (
                <Select
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  options={parkingOptions}
                  value={selectedParking}
                  onChange={(option) =>
                    onChange("parking", option?.value || "")
                  }
                  isClearable
                  placeholder="Select parking"
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                />
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter parking"
                  value={data.parking}
                  onChange={(e) => onChange("parking", e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bathrooms - Residential & Farmhouse */}
        {(isResidential || isFarmhouse) && (
          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Bathrooms
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter bathrooms"
                value={data.bathrooms || ""}
                onChange={(e) => onChange("bathrooms", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Balcony - Residential & Farmhouse */}
        {(isResidential || isFarmhouse) && (
          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Balcony
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter number of balconies"
                value={data.balcony}
                onChange={(e) => onChange("balcony", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsFiled;

"use client";

const FilterHeader = ({
  searchValue = "",
  onSearchChange,
  statusFilter = "",
  onStatusChange,
  sortOption = "-createdAt",
  onSortChange,
  statusOptions = [],
  sortOptions = [],
}) => {
  return (
    <div className="dashboard_search_meta d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 gap-lg-3">
      <div className="item1 mb15-sm flex-grow-1">
        <div className="search_area">
          <input
            type="text"
            className="form-control bdrs12"
            placeholder="Search properties"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <label>
            <span className="flaticon-search" />
          </label>
        </div>
      </div>

      <div className="page_control_shorting bdr1 bdrs12 py-2 ps-3 pe-2 bgc-white mb15-sm">
        <div className="pcs_dropdown d-flex align-items-center gap-2">
          <span className="title-color">Status:</span>
          <select
            className="form-select show-tick"
            value={statusFilter}
            onChange={(e) => onStatusChange?.(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="page_control_shorting bdr1 bdrs12 py-2 ps-3 pe-2 bgc-white mb15-sm">
        <div className="pcs_dropdown d-flex align-items-center gap-2">
          <span className="title-color">Sort:</span>
          <select
            className="form-select show-tick"
            value={sortOption}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterHeader;

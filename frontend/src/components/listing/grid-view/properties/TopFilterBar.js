'use client'

import React, { useMemo, useState, useEffect } from "react";
import { getAllCitiesFrontend } from "@/api/city";
import { getAreasByCityIdFrontend } from "@/api/area";
import { getAllPropertyTypesFrontend } from "@/api/propertyType";
import PropertyType from "../../sidebar/PropertyType";
import Category from "../../sidebar/Category";
import SearchBox from "../../sidebar/SearchBox";

const shortJoin = (items, fallback, maxLen = 26) => {
  if (!items?.length) return fallback;
  const s = items.join(", ");
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
};

const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const looksLikeObjectId = (s) =>
  /^[a-f\d]{24}$/i.test(String(s || "").trim());

const prettySlug = (value) => {
  if (!value) return "";
  try {
    const t = decodeURIComponent(String(value)).trim();
    return t
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return String(value);
  }
};

const slugifyLabel = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const TopFilterBar = ({
  filterFunctions,
  categoryUrl = "",
  propertyTypeUrl = "",
  showOnMobile = false,
}) => {
  const [citiesList, setCitiesList] = useState(["All Cities"]);
  /** `{ _id, name }` — needed to load areas for the selected city. */
  const [citiesRows, setCitiesRows] = useState([]);
  const [areasOptions, setAreasOptions] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [propertyTypeIdToName, setPropertyTypeIdToName] = useState({});

  useEffect(() => {
    let cancelled = false;
    getAllPropertyTypesFrontend()
      .then((res) => {
        const list = res?.status === "success" && Array.isArray(res?.data) ? res.data : [];
        const map = {};
        list.forEach((pt) => {
          if (pt?._id != null && pt?.name) map[String(pt._id)] = String(pt.name);
        });
        if (!cancelled) setPropertyTypeIdToName(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    getAllCitiesFrontend()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          const rows = res.data
            .map((c) => ({ _id: String(c._id), name: c.name }))
            .filter((c) => c.name);
          setCitiesRows(rows);
          setCitiesList(["All Cities", ...rows.map((c) => c.name)]);
        }
      })
      .catch((err) => console.error("Failed to load cities:", err));
  }, []);

  useEffect(() => {
    const cityName = filterFunctions?.location;
    if (!cityName || cityName === "All Cities") {
      setAreasOptions([]);
      return;
    }
    const row = citiesRows.find((c) => c.name === cityName);
    if (!row?._id) {
      setAreasOptions([]);
      return;
    }
    let cancelled = false;
    setLoadingAreas(true);
    getAreasByCityIdFrontend(row._id)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        if (cancelled) return;
        setAreasOptions(
          list
            .map((a) => ({ _id: String(a._id), name: a.name || "Area" }))
            .filter((a) => a._id)
        );
      })
      .catch(() => {
        if (!cancelled) setAreasOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAreas(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterFunctions?.location, citiesRows]);

  const categoryLabel = useMemo(() => {
    const picked = filterFunctions?.categories;
    if (picked?.length) return shortJoin(picked, "Category");
    if (categoryUrl) return prettySlug(categoryUrl);
    return "Category";
  }, [filterFunctions?.categories, categoryUrl]);

  const propertyTypeLabel = useMemo(() => {
    const resolve = (arr) => {
      if (!arr?.length) return null;
      const labels = arr.map((raw) => {
        const t = String(raw).trim();
        if (looksLikeObjectId(t) && propertyTypeIdToName[t]) return propertyTypeIdToName[t];
        const matched = Object.values(propertyTypeIdToName).find(
          (name) => slugifyLabel(name) === slugifyLabel(t)
        );
        return matched || prettySlug(t);
      });
      return shortJoin(labels, "Property Type");
    };
    const picked = filterFunctions?.propertyTypes;
    if (picked?.length) return resolve(picked) || "Property Type";
    const fromUrl = splitCsv(propertyTypeUrl);
    if (fromUrl.length) return resolve(fromUrl) || "Property Type";
    return "Property Type";
  }, [filterFunctions?.propertyTypes, propertyTypeUrl, propertyTypeIdToName]);
  const locationLabel = useMemo(() => {
    const areaName = filterFunctions?.areaDisplayName;
    if (areaName) {
      const s = String(areaName);
      return s.length > 26 ? `${s.slice(0, 25)}…` : s;
    }
    return "Location";
  }, [filterFunctions?.areaDisplayName]);
  const cityLabel = useMemo(() => {
    const loc = filterFunctions?.location;
    if (loc && loc !== "All Cities") {
      const s = String(loc);
      return s.length > 26 ? `${s.slice(0, 25)}…` : s;
    }
    return "City";
  }, [filterFunctions?.location]);

  return (
    <>
      <div
        className={
          showOnMobile
            ? "col-12"
            : "col-xl-12 d-none d-lg-block"
        }
      >
        <div className="dropdown-lists">
          <ul
            className={
              showOnMobile
                ? "p-0 top-filterbar-mobile-stack"
                : "p-0 text-center text-xl-start"
            }
          >
            <li className="list-inline-item position-relative search-filter-box">
              <SearchBox filterFunctions={filterFunctions} />
            </li>
            {/* End li SearchBox */}

            <li className="list-inline-item position-relative">
              <button
                type="button"
                className="open-btn mb15 dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                {categoryLabel} <i className="fa fa-angle-down ms-2" />
              </button>
              <div className="dropdown-menu">
                <div className="widget-wrapper bdrb1 pb25 mb0 pl20">
                  <h6 className="list-title">Category</h6>
                  <div className="checkbox-style1" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <Category filterFunctions={filterFunctions}/>
                  </div>
                </div>
              </div>
            </li>
            {/* End li Category */}

            <li className="list-inline-item position-relative">
              <button
                type="button"
                className="open-btn mb15 dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                {propertyTypeLabel} <i className="fa fa-angle-down ms-2" />
              </button>
              <div className="dropdown-menu">
                <div className="widget-wrapper bdrb1 pb25 mb0 pl20">
                  <h6 className="list-title">Property Type</h6>
                  <div className="checkbox-style1">
                    <PropertyType filterFunctions={filterFunctions}/>
                  </div>
                </div>
              </div>
            </li>
            {/* End li Property Type */}

            <li className="list-inline-item position-relative">
              <button
                type="button"
                className="open-btn mb15 dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                {cityLabel} <i className="fa fa-angle-down ms-2" />
              </button>
              <div className="dropdown-menu dd4 pb20">
                <div className="widget-wrapper pl20 pr20">
                  <h6 className="list-title">Select City</h6>
                  <div className="checkbox-style1" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {citiesList.map((city, index) => (
                      <label className="custom_checkbox" key={index}>
                        {city}
                        <input
                          type="radio"
                          name="top_city"
                          checked={(filterFunctions?.location || "All Cities") === city}
                          onChange={() => filterFunctions?.handlelocation(city)}
                        />
                        <span className="checkmark" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </li>
            {/* End li City */}

            <li className="list-inline-item position-relative">
              <button
                type="button"
                className="open-btn mb15 dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                {locationLabel} <i className="fa fa-angle-down ms-2" />
              </button>

              <div className="dropdown-menu dd3">
                <div className="widget-wrapper pb25 mb0 pl20 pr20">
                  <h6 className="list-title">Select Location (area)</h6>
                  <div className="checkbox-style1" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {!filterFunctions?.location ||
                    filterFunctions?.location === "All Cities" ? (
                      <p className="text-muted mb-0 small">
                        Choose a city first, then pick an area.
                      </p>
                    ) : loadingAreas ? (
                      <p className="text-muted mb-0 small">Loading areas…</p>
                    ) : (
                      <>
                        <label className="custom_checkbox">
                          All areas in this city
                          <input
                            type="radio"
                            name="top_location_area"
                            checked={!filterFunctions?.effectiveAreaId}
                            onChange={() =>
                              filterFunctions?.handleAreaPick?.("", "")
                            }
                          />
                          <span className="checkmark" />
                        </label>
                        {areasOptions.map((a) => (
                          <label className="custom_checkbox" key={a._id}>
                            {a.name}
                            <input
                              type="radio"
                              name="top_location_area"
                              checked={
                                filterFunctions?.effectiveAreaId === a._id
                              }
                              onChange={() =>
                                filterFunctions?.handleAreaPick?.(
                                  a._id,
                                  a.name
                                )
                              }
                            />
                            <span className="checkmark" />
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
            {/* End li Location */}


          </ul>
        </div>
      </div>
    </>
  );
};

export default TopFilterBar;

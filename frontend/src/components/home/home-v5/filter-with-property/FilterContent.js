"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { getActiveCategories } from "@/api/category";
import { getPropertyTypesByCategory } from "@/api/propertyType";
import { getAreasByCityIdFrontend } from "@/api/area";
import { buildPropertiesListingPath } from "@/lib/listingPath";

import LookingFor from "./LookingFor";
import Location from "./Location";

const MENU_MAX_HEIGHT = 280;

const toSelectOptions = (items) =>
  (items || []).map((item) => ({
    value: item._id,
    label: item.name,
  }));

const HERO_FILTER_CITY_ID =
  process.env.NEXT_PUBLIC_HERO_FILTER_CITY_ID ||
  "6915742bf942653e88666810";

/** Hero filter: only these two categories (matches listing API slug values). */
const HERO_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const FilterContent = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(HERO_CATEGORIES[0]);
  const filterRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(HERO_CATEGORIES);
  const [areaOptions, setAreaOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getActiveCategories();
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped = HERO_CATEGORIES.map((fallback) => {
          const match = rows.find(
            (category) =>
              String(category?.slug || "").toLowerCase() === fallback.value ||
              String(category?.name || "").toLowerCase() === fallback.value
          );
          return {
            ...fallback,
            id: match?._id ? String(match._id) : fallback.id,
            slug: match?.slug || fallback.value,
          };
        });
        if (!cancelled) {
          setCategoryOptions(mapped);
          setSelectedCategory((current) =>
            mapped.find((category) => category.value === current?.value) || mapped[0] || current
          );
        }
      } catch {
        if (!cancelled) setCategoryOptions(HERO_CATEGORIES);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingAreas(true);
      try {
        const res = await getAreasByCityIdFrontend(HERO_FILTER_CITY_ID);
        const opts = toSelectOptions(res?.data);
        if (!cancelled) {
          setAreaOptions(opts);
          setSelectedArea(opts[0] ?? null);
        }
      } catch {
        if (!cancelled) {
          setAreaOptions([]);
          setSelectedArea(null);
        }
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTypes(true);
      try {
        const catVal = selectedCategory?.id || selectedCategory?.value || "";
        if (!catVal) return;
        const res = await getPropertyTypesByCategory(catVal);
        const opts = toSelectOptions(res?.data);
        if (!cancelled) {
          setPropertyTypeOptions(opts);
          setSelectedPropertyType((current) => {
            if (current && opts.some((option) => option.value === current.value)) {
              return current;
            }
            return opts[0] ?? null;
          });
        }
      } catch {
        if (!cancelled) {
          setPropertyTypeOptions([]);
          setSelectedPropertyType(null);
        }
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  useEffect(() => {
    const container = filterRef.current;
    if (!container) return;

    const handleDropdownShow = (e) => {
      const dropdown = e.target.closest?.(".dropdown") || e.target;
      const toggle = dropdown?.querySelector?.('[data-bs-toggle="dropdown"]');
      const menu = dropdown?.querySelector?.(".dropdown-menu");
      if (!toggle || !menu) return;

      const rect = toggle.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow) {
        dropdown.classList.add("dropdown-up");
      } else {
        dropdown.classList.remove("dropdown-up");
      }
    };

    const handleDropdownHidden = (e) => {
      const dropdown = e.target.closest?.(".dropdown") || e.target;
      if (dropdown?.classList) dropdown.classList.remove("dropdown-up");
    };

    container.addEventListener("show.bs.dropdown", handleDropdownShow);
    container.addEventListener("hidden.bs.dropdown", handleDropdownHidden);
    return () => {
      container.removeEventListener("show.bs.dropdown", handleDropdownShow);
      container.removeEventListener("hidden.bs.dropdown", handleDropdownHidden);
    };
  }, []);

  const handleSearch = useCallback(() => {
    router.push(
      buildPropertiesListingPath({
        category: selectedCategory?.slug || selectedCategory?.value,
        propertyTypeId: selectedPropertyType?.value,
        propertyTypeSlug: selectedPropertyType?.label,
        areaId: selectedArea?.value,
        areaSlug: selectedArea?.label,
        search: keyword.trim() || undefined,
      })
    );
  }, [keyword, selectedPropertyType, selectedArea, selectedCategory, router]);

  return (
    <div
      ref={filterRef}
      className="advance-style4 at-home5 mt-100 mt50-lg mb10 mx-auto animate-up-2"
    >
      <ul className="nav nav-tabs border-0" role="tablist">
        {categoryOptions.map((cat) => (
          <li className="nav-item" key={cat.value}>
            <button
              type="button"
              role="tab"
              className={`nav-link border-0 bg-transparent ${selectedCategory?.value === cat.value ? "active" : ""}`}
              aria-selected={selectedCategory?.value === cat.value}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content text-start">
        <div className="active tab-pane">
          <div className="advance-content-style3 at-home5">
            <div className="row align-items-center gx-4 gy-2 hero-filter-bar-row">
              <div className="col-12 col-md-3 col-xl-4 bdrr1 bdrrn-sm">
                <div className="px-0">
                  <div className="bootselect-multiselect">
                    <label className="fz14">Search</label>
                    <div className="advance-search-field position-relative">
                      <form
                        className="form-search position-relative"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSearch();
                        }}
                      >
                        <div className="box-search">
                          <input
                            className="form-control select-borderless ps-0"
                            style={{ border: "none", background: "transparent", boxShadow: "none", padding: "0" }}
                            type="text"
                            name="search"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder={`Enter Keyword for ${selectedCategory?.label || "Residential"}`}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-3 col-xl-3 bdrr1 bdrrn-sm">
                <div className="px-0">
                  <div className="bootselect-multiselect">
                    <label className="fz14">Looking For</label>
                    <LookingFor
                      options={propertyTypeOptions}
                      value={selectedPropertyType}
                      onChange={setSelectedPropertyType}
                      isLoading={loadingTypes}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-3 col-xl-3 bdrr1 bdrrn-sm">
                <div className="px-0">
                  <div className="bootselect-multiselect">
                    <label className="fz14">Location</label>
                    <Location
                      options={areaOptions}
                      value={selectedArea}
                      onChange={setSelectedArea}
                      isLoading={loadingAreas}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-auto d-flex justify-content-center justify-content-md-end align-items-center pt-2 pt-md-0">
                <div className="d-flex align-items-center">
                  <button
                    className="advance-search-icon ud-btn btn-thm"
                    type="button"
                    onClick={handleSearch}
                  >
                    <span className="flaticon-search" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterContent;

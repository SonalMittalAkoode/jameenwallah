
'use client'



import { getPropertiesWithFilters } from "@/api/property";
import { getActiveCategories } from "@/api/category";
import { getCityByIdFrontend } from "@/api/city";
import { getAllAreasFrontend, getAreaByIdFrontend } from "@/api/area";
import {
  getAllPropertyTypesFrontend,
  getPropertyTypesByCategory,
} from "@/api/propertyType";
import { getCleanPrimaryPropertyImage, resolveImageSrc } from "@/utils/resolveImage";
import {
  formatPropertyLocation,
  formatSizeLabel,
  getBathroomLabel,
  getBedroomLabel,
  getSizeSqFt,
} from "@/utils/propertyDisplay";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { parsePropertiesListingPath } from "@/lib/listingPath";
import AdvanceFilterModal from '@/components/common/advance-filter-two'
import TopFilterBar from './TopFilterBar'
import FeaturedListings from './FeatuerdListings'
import PaginationTwo from "../../PaginationTwo";

const PAGE_LIMIT = 9;
const PRICE_FILTER_MAX = 1000000000;
const looksLikeObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s || "").trim());
const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const comparableSlug = (value = "") =>
  toSlug(value)
    .replace(/-+/g, "-")
    .replace(/s$/, "");

const mapApiPropertyToListing = (item) => {
  const image = getCleanPrimaryPropertyImage(item);
  const priceNum = Number(item?.description?.price);
  let price;
  if (Number.isFinite(priceNum) && priceNum > 0) {
    price = `₹${new Intl.NumberFormat("en-IN").format(priceNum)}`;
  } else if (item?.minPrice != null && Number(item.minPrice) > 0) {
    price = `₹${new Intl.NumberFormat("en-IN").format(Number(item.minPrice))}`;
  } else {
    price = "Price on request";
  }
  const slug = item?.description?.slug || item?._id;
  return {
    uid: item?._id,
    id: slug || item._id,
    slug: item?.description?.slug,
    title: item?.description?.title || "Property",
    location: formatPropertyLocation(item),
    bed: getBedroomLabel(item),
    bath: getBathroomLabel(item),
    sqft: formatSizeLabel(item),
    price,
    forRent: false,
    image,
    yearBuilding: item?.details?.yearBuilt ?? 2020,
    builder: item?.description?.builder ? {
      title: item.description.builder.title,
      description: item.description.builder.description,
      image: resolveImageSrc(item.description.builder.image, ""),
    } : null,
    category: item?.description?.category?.name || null,
    propertyType: item?.description?.propertyType?.name || "property type not specified",
    propertyStatus: item?.details?.propertyStatus || "status not specified",
    parking: item?.details?.parking || "N/A",
    sizeInSqFt: getSizeSqFt(item),
  };
};

const sortToApi = (label) => {
  const t = String(label || "").trim();
  if (t === "Price Low") return "price";
  if (t === "Price High") return "-price";
  return "-createdAt";
};

const apiSortToLabel = (sortValue = "") => {
  const t = String(sortValue || "").trim();
  if (t === "price") return "Price Low";
  if (t === "-price") return "Price High";
  return "Newest";
};

const splitCsvParam = (value = "") =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export default function ProperteyFiltering({
  breadcrumbLabel = "For Rent",
  initialCategory = "",
  categorydata = null,
  topic = null,
}) {
  const pathname = usePathname();
  const pathFilters = useMemo(
    () => parsePropertiesListingPath(pathname),
    [pathname]
  );
  const searchParams = useSearchParams();
  const categoryFromUrl =
    pathFilters.category || searchParams.get("category") || "";
  const effectiveCategory = categoryFromUrl || initialCategory;
  const cityFromUrl =
    pathFilters.cityId || searchParams.get("city") || "";
  const areaFromUrl = (
    pathFilters.area ||
    searchParams.get("area") ||
    ""
  ).trim();
  const searchFromUrl =
    pathFilters.search ||
    searchParams.get("search") ||
    searchParams.get("keyword") ||
    "";
  const propertyTypeFromUrl =
    pathFilters.propertyType || searchParams.get("propertyType") || "";
  const sortFromUrl = searchParams.get("sort") || "";
  const propertyStatusFromUrl = searchParams.get("propertyStatus") || "";
  const furnishingStatusFromUrl = searchParams.get("furnishingStatus") || "";
  const ownershipTypeFromUrl = searchParams.get("ownershipType") || "";
  const facingFromUrl = searchParams.get("facing") || "";

  const [listingRows, setListingRows] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

    const [currentSortingOption, setCurrentSortingOption] = useState("Newest")

        const [pageNumber, setPageNumber] = useState(1)
  
    const [listingStatus, setListingStatus] = useState('All')
    const [propertyTypes, setPropertyTypes] = useState([])
    const [priceRange, setPriceRange] = useState([0, PRICE_FILTER_MAX])
    const [bedrooms, setBedrooms] = useState(0)
    const [bathroms, setBathroms] = useState(0)
    const [location, setLocation] = useState("All Cities")
    /** When true, ignore `area` from the URL so filters match manual city/search changes. */
    const [areaCleared, setAreaCleared] = useState(false);
    /** null = follow URL for area; string (incl. "") = explicit choice ("" = city only, no area filter). */
    const [manualAreaId, setManualAreaId] = useState(null);
    const effectiveAreaId = useMemo(() => {
      if (manualAreaId !== null) return manualAreaId;
      if (areaCleared) return "";
      return areaFromUrl || "";
    }, [manualAreaId, areaCleared, areaFromUrl]);
    const [areaDisplayName, setAreaDisplayName] = useState("");
  const [resolvedAreaId, setResolvedAreaId] = useState("");
     const [squirefeet, setSquirefeet] = useState([])
    const [yearBuild, setyearBuild] = useState([])
    const [categories, setCategories] = useState([])
    const [resolvedCategoryKey, setResolvedCategoryKey] = useState("")
    const [propertyTypeOptions, setPropertyTypeOptions] = useState([])
    const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
      return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
      setCurrentSortingOption(apiSortToLabel(sortFromUrl));
    }, [sortFromUrl]);

    useEffect(() => {
      const incoming = splitCsvParam(propertyTypeFromUrl);
      if (!incoming.length) {
        setPropertyTypes([]);
        return;
      }
      if (!propertyTypeOptions.length) {
        setPropertyTypes(incoming);
        return;
      }
      const mapped = incoming
        .map((token) => {
          const t = String(token).trim();
          if (looksLikeObjectId(t)) return t;
          const bySlug = propertyTypeOptions.find(
            (opt) => comparableSlug(opt?.name) === comparableSlug(t)
          );
          return bySlug?._id ? String(bySlug._id) : "";
        })
        .filter(Boolean);
      setPropertyTypes([...new Set(mapped)]);
    }, [propertyTypeFromUrl, propertyTypeOptions]);

    useEffect(() => {
      const c = (cityFromUrl || "").trim();
      if (!c) {
        setLocation("All Cities");
        return;
      }
      if (/^[a-f\d]{24}$/i.test(c)) {
        let cancelled = false;
        getCityByIdFrontend(c)
          .then((res) => {
            if (cancelled) return;
            const name = res?.data?.name;
            if (name) setLocation(name);
          })
          .catch(() => {});
        return () => {
          cancelled = true;
        };
      }
      setLocation(c);
    }, [cityFromUrl]);

    useEffect(() => {
      setAreaCleared(false);
    }, [areaFromUrl]);

    useEffect(() => {
      setManualAreaId(null);
    }, [areaFromUrl]);

    useEffect(() => {
      if (!effectiveAreaId) {
        setAreaDisplayName("");
        setResolvedAreaId("");
        return;
      }
      if (!looksLikeObjectId(effectiveAreaId)) {
        let cancelled = false;
        getAllAreasFrontend()
          .then((res) => {
            if (cancelled) return;
            const rows = Array.isArray(res?.data) ? res.data : [];
            const matched = rows.find(
              (a) => toSlug(a?.name) === toSlug(effectiveAreaId)
            );
            if (!matched?._id) {
              setAreaDisplayName("");
              setResolvedAreaId("");
              return;
            }
            setAreaDisplayName(matched.name || "");
            setResolvedAreaId(String(matched._id));
            const cityName = matched?.city?.name;
            if (cityName) setLocation(cityName);
          })
          .catch(() => {
            if (!cancelled) {
              setAreaDisplayName("");
              setResolvedAreaId("");
            }
          });
        return () => {
          cancelled = true;
        };
      }
      let cancelled = false;
      getAreaByIdFrontend(effectiveAreaId)
        .then((res) => {
          if (cancelled) return;
          const a = res?.data;
          if (a?.name) setAreaDisplayName(a.name);
          setResolvedAreaId(a?._id ? String(a._id) : "");
          const cityName = a?.city?.name;
          if (cityName) setLocation(cityName);
        })
        .catch(() => {
          if (!cancelled) {
            setAreaDisplayName("");
            setResolvedAreaId("");
          }
        });
      return () => {
        cancelled = true;
      };
    }, [effectiveAreaId]);

    useEffect(() => {
      setSearchQuery(searchFromUrl);
    }, [searchFromUrl]);

    useEffect(() => {
      const categorySlug = String(effectiveCategory || "").trim();
      if (!categorySlug) {
        setResolvedCategoryKey("");
        return;
      }
      if (looksLikeObjectId(categorySlug)) {
        setResolvedCategoryKey(categorySlug);
        return;
      }
      let cancelled = false;
      getActiveCategories()
        .then((res) => {
          if (cancelled) return;
          const rows = Array.isArray(res?.data) ? res.data : [];
          const matched = rows.find(
            (category) =>
              toSlug(category?.slug) === toSlug(categorySlug) ||
              toSlug(category?.name) === toSlug(categorySlug)
          );
          setResolvedCategoryKey(matched?._id ? String(matched._id) : categorySlug);
        })
        .catch(() => {
          if (!cancelled) setResolvedCategoryKey(categorySlug);
        });
      return () => {
        cancelled = true;
      };
    }, [effectiveCategory]);

    useEffect(() => {
      let cancelled = false;
      const categoryKeys =
        categories.length > 0
          ? categories
          : resolvedCategoryKey || effectiveCategory
            ? [resolvedCategoryKey || effectiveCategory]
            : null;

      (async () => {
        setLoadingPropertyTypes(true);
        try {
          if (!categoryKeys) {
            const res = await getAllPropertyTypesFrontend();
            const list =
              res?.status === "success" && Array.isArray(res?.data)
                ? res.data
                : [];
            if (!cancelled) {
              setPropertyTypeOptions(
                list.map((pt) => ({ _id: String(pt._id), name: pt.name }))
              );
            }
            return;
          }
          const merged = new Map();
          for (const key of categoryKeys) {
            try {
              const res = await getPropertyTypesByCategory(key);
              const list = Array.isArray(res?.data) ? res.data : [];
              list.forEach((pt) => {
                if (pt?._id && pt?.name) {
                  merged.set(String(pt._id), {
                    _id: String(pt._id),
                    name: pt.name,
                  });
                }
              });
            } catch {
              /* skip failed category */
            }
          }
          if (!cancelled) {
            setPropertyTypeOptions(
              [...merged.values()].sort((a, b) =>
                a.name.localeCompare(b.name)
              )
            );
          }
        } catch {
          if (!cancelled) setPropertyTypeOptions([]);
        } finally {
          if (!cancelled) setLoadingPropertyTypes(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [categories, effectiveCategory, resolvedCategoryKey]);

    useEffect(() => {
      if (!propertyTypeOptions.length) return;
      const allowed = new Set(propertyTypeOptions.map((p) => p._id));
      setPropertyTypes((prev) => {
        const next = prev.filter((x) => allowed.has(String(x)));
        return next.length === prev.length ? prev : next;
      });
    }, [propertyTypeOptions]);

    const resetFilter = ()=>{
      setListingStatus('All')
      setPropertyTypes([])
      setPriceRange([0, PRICE_FILTER_MAX])
      setBedrooms(0)
      setBathroms(0)
      setAreaCleared(true)
      setManualAreaId(null)
      setAreaDisplayName("")
      setLocation('All Cities')
      setSquirefeet([])
      setyearBuild([0,2050])
      setCategories([])
      setCurrentSortingOption('Newest')
      setSearchQuery("")
     document.querySelectorAll(".filterInput").forEach(function(element) {
      element.value = null;
  });

     document.querySelectorAll(".filterSelect").forEach(function(element) {
      element.value = 'All Cities';
  });
  


    }

    const handlelistingStatus =(elm)=>{
      setListingStatus(pre => pre == elm ? 'All':elm)


    }

    
    
    const handlepropertyTypes = (elm) => {
      const v = String(elm);
      setPropertyTypes((pre) => {
        const ids = pre.map(String);
        return ids.includes(v)
          ? pre.filter((x) => String(x) !== v)
          : [...pre, v];
      });
    };
    const handlepriceRange =(elm)=>{
      setPriceRange(elm)

    }
    const handlebedrooms =(elm)=>{
      setBedrooms(elm)
    }
    const handlebathroms =(elm)=>{
      setBathroms(elm)
    }
    const handlelocation =(elm)=>{
      setAreaCleared(true)
      setManualAreaId(null)
      setAreaDisplayName("")
      setLocation(elm)
    }

    const handleAreaPick = useCallback((areaId, areaName = "") => {
      setManualAreaId(areaId === "" ? "" : String(areaId));
      setAreaDisplayName(areaName ? String(areaName) : "");
    }, []);
    const handlesquirefeet =(elm)=>{
      setSquirefeet(elm)
    }
    const handleyearBuild =(elm)=>{
      setyearBuild(elm)
    }
    const handlecategories =(elm)=>{
      if (elm == 'All') {
        setCategories([])
        
      } else {
        setCategories(pre=>pre.includes(elm) ? [...pre.filter((el)=>el!=elm)] : [...pre,elm])
      }

    }
   const filterFunctions={
    handlelistingStatus,
    handlepropertyTypes,
    handlepriceRange,
    handlebedrooms,
    handlebathroms,
    handlelocation,
    handleAreaPick,
    handlesquirefeet,
    handleyearBuild,
        handlecategories,
    priceRange,
    listingStatus,
    propertyTypes,
    resetFilter,
   
    bedrooms,
    bathroms,
    location,
    areaDisplayName,
    effectiveAreaId,
    squirefeet,
    yearBuild,
    categories,
    effectiveCategory,
    propertyTypeOptions,
    loadingPropertyTypes,
    setPropertyTypes,
    setSearchQuery,
    searchQuery,
  }

  const buildFilters = useCallback(() => {
    const filters = {
      page: pageNumber,
      limit: PAGE_LIMIT,
      sort: sortToApi(currentSortingOption),
    };
    if (categories.length > 0) {
      filters.category = categories.join(",");
    } else if (effectiveCategory) {
      filters.category = effectiveCategory;
    }
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    if (propertyTypes.length > 0) {
      filters.propertyType = propertyTypes.join(",");
    }
    if (location && location !== "All Cities") filters.city = location;
    const apiAreaId =
      resolvedAreaId ||
      (looksLikeObjectId(effectiveAreaId) ? String(effectiveAreaId) : "");
    if (apiAreaId) filters.area = apiAreaId;
    if (priceRange.length === 2 && (priceRange[0] > 0 || priceRange[1] < PRICE_FILTER_MAX)) {
      filters.minPrice = priceRange[0];
      filters.maxPrice = priceRange[1];
    }
    if (bedrooms > 0) filters.minBedrooms = bedrooms;
    if (bathroms > 0) filters.minBathrooms = bathroms;
    if (squirefeet.length === 2 && squirefeet[1]) {
      filters.minSize = squirefeet[0];
      filters.maxSize = squirefeet[1];
    }
    if (yearBuild.length === 2 && yearBuild[1]) {
      filters.minYearBuilt = yearBuild[0];
      filters.maxYearBuilt = yearBuild[1];
    }
    if (propertyStatusFromUrl) filters.propertyStatus = propertyStatusFromUrl;
    if (furnishingStatusFromUrl) filters.furnishingStatus = furnishingStatusFromUrl;
    if (ownershipTypeFromUrl) filters.ownershipType = ownershipTypeFromUrl;
    if (facingFromUrl) filters.facing = facingFromUrl;
    return filters;
  }, [
    pageNumber,
    effectiveCategory,
    categories,
    debouncedSearch,
    propertyTypes,
    location,
    effectiveAreaId,
    resolvedAreaId,
    priceRange,
    bedrooms,
    bathroms,
    squirefeet,
    yearBuild,
    currentSortingOption,
    propertyStatusFromUrl,
    furnishingStatusFromUrl,
    ownershipTypeFromUrl,
    facingFromUrl,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getPropertiesWithFilters(buildFilters());
        if (cancelled) return;
        const raw = Array.isArray(res?.data) ? res.data : [];
        const newRows = raw.map(mapApiPropertyToListing);
        setListingRows((prev) =>
          pageNumber === 1 ? newRows : [...prev, ...newRows]
        );
        setPaginationMeta(res?.pagination ?? null);
      } catch (e) {
        if (!cancelled) {
          setListingRows([]);
          setPaginationMeta(null);
          const msg =
            typeof e === "string"
              ? e
              : e?.message || "Failed to load properties";
          setFetchError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buildFilters]);

  useEffect(() => {
    setPageNumber(1);
  }, [
    effectiveCategory,
    listingStatus,
    propertyTypes,
    priceRange,
    bedrooms,
    bathroms,
    location,
    effectiveAreaId,
    squirefeet,
    yearBuild,
    categories,
    currentSortingOption,
    debouncedSearch,
  ]);

  const totalItems = paginationMeta?.totalItems ?? listingRows.length;

  const pageContentTrac = useMemo(
    () => [
      totalItems === 0 ? 0 : (pageNumber - 1) * PAGE_LIMIT + 1,
      Math.min(pageNumber * PAGE_LIMIT, totalItems),
      totalItems,
    ],
    [pageNumber, totalItems]
  );
    
  return (
    <section className="pt70 pb90 bgc-f7">
        <div className="container">
          <div className="row mb20">
            <div className="col-lg-12">
              <div className="breadcumb-list breadcumb-list-with-mobile-filter">
                <div className="breadcumb-left">
                  <a href="/">Home</a>
                  <span className="title">{">"}</span>
                  <a href="/properties">{breadcrumbLabel}</a>
                </div>

                <a
                  className="filter-btn-left mobile-filter-btn d-block d-lg-none"
                  data-bs-toggle="offcanvas"
                  href="#listingSidebarFilter"
                  role="button"
                  aria-controls="listingSidebarFilter"
                >
                  <span className="flaticon-settings" /> Filter
                </a>
              </div>
            </div>
          </div>
          <div className="row mb20">

            {topic?.description ? (
              <div className="properties-topic-intro">
                <span className="properties-topic-intro__eyebrow">
                  Featured Properties
                </span>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
                <small>Handpicked properties by our team.</small>
              </div>
            ) : categorydata?.data?.description ? (
              <p className="category-description iconbox-style2"
                dangerouslySetInnerHTML={{
                  __html: categorydata?.data?.description,
                }}
              />
            ) : null}
            
          </div>
          {/* start mobile filter sidebar */}
          <div
            className="offcanvas offcanvas-start p-0"
            tabIndex="-1"
            id="listingSidebarFilter"
            aria-labelledby="listingSidebarFilterLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="listingSidebarFilterLabel">
                Listing Filter
              </h5>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body p-0">
              <div className="row m-0 p-3">
                <TopFilterBar
                  filterFunctions={filterFunctions}
                  categoryUrl={effectiveCategory}
                  propertyTypeUrl={propertyTypeFromUrl}
                  showOnMobile
                />
              </div>
            </div>
          </div>
          {/* End mobile filter sidebar */}

          {/* <!-- Advance Feature Modal Start --> */}
          <div className="advance-feature-modal">
            <div
              className="modal fade"
              id="advanceSeachModal"
              tabIndex={-1}
              aria-labelledby="advanceSeachModalLabel"
              aria-hidden="true"
            >
              <AdvanceFilterModal filterFunctions={filterFunctions} />
            </div>
          </div>
          {/* <!-- Advance Feature Modal End --> */}

          <div className="row">
            <TopFilterBar
              filterFunctions={filterFunctions}
              categoryUrl={effectiveCategory}
              propertyTypeUrl={propertyTypeFromUrl}
            />
          </div>
          {/* End TopFilterBar */}

          {fetchError && (
            <p className="text-center text-danger mb-3">{fetchError}</p>
          )}
          {loading && (
            <p className="text-center text-muted mb-3">Loading properties…</p>
          )}

          <div className="row property-listing-card-grid">
            <FeaturedListings data={listingRows} />
          </div>
          {/* End .row */}

          {totalItems > listingRows.length && (
            <div className="col-lg-12">
              <div className="text-center mt30">
                <button
                  type="button"
                  className="ud-btn btn-white bdrs12 default-box-shadow1 px-5"
                  onClick={() => setPageNumber((prev) => prev + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </>
                  ) : (
                    "View More"
                  )}
                </button>
              </div>
            </div>
          )}
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
  )
}

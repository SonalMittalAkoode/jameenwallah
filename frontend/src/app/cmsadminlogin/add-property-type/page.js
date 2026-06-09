"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { getAllCategories } from "@/api/category";
import {
  createPropertyType,
  getPropertyTypeById,
  updatePropertyType,
} from "@/api/propertyType";


const AddPropertyType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [fetchingPropertyType, setFetchingPropertyType] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    selectedCategory: null,
    propertyTypeTitle: "",
    status: "active",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    setShowSelect(true);
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPropertyTypeData = async () => {
      if (!isEditMode) {
        setFormData({
          selectedCategory: null,
          propertyTypeTitle: "",
          status: "active",
        });
        setFetchingPropertyType(false);
        return;
      }

      if (!editId) {
        setFormData({
          selectedCategory: null,
          propertyTypeTitle: "",
          status: "active",
        });
        setFetchingPropertyType(false);
        return;
      }

      if (loadingCategories) {
        return;
      }

      try {
        setFetchingPropertyType(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getPropertyTypeById(editId, token);
        if (response.status === "success" && response.data) {
          const propertyType = response.data;

          const categoryOption = categoryOptions.find(
            (opt) =>
              opt.value ===
              (propertyType.category?._id || propertyType.category)
          );

          setFormData({
            propertyTypeTitle: propertyType.name || "",
            selectedCategory:
              categoryOption ||
              (propertyType.category
                ? {
                    value: propertyType.category._id || propertyType.category,
                    label: propertyType.category.name || "",
                  }
                : null),
            status: propertyType.status || "active",
          });
        } else {
          alert("Failed to load property type data");
          router.push("/cmsadminlogin/property-type-list");
        }
      } catch (error) {
        console.error("Error fetching property type:", error);
        console.error("Error details:", {
          message: error?.message,
          response: error?.response,
          status: error?.status,
          data: error?.data,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });

        let errorMessage = "Failed to load property type data";
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object") {
          errorMessage = JSON.stringify(error);
        }

        alert(errorMessage);
        router.push("/cmsadminlogin/property-type-list");
      } finally {
        setFetchingPropertyType(false);
      }
    };

    if (!loadingCategories && categoryOptions.length > 0) {
      fetchPropertyTypeData();
    } else if (
      !loadingCategories &&
      categoryOptions.length === 0 &&
      isEditMode
    ) {
      fetchPropertyTypeData();
    } else if (!isEditMode) {
      fetchPropertyTypeData();
    }
  }, [isEditMode, editId, categoryOptions, loadingCategories, router]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const token = localStorage.getItem("adminToken");
      const response = await getAllCategories(token);

      if (response.status === "success" && response.data) {
        setCategories(response.data);
        const options = response.data.map((category) => ({
          value: category._id,
          label: category.name,
        }));
        setCategoryOptions(options);
        console.log(
          "[AddPropertyType] Fetched category options:",
          options.length,
          options
        );
      } else {
        alert("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert(error.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedCategory || !formData.propertyTypeTitle.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Authentication required. Please login again.");
        router.push("/cmsadminlogin");
        return;
      }

      const propertyTypeData = {
        name: formData.propertyTypeTitle.trim(),
        categoryId: formData.selectedCategory.value,
        status: formData.status,
      };

      let response;
      if (isEditMode && editId) {
        response = await updatePropertyType(editId, propertyTypeData, token);
        if (response.status === "success") {
          alert("Property type updated successfully!");
          router.push("/cmsadminlogin/property-type-list");
        } else {
          alert(response.message || "Failed to update property type");
        }
      } else {
        response = await createPropertyType(propertyTypeData, token);
        if (response.status === "success") {
          alert("Property type created successfully!");
          setFormData({
            selectedCategory: null,
            propertyTypeTitle: "",
            status: "active",
          });
          router.push("/cmsadminlogin/property-type-list");
        } else {
          alert(response.message || "Failed to create property type");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} property type:`,
        error
      );
      alert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} property type`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Main Header Nav */}
      <DashboardHeader />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* dashboard_content_wrapper */}
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-md">
          <SidebarDashboard />
          {/* End .dashboard__sidebar */}

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content property-page bgc-f7">
              <div className="row pb40 d-block d-lg-none">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className="row align-items-center pb40">
                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>
                      {isEditMode
                        ? "Edit Property Type"
                        : "Add a New Property Type"}
                    </h2>
                    <p
                      className="text"
                      style={{
                        fontSize: "16px",
                        color: "#6c757d",
                        marginTop: "8px",
                      }}
                    >
                      {isEditMode
                        ? "Update the property type information below."
                        : "Create a property type to categorize listings and improve search filtering."}
                    </p>
                  </div>
                </div>
              </div>
              {/* End .row */}

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4
                      className="title fz17 mb30"
                      style={{ fontWeight: "600", color: "#111827" }}
                    >
                      {isEditMode
                        ? "Edit Property Type"
                        : "Create Property Type"}
                    </h4>
                    {(fetchingPropertyType || loadingCategories) && (
                      <div className="text-center py-4">
                        <p>Loading...</p>
                      </div>
                    )}
                    {!fetchingPropertyType && !loadingCategories && (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-sm-6">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Propertytype Title
                              </label>
                              <input
                                type="text"
                                name="propertyTypeTitle"
                                className="form-control"
                                placeholder="Enter property type title"
                                value={formData.propertyTypeTitle}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* End .col-sm-6 */}

                          <div className="col-sm-6">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Select Category
                              </label>
                              <div className="location-area">
                                {showSelect && (
                                  <Select
                                    styles={{
                                      control: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        fontSize: "16px",
                                        color: "#111827",
                                        minHeight: "auto",
                                        height: "auto",
                                        padding: "6px 12px",
                                        width: "auto",
                                        minWidth: "120px",
                                        "&:hover": {
                                          borderColor: "#FC9401",
                                          cursor: "pointer",
                                        },
                                        "&:focus-within": {
                                          borderColor: "#FC9401",
                                          boxShadow: "0 0 0 1px #FC9401",
                                        },
                                      }),
                                      option: (
                                        styles,
                                        { isFocused, isSelected }
                                      ) => ({
                                        ...styles,
                                        backgroundColor: isSelected
                                          ? "#FC9401"
                                          : isFocused
                                          ? "#F9FAFB"
                                          : "#fff",
                                        color: isSelected ? "#fff" : "#111827",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        padding: "12px 16px",
                                        minHeight: "48px",
                                      }),
                                      menu: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        zIndex: 9999,
                                        padding: "8px 0",
                                        marginTop: "4px",
                                      }),
                                      placeholder: (styles) => ({
                                        ...styles,
                                        color: "#9CA3AF",
                                        fontSize: "16px",
                                      }),
                                      singleValue: (styles) => ({
                                        ...styles,
                                        color: "#111827",
                                        fontSize: "16px",
                                      }),
                                      dropdownIndicator: (styles) => ({
                                        ...styles,
                                        color: "#6B7280",
                                        "&:hover": {
                                          color: "#FC9401",
                                        },
                                      }),
                                      indicatorSeparator: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#E5E7EB",
                                      }),
                                      menuPortal: (styles) => ({
                                        ...styles,
                                        zIndex: 9999,
                                      }),
                                    }}
                                    className="select-custom pl-0"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    required
                                    options={categoryOptions}
                                    value={formData.selectedCategory}
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedCategory: selected,
                                      }))
                                    }
                                    menuPortalTarget={
                                      typeof window !== "undefined"
                                        ? document.body
                                        : null
                                    }
                                    menuPosition="fixed"
                                    menuPlacement="auto"
                                    menuShouldScrollIntoView={false}
                                    placeholder={
                                      loadingCategories
                                        ? "Loading categories..."
                                        : "-- Select Category --"
                                    }
                                    isDisabled={
                                      loadingCategories ||
                                      categoryOptions.length === 0
                                    }
                                    isLoading={loadingCategories}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          {/* End .col-sm-6 */}
                        </div>
                        {/* End .row */}

                        <div className="row">
                          <div className="col-sm-6">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Status
                              </label>
                              <div className="location-area">
                                {showSelect && (
                                  <Select
                                    options={statusOptions}
                                    value={statusOptions.find(
                                      (opt) => opt.value === formData.status
                                    )}
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        status: selected?.value || "active",
                                      }))
                                    }
                                    menuPortalTarget={
                                      typeof window !== "undefined"
                                        ? document.body
                                        : null
                                    }
                                    menuPosition="fixed"
                                    menuPlacement="auto"
                                    menuShouldScrollIntoView={false}
                                    styles={{
                                      control: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        fontSize: "16px",
                                        color: "#111827",
                                        minHeight: "auto",
                                        height: "auto",
                                        padding: "6px 12px",
                                        width: "auto",
                                        minWidth: "120px",
                                        "&:hover": {
                                          borderColor: "#FC9401",
                                          cursor: "pointer",
                                        },
                                        "&:focus-within": {
                                          borderColor: "#FC9401",
                                          boxShadow: "0 0 0 1px #FC9401",
                                        },
                                      }),
                                      option: (
                                        styles,
                                        { isFocused, isSelected }
                                      ) => ({
                                        ...styles,
                                        backgroundColor: isSelected
                                          ? "#FC9401"
                                          : isFocused
                                          ? "#F9FAFB"
                                          : "#fff",
                                        color: isSelected ? "#fff" : "#111827",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        padding: "12px 16px",
                                        minHeight: "48px",
                                      }),
                                      menu: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        zIndex: 9999,
                                        padding: "8px 0",
                                        marginTop: "4px",
                                      }),
                                      placeholder: (styles) => ({
                                        ...styles,
                                        color: "#9CA3AF",
                                        fontSize: "16px",
                                      }),
                                      singleValue: (styles) => ({
                                        ...styles,
                                        color: "#111827",
                                        fontSize: "16px",
                                      }),
                                      dropdownIndicator: (styles) => ({
                                        ...styles,
                                        color: "#6B7280",
                                        "&:hover": {
                                          color: "#FC9401",
                                        },
                                      }),
                                      indicatorSeparator: (styles) => ({
                                        ...styles,
                                        backgroundColor: "#E5E7EB",
                                      }),
                                      menuPortal: (styles) => ({
                                        ...styles,
                                        zIndex: 9999,
                                      }),
                                    }}
                                    className="select-custom pl-0"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    required
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          {/* End .col-sm-6 */}
                        </div>
                        {/* End .row */}

                        <div className="row mt30">
                          <div className="col-12">
                            <div className="d-flex gap-3">
                              <button
                                type="button"
                                className="ud-btn btn-white"
                                onClick={handleBack}
                                style={{ minWidth: "120px" }}
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="ud-btn btn-thm"
                                style={{ minWidth: "120px" }}
                                disabled={loading || fetchingPropertyType}
                              >
                                {loading
                                  ? isEditMode
                                    ? "Updating..."
                                    : "Submitting..."
                                  : isEditMode
                                  ? "Update"
                                  : "Submit"}
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* End .row */}
                      </form>
                    )}
                  </div>
                </div>
              </div>
              {/* End .row */}
            </div>
            {/* End dashboard__content */}

            <Footer />
          </div>
          {/* End .dashboard__main */}
        </div>
      </div>
      {/* dashboard_content_wrapper */}
    </>
  );
};

export default AddPropertyType;

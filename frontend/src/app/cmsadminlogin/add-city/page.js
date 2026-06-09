"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { createCity, getCityById, updateCity } from "@/api/city";
import { getAllStates } from "@/api/state";


const AddCity = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const fileInputRef = useRef(null);

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [fetchingCity, setFetchingCity] = useState(isEditMode);
  const [stateOptions, setStateOptions] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [originalStateId, setOriginalStateId] = useState(null);
  const [formData, setFormData] = useState({
    selectedState: null,
    cityTitle: "",
    cityH1Title: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    status: "active",
    isTrending: "deactive",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const trendingOptions = [
    { value: "active", label: "Active" },
    { value: "deactive", label: "Deactive" },
  ];

  const customSelectStyles = {
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
      "&:hover": { borderColor: "#FC9401", cursor: "pointer" },
      "&:focus-within": {
        borderColor: "#FC9401",
        boxShadow: "0 0 0 1px #FC9401",
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
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
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
      "&:hover": { color: "#FC9401" },
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: "#E5E7EB",
    }),
    menuPortal: (styles) => ({
      ...styles,
      zIndex: 9999,
    }),
  };

  useEffect(() => {
    setShowSelect(true);
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const token = localStorage.getItem("adminToken");
      const response = await getAllStates(token);
      if (response.status === "success" && Array.isArray(response.data)) {
        const options = response.data.map((state, index) => ({
          value: state._id,
          label: state.name || `State ${index + 1}`,
        }));
        setStateOptions(options);
        setFormData((prev) => ({
          ...prev,
          selectedState: null,
        }));
      } else {
        setStateOptions([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  useEffect(() => {
    const fetchCityData = async () => {
      if (!isEditMode || !editId) {
        setFormData({
          selectedState: null,
          cityTitle: "",
          cityH1Title: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
          status: "active",
          isTrending: "deactive",
        });
        setOriginalStateId(null);
        setUploadedImage(null);
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFetchingCity(false);
        return;
      }

      try {
        const token = localStorage.getItem("adminToken");
        const response = await getCityById(editId, token);

        if (response.status === "success" && response.data) {
          const city = response.data;
          const stateId = city.state?._id || city.state;
          
          // Store the original state ID to track changes
          setOriginalStateId(stateId || null);

          if (stateOptions.length === 0) {
            await fetchStates();
          }

          setFormData({
            cityTitle: city.name || "",
            cityH1Title: city.cityH1Title || "",
            description: city.description || "",
            metaTitle: city.metaTitle || "",
            metaDescription: city.metaDescription || "",
            selectedState:
              stateId && stateOptions.length
                ? stateOptions.find((opt) => opt.value === stateId) ||
                  { value: stateId, label: city.state?.name || "Selected State" }
                : stateId
                ? { value: stateId, label: city.state?.name || "Selected State" }
                : null,
            status: city.status || "active",
            isTrending: city.isTrending || "deactive",
          });

          // Set image if available
          if (city.image) {
            const imageUrl = city.image.startsWith("http")
              ? city.image
              : `${
                  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
                }${city.image}`;
            setUploadedImage(imageUrl);
          } else {
            setUploadedImage(null);
          }
        } else {
          alert("Failed to load city data");
          router.push("/cmsadminlogin/city-list");
        }
      } catch (error) {
        console.error("Error fetching city:", error);
        alert("Failed to load city data");
        router.push("/cmsadminlogin/city-list");
      } finally {
        setFetchingCity(false);
      }
    };

    fetchCityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editId, stateOptions.length]);

  const handleImageUpload = (files) => {
    if (!files || !files[0]) {
      return;
    }
    const file = files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityTitle.trim()) return alert("Please fill in the city title");

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Authentication required. Please login again.");
        router.push("/cmsadminlogin");
        return;
      }

      const cityData = {
        name: formData.cityTitle.trim(),
        cityH1Title: formData.cityH1Title || "",
        description: formData.description || "",
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
        status: formData.status,
        isTrending: formData.isTrending,
      };

      // Handle stateId based on mode and selection
      if (isEditMode) {
        // In edit mode, always send stateId to allow clearing or changing
        // If selectedState is null, send null to clear the state
        // If selectedState has a value, send that value
        cityData.stateId = formData.selectedState ? formData.selectedState.value : null;
      } else {
        // In create mode, only send stateId if a state is selected
        if (formData.selectedState) {
          cityData.stateId = formData.selectedState.value;
        }
      }

      // Add image file if available
      if (imageFile) {
        cityData.image = imageFile;
      }

      let response;
      if (isEditMode && editId) {
        response = await updateCity(editId, cityData, token);
        if (response.status === "success") {
          alert("City updated successfully!");
          router.push("/cmsadminlogin/city-list");
        } else {
          alert(response.message || "Failed to update city.");
        }
      } else {
        response = await createCity(cityData, token);
        if (response.status === "success") {
          alert("City created successfully!");
          router.push("/cmsadminlogin/city-list");
        } else {
          alert(response.message || "Failed to create city.");
        }
      }
    } catch (error) {
      console.error("Error submitting city:", error);
      alert(
        error?.message ||
          error?.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} city.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-md">
          <SidebarDashboard />
          <div className="dashboard__main pl0-md">
            <div className="dashboard__content property-page bgc-f7">
              <div className="row pb40 d-block d-lg-none">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
              </div>

              <div className="row align-items-center pb40">
                <div className="col-lg-12">
                  <div className="dashboard_title_area">
                    <h2>{isEditMode ? "Edit City" : "Add a New City"}</h2>
                    <p className="subtext">
                      {isEditMode
                        ? "Update the city information below."
                        : "Use this form to add a new city or region."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="form-title">
                      {isEditMode ? "Edit Listing" : "Create Listing"}
                    </h4>

                    {fetchingCity || loadingStates ? (
                      <div className="loading-message">
                        <p>Loading city data...</p>
                      </div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Image Upload */}
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Upload City Image
                              </label>
                              <div
                                className="upload-img position-relative overflow-hidden bdrs12 text-center mb20"
                                style={{
                                  minHeight: "260px",
                                  border: "1px solid #e5e7eb",
                                  backgroundColor: "#f9fafb",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "20px",
                                }}
                              >
                                {uploadedImage ? (
                                  <>
                                    <div
                                      className="position-relative mb20"
                                      style={{ width: "260px", height: "260px" }}
                                    >
                                      <Image
                                        src={uploadedImage}
                                        alt="City image"
                                        fill
                                        style={{
                                          objectFit: "cover",
                                          borderRadius: "8px",
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="tag-del"
                                        onClick={handleImageRemove}
                                        style={{
                                          position: "absolute",
                                          top: "5px",
                                          right: "5px",
                                          border: "none",
                                          background: "rgba(0,0,0,0.5)",
                                          borderRadius: "50%",
                                          width: "30px",
                                          height: "30px",
                                          color: "white",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <span className="fas fa-times" />
                                      </button>
                                    </div>
                                    <label
                                      className="ud-btn btn-white"
                                      style={{ cursor: "pointer" }}
                                    >
                                      Change Photo
                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          handleImageUpload(e.target.files)
                                        }
                                      />
                                    </label>
                                  </>
                                ) : (
                                  <>
                                    <div
                                      className="mb20"
                                      style={{ fontSize: "48px", color: "#9ca3af" }}
                                    >
                                      260X260
                                    </div>
                                    <label
                                      className="ud-btn btn-white"
                                      style={{ cursor: "pointer" }}
                                    >
                                      <span className="flaticon-upload me-2" />
                                      Upload Photo
                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          handleImageUpload(e.target.files)
                                        }
                                      />
                                    </label>
                                    <p
                                      className="text mt10"
                                      style={{
                                        fontSize: "12px",
                                        color: "#6b7280",
                                      }}
                                    >
                                      Recommended size 260px x 260px
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* City Title */}
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                City Title
                              </label>
                              <input
                                type="text"
                                name="cityTitle"
                                className="form-control"
                                placeholder="Enter city title"
                                value={formData.cityTitle}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cityTitle: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          {/* City H1 Title */}
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                City H1 Title (Breadcrumb Title)
                              </label>
                              <input
                                type="text"
                                name="cityH1Title"
                                className="form-control"
                                placeholder='e.g., "Properties in Gurgaon"'
                                value={formData.cityH1Title}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cityH1Title: e.target.value,
                                  })
                                }
                              />
                              <p
                                className="text mt10"
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                }}
                              >
                                This will be shown as the H1 on the city property listing page.
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="col-sm-12">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Footer Description
                              </label>
                              <textarea
                                name="description"
                                cols={30}
                                rows={5}
                                className="form-control"
                                placeholder="Enter city footer description"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* Meta Title */}
                          <div className="col-sm-12">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Meta Title
                              </label>
                              <input
                                type="text"
                                name="metaTitle"
                                className="form-control"
                                placeholder="Enter meta title (optional)"
                                value={formData.metaTitle}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    metaTitle: e.target.value,
                                  })
                                }
                              />
                              <p
                                className="text mt10"
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                }}
                              >
                                Used for SEO title on the city property listing page.
                              </p>
                            </div>
                          </div>

                          {/* Meta Description */}
                          <div className="col-sm-12">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Meta Description
                              </label>
                              <textarea
                                name="metaDescription"
                                cols={30}
                                rows={3}
                                className="form-control"
                                placeholder="Enter meta description (optional)"
                                value={formData.metaDescription}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    metaDescription: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* State Select */}
                          <div className="col-sm-6 col-xl-3">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Select State
                              </label>
                              {showSelect && (
                                <Select
                                  options={stateOptions}
                                  value={formData.selectedState}
                                  onChange={(selected) =>
                                    setFormData({
                                      ...formData,
                                      selectedState: selected,
                                    })
                                  }
                                  styles={customSelectStyles}
                                  className="select-custom"
                                  classNamePrefix="select"
                                  placeholder="-- Select State --"
                                  isSearchable={false}
                                  isClearable={true}
                                  menuPortalTarget={
                                    typeof window !== "undefined"
                                      ? document.body
                                      : null
                                  }
                                  menuPosition="fixed"
                                  menuPlacement="auto"
                                />
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-sm-6 col-xl-3">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Status
                              </label>
                              {showSelect && (
                                <Select
                                  options={statusOptions}
                                  value={statusOptions.find(
                                    (opt) => opt.value === formData.status
                                  )}
                                  onChange={(selected) =>
                                    setFormData({
                                      ...formData,
                                      status: selected?.value || "active",
                                    })
                                  }
                                  styles={customSelectStyles}
                                  className="select-custom"
                                  classNamePrefix="select"
                                  isSearchable={false}
                                  menuPortalTarget={
                                    typeof window !== "undefined"
                                      ? document.body
                                      : null
                                  }
                                  menuPosition="fixed"
                                  menuPlacement="auto"
                                  required
                                />
                              )}
                            </div>
                          </div>

                          {/* Trending */}
                          <div className="col-sm-6 col-xl-3">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Trending
                              </label>
                              {showSelect && (
                                <Select
                                  options={trendingOptions}
                                  value={trendingOptions.find(
                                    (opt) => opt.value === formData.isTrending
                                  )}
                                  onChange={(selected) =>
                                    setFormData({
                                      ...formData,
                                      isTrending: selected?.value || "deactive",
                                    })
                                  }
                                  styles={customSelectStyles}
                                  className="select-custom"
                                  classNamePrefix="select"
                                  isSearchable={false}
                                  menuPortalTarget={
                                    typeof window !== "undefined"
                                      ? document.body
                                      : null
                                  }
                                  menuPosition="fixed"
                                  menuPlacement="auto"
                                  required
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="row mt30">
                          <div className="col-12">
                            <div className="d-flex gap-3">
                              <button
                                type="button"
                                className="ud-btn btn-white"
                                onClick={() => router.back()}
                                style={{ minWidth: "120px" }}
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="ud-btn btn-thm"
                                style={{ minWidth: "120px" }}
                                disabled={loading}
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
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCity;

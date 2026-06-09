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
import { createArea, getAreaById, updateArea } from "@/api/area";
import { getAllCities } from "@/api/city";


const customStyles = {
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
    minWidth: "160px",
    "&:hover": {
      borderColor: "#FC9401",
      cursor: "pointer",
    },
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

const AddArea = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const fileInputRef = useRef(null);

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [fetchingArea, setFetchingArea] = useState(isEditMode);
  const [cityOptions, setCityOptions] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    selectedCity: null,
    areaTitle: "",
     areaSlug: "",
      areaH1Title: "",
    description: "",
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

  useEffect(() => {
    setShowSelect(true);
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchAreaData = async () => {
      if (!isEditMode || !editId) {
        setFormData({
          selectedCity: null,
          areaTitle: "",
          status: "active",
          isTrending: "deactive",
        });
        setUploadedImage(null);
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFetchingArea(false);
        return;
      }

      if (loadingCities) return;

      try {
        setFetchingArea(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getAreaById(editId, token);
        if (response.status === "success" && response.data) {
          const area = response.data;
          const cityOption = cityOptions.find(
            (opt) => opt.value === (area.city?._id || area.city)
          );

          setFormData({
            areaTitle: area.name || "",
            areaSlug: area.slug || "",
            selectedCity:
              cityOption ||
              (area.city
                ? {
                    value: area.city._id || area.city,
                    label: area.city.name || "",
                  }
                : null),
            status: area.status || "active",
            isTrending: area.isTrending || "deactive",
            areaH1Title: area.areaH1Title || "",
            description: area.description || "",
          });

          // Set image if available
          if (area.image && area.image.trim()) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            let imageUrl;
            
            if (area.image.startsWith("http://") || area.image.startsWith("https://")) {
              imageUrl = area.image;
            } else if (area.image.startsWith("/")) {
              imageUrl = `${baseUrl}${area.image}`;
            } else {
              imageUrl = `${baseUrl}/${area.image}`;
            }
            
            setUploadedImage(imageUrl);
          } else {
            setUploadedImage(null);
          }
        } else {
          alert("Failed to load area data");
          router.push("/cmsadminlogin/area-list");
        }
      } catch (error) {
        console.error("Error fetching area:", error);
        alert("Failed to load area data");
        router.push("/cmsadminlogin/area-list");
      } finally {
        setFetchingArea(false);
      }
    };

    if (!loadingCities) fetchAreaData();
  }, [isEditMode, editId, loadingCities, cityOptions, router]);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const token = localStorage.getItem("adminToken");
      const response = await getAllCities(token);

      if (response.status === "success" && response.data) {
        const options = response.data.map((city) => ({
          value: city._id,
          label: city.name,
        }));
        setCityOptions(options);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "areaTitle") {
        return {
          ...prev,
          areaTitle: value,
          areaSlug: value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
        };
      }
      return { ...prev, [name]: value };
    });
  };

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

    if (!formData.areaTitle.trim()) {
      alert("Please fill in the area title");
      return;
    }

    if (!formData.areaSlug.trim()) {
      alert("Please fill in the area slug");
      return;
    }

    if (!formData.selectedCity) {
      alert("Please select a city");
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

      const areaData = {
        name: formData.areaTitle.trim(),
        slug: formData.areaSlug.trim(),
        areaH1Title: formData.areaH1Title,
        description: formData.description,
        cityId: formData.selectedCity.value,
        status: formData.status,
        isTrending: formData.isTrending,
      };

      // Add image file if available
      if (imageFile) {
        areaData.image = imageFile;
      }

      let response;
      if (isEditMode && editId) {
        response = await updateArea(editId, areaData, token);
        alert(response.status === "success" ? "Area updated successfully!" : "Failed to update area");
        router.push("/cmsadminlogin/area-list");
      } else {
        response = await createArea(areaData, token);
        alert(response.status === "success" ? "Area created successfully!" : "Failed to create area");
        setFormData({ selectedCity: null, areaTitle: "", areaSlug: "", areaH1Title: "", description: "", status: "active", isTrending: "deactive" });
        router.push("/cmsadminlogin/area-list");
      }
    } catch (error) {
      console.error("Error creating/updating area:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

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
                    <h2>{isEditMode ? "Edit Area" : "Add a New Area"}</h2>
                    <p className="section-subtitle">
                      {isEditMode
                        ? "Update the area information below."
                        : "Use this form to add a new area or region."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="form-title">
                      {isEditMode ? "Edit Area" : "Create Area"}
                    </h4>

                    {fetchingArea || loadingCities ? (
                      <div className="text-center py-4">
                        <p>Loading area data...</p>
                      </div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Image Upload */}
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Upload Area Image
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
                                        alt="Area image"
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

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="form-label">Area Title</label>
                              <input
                                type="text"
                                name="areaTitle"
                                className="form-control"
                                placeholder="Enter area title"
                                value={formData.areaTitle}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Area Slug (SEO URL)
                                    </label>
                                    <input
                                      type="text"
                                      name="areaSlug"
                                      className="form-control"
                                      placeholder="Enter SEO-friendly URL"
                                      value={formData.areaSlug}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                          </div>
<div className="col-sm-6">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Area H1 Title (Breadcrumb Title)
                                    </label>
                                    <input
                                      type="text"
                                      name="areaH1Title"
                                      className="form-control"
                                      placeholder="Enter area H1 title for breadcrumb"
                                      value={formData.areaH1Title}
                                      onChange={handleInputChange}
                                    />
                                    {/* <p className="paragraph mt10" style={{ color: "#6c757d", fontSize: "14px" }}>
                                      This title will be displayed in the breadcrumb section of the property list page instead of "Properties"
                                    </p> */}
                                  </div>
                                </div>

                                <div className="col-sm-6">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Description
                                    </label>
                                    <textarea
                                      name="description"
                                      cols={30}
                                      rows={5}
                                      className="form-control"
                                      placeholder="Enter category description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                </div>
                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="form-label">Select City</label>
                              <div className="location-area">
                                {showSelect && (
                                  <Select
                                    styles={customStyles}
                                    className="select-custom pl-0"
                                    classNamePrefix="select"
                                    required
                                    options={cityOptions}
                                    value={formData.selectedCity}
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedCity: selected,
                                      }))
                                    }
                                    placeholder={
                                      loadingCities
                                        ? "Loading cities..."
                                        : "-- Select City --"
                                    }
                                    isLoading={loadingCities}
                                    isDisabled={loadingCities || fetchingArea}
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
                          </div>

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="form-label">Status</label>
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
                                    className="status-select"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    required
                                styles={customStyles}
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
                          </div>

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="form-label">Trending</label>
                              <div className="location-area">
                                {showSelect && (
                                  <Select
                                    options={trendingOptions}
                                    value={trendingOptions.find(
                                      (opt) => opt.value === formData.isTrending
                                    )}
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        isTrending: selected?.value || "deactive",
                                      }))
                                    }
                                    className="status-select"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    required
                                    styles={customStyles}
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
                          </div>
                        </div>

                        <div className="row mt30">
                          <div className="col-12">
                            <div className="form-action-buttons">
                              <button
                                type="button"
                                className="ud-btn btn-white btn-min"
                                onClick={handleBack}
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="ud-btn btn-thm btn-min"
                                disabled={loading || fetchingArea}
                              >
                                {loading
                                  ? "Submitting..."
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


export default AddArea;

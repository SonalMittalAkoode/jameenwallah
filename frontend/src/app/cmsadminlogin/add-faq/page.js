"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { createFAQ, getFAQById, updateFAQ } from "@/api/faq";
import { getAllProperties } from "@/api/property";


const customStyles = {
  option: (styles, { isFocused, isSelected, isHovered }) => {
    return {
      ...styles,
      backgroundColor: isSelected
        ? "#FC9401"
        : isHovered
        ? "#eb675312"
        : isFocused
        ? "#eb675312"
        : undefined,
    };
  },
};

const AddFAQ = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingFAQ, setFetchingFAQ] = useState(isEditMode);
  const [fetchingProperties, setFetchingProperties] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [formData, setFormData] = useState({
    faqTitle: "",
    selectedProperty: "",
    description: "",
    status: "active",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    if (!isEditMode && !editId) {
      setFormData({
        faqTitle: "",
        selectedProperty: "",
        description: "",
        status: "active",
      });
      setFetchingFAQ(false);
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    setShowSelect(true);
    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchFAQData = async () => {
      if (!isEditMode || !editId) {
        setFetchingFAQ(false);
        return;
      }

      try {
        setFetchingFAQ(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getFAQById(editId, token);
        if (response.status === "success" && response.data) {
          const faq = response.data;
          setFormData({
            faqTitle: faq.title || "",
            selectedProperty: faq.propertyId?._id || faq.propertyId || "",
            description: faq.description || "",
            status: faq.status || "active",
          });
        } else {
          alert("Failed to load FAQ data");
          router.push("/cmsadminlogin/faq-list");
        }
      } catch (error) {
        console.error("Error fetching FAQ:", error);
        alert(error.response?.data?.message || "Failed to load FAQ data");
        router.push("/cmsadminlogin/faq-list");
      } finally {
        setFetchingFAQ(false);
      }
    };

    fetchFAQData();
  }, [isEditMode, editId, router]);

  const fetchProperties = async () => {
    try {
      setFetchingProperties(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setFetchingProperties(false);
        console.error("No authentication token found");
        return;
      }

      const response = await getAllProperties(token, { limit: 1000 });
      if (response.status === "success" && response.data) {
        setProperties(response.data);
        const options = response.data.map((property) => {
          const title = property.description?.title || "";
          const city = property.location?.city?.name || "";
          const state = property.location?.state?.name || "";
          const propertyType = property.description?.propertyType?.name || "";

          let label = title;
          if (city || state) {
            label += title ? ` - ${city || state}` : city || state;
          }
          if (propertyType && !label.includes(propertyType)) {
            label += label ? ` (${propertyType})` : propertyType;
          }

          if (!label) {
            label = `Property ${property._id}`;
          }

          return {
            value: property._id,
            label: label,
          };
        });
        setPropertyOptions(options);
        console.log("Properties loaded:", options.length);
      } else {
        console.error("Unexpected response format:", response);
        setPropertyOptions([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to load properties. Please refresh the page.");
      setPropertyOptions([]);
    } finally {
      setFetchingProperties(false);
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

    if (!formData.faqTitle.trim()) {
      alert("Please fill in the FAQ title");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please fill in the FAQ description");
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

      const faqData = {
        title: formData.faqTitle.trim(),
        description: formData.description.trim(),
        status: formData.status || "active",
      };

      // Include propertyId if a property is selected
      if (formData.selectedProperty) {
        faqData.propertyId = formData.selectedProperty;
      } else if (isEditMode) {
        // When updating, explicitly set to null to remove property association if cleared
        faqData.propertyId = null;
      }
      // When creating without property, just omit propertyId (will be undefined/null in DB)

      let response;
      if (isEditMode && editId) {
        response = await updateFAQ(editId, faqData, token);
        if (response.status === "success") {
          alert("FAQ updated successfully!");
          router.push("/cmsadminlogin/faq-list");
        } else {
          alert(response.message || "Failed to update FAQ");
        }
      } else {
        response = await createFAQ(faqData, token);
        if (response.status === "success") {
          alert("FAQ created successfully!");
          setFormData({
            faqTitle: "",
            selectedProperty: "",
            description: "",
            status: "active",
          });
          router.push("/cmsadminlogin/faq-list");
        } else {
          alert(response.message || "Failed to create FAQ");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} FAQ:`,
        error
      );
      alert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} FAQ`
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
                    <h2>{isEditMode ? "Edit FAQ" : "Add a New FAQ"}</h2>
                    <p
                      className="text"
                      style={{
                        fontSize: "16px",
                        color: "#6c757d",
                        marginTop: "8px",
                      }}
                    >
                      {isEditMode
                        ? "Update the FAQ information below."
                        : "Create a frequently asked question and answer to help users better understand your services or processes."}
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
                      {isEditMode ? "Edit Listing" : "Create Listing"}
                    </h4>
                    {fetchingFAQ ? (
                      <div className="text-center py-4">
                        <p>Loading FAQ data...</p>
                      </div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                FAQ Title
                              </label>
                              <input
                                type="text"
                                name="faqTitle"
                                className="form-control"
                                placeholder="Enter FAQ title"
                                value={formData.faqTitle}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* End .col-sm-6 */}

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Select Property <span className="text-muted" style={{ fontSize: "14px", fontWeight: "400" }}>(Optional)</span>
                              </label>
                              <div className="location-area">
                                {showSelect && !fetchingProperties && (
                                  <Select
                                    styles={customStyles}
                                    className="select-custom pl-0"
                                    classNamePrefix="select"
                                    isClearable
                                    options={propertyOptions}
                                    value={
                                      formData.selectedProperty
                                        ? propertyOptions.find(
                                            (opt) =>
                                              opt.value ===
                                              formData.selectedProperty
                                          )
                                        : null
                                    }
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedProperty: selected?.value || "",
                                      }))
                                    }
                                    placeholder={
                                      propertyOptions.length > 0
                                        ? "-- Select Property (Optional) --"
                                        : "No properties available"
                                    }
                                    isDisabled={propertyOptions.length === 0}
                                  />
                                )}
                                {fetchingProperties && (
                                  <div
                                    className="text-muted"
                                    style={{ padding: "8px 0" }}
                                  >
                                    Loading properties...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* End .col-sm-6 */}

                          <div className="col-sm-4">
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

                          <div className="col-sm-12">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Description
                              </label>
                              <textarea
                                name="description"
                                cols={30}
                                rows={5}
                                className="form-control"
                                placeholder="Enter FAQ description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* End .col-12 */}
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
                                disabled={loading}
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

export default AddFAQ;

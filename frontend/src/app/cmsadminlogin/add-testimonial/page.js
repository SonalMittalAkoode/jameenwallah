"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import {
  createTestimonial,
  getTestimonialById,
  updateTestimonial,
} from "@/api/testimonial";


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

const AddTestimonial = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTestimonial, setFetchingTestimonial] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    name: "",
    rating: 5,
    status: "active",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const ratingOptions = [
    { value: 1, label: "1 Star" },
    { value: 2, label: "2 Stars" },
    { value: 3, label: "3 Stars" },
    { value: 4, label: "4 Stars" },
    { value: 5, label: "5 Stars" },
  ];

  useEffect(() => {
    if (!isEditMode && !editId) {
      setFormData({
        title: "",
        description: "",
        name: "",
        rating: 5,
        status: "active",
      });
      setFetchingTestimonial(false);
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    setShowSelect(true);
  }, []);

  useEffect(() => {
    const fetchTestimonialData = async () => {
      if (!isEditMode || !editId) {
        setFetchingTestimonial(false);
        return;
      }

      try {
        setFetchingTestimonial(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getTestimonialById(editId, token);
        if (response.status === "success" && response.data) {
          const testimonial = response.data;
          setFormData({
            title: testimonial.title || "",
            description: testimonial.description || "",
            name: testimonial.name || "",
            rating: testimonial.rating || 5,
            status: testimonial.status || "active",
          });
        } else {
          alert("Failed to load testimonial data");
          router.push("/cmsadminlogin/testimonial-list");
        }
      } catch (error) {
        console.error("Error fetching testimonial:", error);
        alert(error.response?.data?.message || "Failed to load testimonial data");
        router.push("/cmsadminlogin/testimonial-list");
      } finally {
        setFetchingTestimonial(false);
      }
    };

    fetchTestimonialData();
  }, [isEditMode, editId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please fill in the testimonial title");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please fill in the name");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please fill in the description");
      return;
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      alert("Please select a valid rating (1-5 stars)");
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

      const testimonialData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        name: formData.name.trim(),
        rating: parseInt(formData.rating),
        status: formData.status || "active",
      };

      let response;
      if (isEditMode && editId) {
        response = await updateTestimonial(editId, testimonialData, token);
        if (response.status === "success") {
          alert("Testimonial updated successfully!");
          router.push("/cmsadminlogin/testimonial-list");
        } else {
          alert(response.message || "Failed to update testimonial");
        }
      } else {
        response = await createTestimonial(testimonialData, token);
        if (response.status === "success") {
          alert("Testimonial created successfully!");
          setFormData({
            title: "",
            description: "",
            name: "",
            rating: 5,
            status: "active",
          });
          router.push("/cmsadminlogin/testimonial-list");
        } else {
          alert(response.message || "Failed to create testimonial");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} testimonial:`,
        error
      );
      alert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} testimonial`
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
                      {isEditMode ? "Edit Testimonial" : "Add a New Testimonial"}
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
                        ? "Update the testimonial information below."
                        : "Create a testimonial to showcase customer feedback and reviews."}
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
                    {fetchingTestimonial ? (
                      <div className="text-center py-4">
                        <p>Loading testimonial data...</p>
                      </div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Title
                              </label>
                              <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Enter testimonial title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* End .col-sm-6 */}

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter buyer name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          {/* End .col-sm-6 */}

                          <div className="col-sm-4">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                Rating
                              </label>
                              <div className="location-area">
                                {showSelect && (
                                  <Select
                                    options={ratingOptions}
                                    value={ratingOptions.find(
                                      (opt) => opt.value === formData.rating
                                    )}
                                    onChange={(selected) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        rating: selected?.value || 5,
                                      }))
                                    }
                                    styles={customStyles}
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
                                    styles={customStyles}
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
                                placeholder="Enter testimonial description"
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

export default AddTestimonial;


"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { createBlogCategory, getBlogCategoryById, updateBlogCategory } from "@/api/blogCategory";


const AddBlogCategory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCategory, setFetchingCategory] = useState(isEditMode);
  const [formData, setFormData] = useState({
    categoryTitle: "",
    status: "active",
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  useEffect(() => {
    setShowSelect(true);
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isEditMode || !editId) {
        setFormData({
          categoryTitle: "",
          status: "active",
        });
        setFetchingCategory(false);
        return;
      }

      try {
        setFetchingCategory(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getBlogCategoryById(editId, token);
        if (response.status === "success" && response.data) {
          const category = response.data;
          setFormData({
            categoryTitle: category.title || "",
            status: category.status || "active",
          });
        } else {
          alert("Failed to load blog category data");
          router.push("/cmsadminlogin/blog-category-list");
        }
      } catch (error) {
        console.error("Error fetching blog category:", error);
        let errorMessage = "Failed to load blog category data";
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }
        alert(errorMessage);
        router.push("/cmsadminlogin/blog-category-list");
      } finally {
        setFetchingCategory(false);
      }
    };

    fetchCategoryData();
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

    if (!formData.categoryTitle.trim()) {
      alert("Please fill in the blog category title");
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

      const categoryData = {
        title: formData.categoryTitle.trim(),
        status: formData.status,
      };

      let response;
      if (isEditMode && editId) {
        response = await updateBlogCategory(editId, categoryData, token);
        if (response.status === "success") {
          alert("Blog category updated successfully!");
          router.push("/cmsadminlogin/blog-category-list");
        } else {
          alert(response.message || "Failed to update blog category");
        }
      } else {
        response = await createBlogCategory(categoryData, token);
        if (response.status === "success") {
          alert("Blog category created successfully!");
          setFormData({
            categoryTitle: "",
            status: "active",
          });
          router.push("/cmsadminlogin/blog-category-list");
        } else {
          alert(response.message || "Failed to create blog category");
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} blog category:`, error);
      alert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} blog category`
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
                    <h2>{isEditMode ? "Edit Blog Category" : "Add New Blog category"}</h2>
                    <p className="text" style={{ fontSize: '16px', color: '#6c757d', marginTop: '8px' }}>
                      {isEditMode
                        ? "Update the blog category information below."
                        : "Create a category to organize your blog posts and improve content navigation."}
                    </p>
                  </div>
                </div>
              </div>
              {/* End .row */}

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30" style={{ fontWeight: '600', color: '#111827' }}>
                      {isEditMode ? "Edit Listing" : "Create Listing"}
                    </h4>
                    {fetchingCategory ? (
                      <div className="text-center py-4">
                        <p>Loading blog category data...</p>
                      </div>
                    ) : (
                    <form className="form-style1" onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="mb30">
                            <label className="heading-color ff-heading fw600 mb10">
                              Blog Category Title
                            </label>
                            <input
                              type="text"
                              name="categoryTitle"
                              className="form-control"
                              placeholder="Enter blog category title"
                              value={formData.categoryTitle}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        {/* End .col-sm-6 */}

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

export default AddBlogCategory;


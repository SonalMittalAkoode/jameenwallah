"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import {
  createCategory,
  getCategoryById,
  updateCategory,
} from "@/api/category";



const AddCategory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [showSelect, setShowSelect] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const [formData, setFormData] = useState({
    categoryTitle: "",
    categorySlug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    categoryH1Title: "",
    status: "active",
    listingPageCard: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    setShowSelect(true);
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditMode) {
        setFormData({
          categoryTitle: "",
          categorySlug: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
          categoryH1Title: "",
          status: "active",
          listingPageCard: {
            title: "",
            description: "",
          },
        });
        setFetching(false);
        return;
      }

      if (!editId) {
        setFormData({
          categoryTitle: "",
          categorySlug: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
          categoryH1Title: "",
          status: "active",
          listingPageCard: {
            title: "",
            description: "",
          },
        });
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getCategoryById(editId, token);
        if (response.status === "success" && response.data) {
          const category = response.data;
          setFormData({
            categoryTitle: category.name || "",
            categorySlug: category.slug || "",
            description: category.description || "",
            metaTitle: category.metaTitle || "",
            metaDescription: category.metaDescription || "",
            categoryH1Title: category.categoryH1Title || "",
            status: category.status || "active",
            listingPageCard: category.listingPageCard || { title: "", description: "" },
          });
        } else {
          alert("Failed to load category data");
          router.push("/cmsadminlogin/category-list");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        alert(error.response?.data?.message || "Failed to load category data");
        router.push("/cmsadminlogin/category-list");
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [editId, isEditMode, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "categoryTitle") {
        return {
          ...prev,
          categoryTitle: value,
          categorySlug: value
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
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(files[0]);
    }
  };

  const handleImageDelete = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: formData.categoryTitle,
        slug: formData.categorySlug,
        description: formData.description,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        categoryH1Title: formData.categoryH1Title,
        status: formData.status || "active",
        listingPageCard: formData.listingPageCard || { title: "", description: "" },
      };

      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        router.push("/cmsadminlogin");
        return;
      }

      let res;
      if (isEditMode) {
        res = await updateCategory(editId, payload, token);
        if (res.status === "success") {
          alert("Category updated successfully!");
          router.push("/cmsadminlogin/category-list");
        } else {
          alert(res.message || "Something went wrong!");
        }
      } else {
        res = await createCategory(payload, token);
        if (res.status === "success") {
          alert("Category created successfully!");
          router.push("/cmsadminlogin/category-list");
        } else {
          alert(res.message || "Something went wrong!");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} category:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${
          isEditMode ? "update" : "create"
        } category. Please try again.`;
      alert(errorMessage);
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
                    <h2>
                      {isEditMode ? "Edit Category" : "Add a New Category"}
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
                        ? "Update category profile information."
                        : "Create a category profile to associate with real estate projects and listings."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <div className="mb40">
                      <h4
                        className="title fz17 mb30"
                        style={{ fontWeight: "600", color: "#111827" }}
                      >
                        {isEditMode ? "Edit Category" : "Create Category"}
                      </h4>
                      {fetching ? (
                        <div className="text-center py-4">
                          <p>Loading category data...</p>
                        </div>
                      ) : (
                        <form className="form-style1" onSubmit={handleSubmit}>
                          <div className="row">
                            <div className="col-sm-12 col-xl-12">
                              <div className="row">
                                <div className="col-sm-6">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Category Title
                                    </label>
                                    <input
                                      type="text"
                                      name="categoryTitle"
                                      className="form-control"
                                      placeholder="Enter category title"
                                      value={formData.categoryTitle}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="col-sm-6">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Category Slug (SEO URL)
                                    </label>
                                    <input
                                      type="text"
                                      name="categorySlug"
                                      className="form-control"
                                      placeholder="Enter SEO-friendly URL"
                                      value={formData.categorySlug}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                </div>

                                <div className="col-sm-12">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Category H1 Title (Breadcrumb Title)
                                    </label>
                                    <input
                                      type="text"
                                      name="categoryH1Title"
                                      className="form-control"
                                      placeholder="Enter category H1 title for breadcrumb"
                                      value={formData.categoryH1Title}
                                      onChange={handleInputChange}
                                    />
                                    {/* <p className="paragraph mt10" style={{ color: "#6c757d", fontSize: "14px" }}>
                                      This title will be displayed in the breadcrumb section of the property list page instead of "Properties"
                                    </p> */}
                                  </div>
                                </div>

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
                                      placeholder="Enter category description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="col-sm-6 col-xl-3">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Status
                                    </label>
                                    <div className="location-area">
                                      {showSelect && (
                                        <Select
                                          options={statusOptions}
                                          value={statusOptions.find(
                                            (opt) =>
                                              opt.value === formData.status
                                          )}
                                          onChange={(selected) =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              status:
                                                selected?.value || "active",
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
                                              color: isSelected
                                                ? "#fff"
                                                : "#111827",
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
                              </div>
                            </div>
                          </div>

                          <div
                            className="mb40 mt40"
                            style={{
                              borderTop: "1px solid #e5e7eb",
                              paddingTop: "30px",
                            }}
                          >
                            <h4
                              className="title fz17 mb30"
                              style={{ fontWeight: "600", color: "#111827" }}
                            >
                              Meta Information
                            </h4>
                            <div className="row">
                              <div className="col-sm-12">
                                <div className="mb30">
                                  <label className="heading-color ff-heading fw600 mb10">
                                    Meta Title
                                  </label>
                                  <input
                                    type="text"
                                    name="metaTitle"
                                    className="form-control"
                                    placeholder="Enter meta title"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="col-sm-12">
                                <div className="mb30">
                                  <label className="heading-color ff-heading fw600 mb10">
                                    Meta Description
                                  </label>
                                  <textarea
                                    name="metaDescription"
                                    cols={30}
                                    rows={5}
                                    className="form-control"
                                    placeholder="Enter meta description"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className="mb40 mt40"
                            style={{
                              borderTop: "1px solid #e5e7eb",
                              paddingTop: "30px",
                            }}
                          >
                            <h4
                              className="title fz17 mb30"
                              style={{ fontWeight: "600", color: "#111827" }}
                            >
                              Listing Page Card
                            </h4>
                            <p className="paragraph mb20" style={{ color: "#6c757d", fontSize: "14px" }}>
                              Add a card that will be displayed on the property listing page for this category. The card should have a title and description. Line breaks and spacing you add will be preserved in the display.
                            </p>
                            <div className="row">
                              <div className="col-12">
                                <div className="mb30 p20"
                                  style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9fafb",
                                  }}
                                >
                                  <div className="mb20">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Card Title
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Enter card title"
                                      value={formData.listingPageCard?.title || ""}
                                      onChange={(e) => {
                                        setFormData({
                                          ...formData,
                                          listingPageCard: {
                                            ...formData.listingPageCard,
                                            title: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Card Description
                                    </label>
                                    <textarea
                                      className="form-control"
                                      rows={4}
                                      placeholder="Enter card description"
                                      value={formData.listingPageCard?.description || ""}
                                      onChange={(e) => {
                                        setFormData({
                                          ...formData,
                                          listingPageCard: {
                                            ...formData.listingPageCard,
                                            description: e.target.value,
                                          },
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

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
                                  disabled={loading}
                                >
                                  {loading
                                    ? "Processing..."
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
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCategory;

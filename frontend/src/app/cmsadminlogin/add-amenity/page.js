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
  createAmenity,
  getAmenityById,
  updateAmenity,
} from "@/api/amenity";

const AddAmenity = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [showSelect, setShowSelect] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const [formData, setFormData] = useState({
    amenityTitle: "",
    status: "active",
  });

  useEffect(() => {
    setShowSelect(true);
  }, []);

  useEffect(() => {
    const fetchAmenity = async () => {
      if (!isEditMode) {
        setFormData({
          amenityTitle: "",
          status: "active",
        });
        setFetching(false);
        return;
      }

      if (!editId) {
        setFormData({
          amenityTitle: "",
          status: "active",
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

        const response = await getAmenityById(editId, token);
        if (response.status === "success" && response.data) {
          const amenity = response.data;
          setFormData({
            amenityTitle: amenity.title || "",
            status: amenity.status || "active",
          });
        } else {
          alert("Failed to load amenity data");
          router.push("/cmsadminlogin/amenity-list");
        }
      } catch (error) {
        console.error("Error fetching amenity:", error);
        alert(error.response?.data?.message || "Failed to load amenity data");
        router.push("/cmsadminlogin/amenity-list");
      } finally {
        setFetching(false);
      }
    };

    fetchAmenity();
  }, [editId, isEditMode, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: formData.amenityTitle,
        status: formData.status || "active",
      };

      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        router.push("/cmsadminlogin");
        return;
      }

      let res;
      if (isEditMode) {
        res = await updateAmenity(editId, payload, token);
        if (res.status === "success") {
          alert("Amenity updated successfully!");
          router.push("/cmsadminlogin/amenity-list");
        } else {
          alert(res.message || "Something went wrong!");
        }
      } else {
        res = await createAmenity(payload, token);
        if (res.status === "success") {
          alert("Amenity created successfully!");
          router.push("/cmsadminlogin/amenity-list");
        } else {
          alert(res.message || "Something went wrong!");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} amenity:`,
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${
          isEditMode ? "update" : "create"
        } amenity. Please try again.`;
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
                      {isEditMode ? "Edit Amenity" : "Add a New Amenity"}
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
                        ? "Update amenity profile information."
                        : "Create an amenity profile to associate with real estate projects and listings."}
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
                        {isEditMode ? "Edit Amenity" : "Create Amenity"}
                      </h4>
                      {fetching ? (
                        <div className="text-center py-4">
                          <p>Loading amenity data...</p>
                        </div>
                      ) : (
                        <form className="form-style1" onSubmit={handleSubmit}>
                          <div className="row">
                            <div className="col-sm-6 col-xl-9">
                              <div className="row">
                                <div className="col-sm-6">
                                  <div className="mb30">
                                    <label className="heading-color ff-heading fw600 mb10">
                                      Amenity Title
                                    </label>
                                    <input
                                      type="text"
                                      name="amenityTitle"
                                      className="form-control"
                                      placeholder="Enter amenity title"
                                      value={formData.amenityTitle}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="col-sm-6 col-xl-6">
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

export default AddAmenity;


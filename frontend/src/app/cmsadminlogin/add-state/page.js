"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { createState, getStateById, updateState } from "@/api/state";



const AddState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const [showSelect, setShowSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingState, setFetchingState] = useState(isEditMode);
  const [formData, setFormData] = useState({
    stateTitle: "",
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
    const fetchStateData = async () => {
      if (!isEditMode || !editId) {
        setFormData({ stateTitle: "", status: "active" });
        setFetchingState(false);
        return;
      }

      try {
        setFetchingState(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getStateById(editId, token);
        if (response.status === "success" && response.data) {
          const state = response.data;
          setFormData({
            stateTitle: state.name || "",
            status: state.status || "active",
          });
        } else {
          alert("Failed to load state data");
          router.push("/cmsadminlogin/state-list");
        }
      } catch (error) {
        console.error("Error fetching state:", error);
        alert(error?.message || "Failed to load state data");
        router.push("/cmsadminlogin/state-list");
      } finally {
        setFetchingState(false);
      }
    };

    fetchStateData();
  }, [isEditMode, editId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.stateTitle.trim()) {
      alert("Please fill in the state title");
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

      const stateData = {
        name: formData.stateTitle.trim(),
        status: formData.status,
      };

      let response;
      if (isEditMode && editId) {
        response = await updateState(editId, stateData, token);
        if (response.status === "success") {
          alert("State updated successfully!");
          router.push("/cmsadminlogin/state-list");
        } else {
          alert(response.message || "Failed to update state");
        }
      } else {
        response = await createState(stateData, token);
        if (response.status === "success") {
          alert("State created successfully!");
          setFormData({ stateTitle: "", status: "active" });
          router.push("/cmsadminlogin/state-list");
        } else {
          alert(response.message || "Failed to create state");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} state:`,
        error
      );
      alert(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} state`
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
                    <h2>{isEditMode ? "Edit State" : "Add a New State"}</h2>
                    <p className="dashboard-subtext">
                      {isEditMode
                        ? "Update the state information below."
                        : "Use this form to add a new state or region."}
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

                    {fetchingState ? (
                      <div className="text-center py-4">
                        <p>Loading state data...</p>
                      </div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-sm-6">
                            <div className="mb30">
                              <label className="heading-color ff-heading fw600 mb10">
                                State Title
                              </label>
                              <input
                                type="text"
                                name="stateTitle"
                                className="form-control"
                                placeholder="Enter state title"
                                value={formData.stateTitle}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

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
                                    }}
                                    className="custom-select"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    required
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="row mt30">
                          <div className="col-12">
                            <div className="d-flex gap-3">
                              <button
                                type="button"
                                className="ud-btn btn-white btn-back"
                                onClick={handleBack}
                                disabled={loading}
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="ud-btn btn-thm btn-submit"
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

export default AddState;

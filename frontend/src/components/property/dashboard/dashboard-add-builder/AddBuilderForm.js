"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  createBuilder,
  getBuilderById,
  updateBuilder,
} from "@/api/builder";

const generateSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const AddBuilderForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = !!editId;

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    builderTitle: "",
    builderSlug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    reraRegistration: "",
    experience: "",
    projectsCompleted: "",
    ongoingProjects: "",
    certifications: "",
    partnerships: "",
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingBuilder, setFetchingBuilder] = useState(isEditMode);

  useEffect(() => {
    const fetchBuilder = async () => {
      if (!isEditMode || !editId) {
        setFetchingBuilder(false);
        return;
      }

      try {
        setFetchingBuilder(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Authentication required. Please login again.");
          router.push("/cmsadminlogin");
          return;
        }

        const response = await getBuilderById(editId, token);
        if (response.status === "success" && response.data) {
          const builder = response.data;
          setFormData({
            builderTitle: builder.title || "",
            builderSlug: builder.slug || "",
            description: builder.description || "",
            metaTitle: builder.metaTitle || "",
            metaDescription: builder.metaDescription || "",
            reraRegistration: builder.reraRegistration || "",
            experience: builder.experience || "",
            projectsCompleted: builder.projectsCompleted || "",
            ongoingProjects: builder.ongoingProjects || "",
            certifications: builder.certifications ? builder.certifications.join(", ") : "",
            partnerships: builder.partnerships ? builder.partnerships.join(", ") : "",
          });

          const autoSlug = generateSlug(builder.title || "");
          setSlugManuallyEdited(
            builder.slug && builder.slug !== autoSlug && builder.slug !== ""
          );

          if (builder.image) {
            const imageUrl = builder.image.startsWith("http")
              ? builder.image
              : `${
                  process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:5000"
                }${builder.image}`;
            setUploadedImage(imageUrl);
          } else {
            setUploadedImage(null);
          }
        } else {
          alert("Failed to load builder data");
          router.push("/cmsadminlogin/builder-list");
        }
      } catch (error) {
        console.error("Error fetching builder:", error);
        alert(error.response?.data?.message || "Failed to load builder data");
        router.push("/cmsadminlogin/builder-list");
      } finally {
        setFetchingBuilder(false);
      }
    };

    fetchBuilder();
  }, [isEditMode, editId, router]);

  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        builderTitle: "",
        builderSlug: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        reraRegistration: "",
        experience: "",
        projectsCompleted: "",
        ongoingProjects: "",
        certifications: "",
        partnerships: "",
      });
      setSlugManuallyEdited(false);
      setUploadedImage(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "builderTitle") {
        return {
          ...prev,
          builderTitle: value,
          builderSlug: slugManuallyEdited
            ? prev.builderSlug
            : generateSlug(value),
        };
      }

      if (name === "builderSlug") {
        setSlugManuallyEdited(true);
      }

      return {
        ...prev,
        [name]: value,
      };
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

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.builderTitle.trim()) {
      alert("Please provide a builder title.");
      return;
    }

    if (!formData.builderSlug.trim()) {
      alert("Please provide a builder slug.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please add a description for the builder.");
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

      const payload = {
        title: formData.builderTitle.trim(),
        slug: formData.builderSlug.trim(),
        description: formData.description.trim(),
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        reraRegistration: formData.reraRegistration.trim(),
        experience: formData.experience.trim(),
        projectsCompleted: formData.projectsCompleted.trim(),
        ongoingProjects: formData.ongoingProjects.trim(),
        certifications: formData.certifications.trim() ? formData.certifications.split(",").map(cert => cert.trim()).filter(cert => cert.length > 0) : [],
        partnerships: formData.partnerships.trim() ? formData.partnerships.split(",").map(part => part.trim()).filter(part => part.length > 0) : [],
      };

      if (imageFile) {
        payload.image = imageFile;
      }

      let response;

      if (isEditMode && editId) {
        response = await updateBuilder(editId, payload, token);
        if (response.status === "success") {
          alert("Builder updated successfully!");
          router.push("/cmsadminlogin/builder-list");
        } else {
          alert(response.message || "Failed to update builder.");
        }
      } else {
        response = await createBuilder(payload, token);
        if (response.status === "success") {
          alert("Builder created successfully!");
          router.push("/cmsadminlogin/builder-list");
        } else {
          alert(response.message || "Failed to create builder.");
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} builder:`,
        error
      );
      alert(
        error?.message ||
          error?.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} builder.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBuilder) {
    return (
      <div className="text-center py-4">
        <p>Loading builder details...</p>
      </div>
    );
  }

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Upload Logo/Image
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
                      alt="Builder image"
                      fill
                      style={{ objectFit: "cover", borderRadius: "8px" }}
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
                  <label className="ud-btn btn-white" style={{ cursor: "pointer" }}>
                    Change Photo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageUpload(e.target.files)}
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
                  <label className="ud-btn btn-white" style={{ cursor: "pointer" }}>
                    <span className="flaticon-upload me-2" />
                    Upload Photo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </label>
                  <p
                    className="text mt10"
                    style={{ fontSize: "12px", color: "#6b7280" }}
                  >
                    Recommended size 260px x 260px
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Builder Title
            </label>
            <input
              type="text"
              name="builderTitle"
              className="form-control"
              placeholder="Enter builder title"
              value={formData.builderTitle}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Builder Slug (SEO URL)
            </label>
            <input
              type="text"
              name="builderSlug"
              className="form-control"
              placeholder="Auto-generated from title"
              value={formData.builderSlug}
              onChange={handleInputChange}
            />
            <p
              className="text mt10"
              style={{ fontSize: "12px", color: "#6b7280" }}
            >
              Slug is generated from the title. You can adjust it manually for SEO.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
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
              placeholder="Enter builder description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="mb40">
        <h4
          className="title fz17 mb30"
          style={{ fontWeight: "600", color: "#111827" }}
        >
          Additional Information
        </h4>
        <div className="row">
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                RERA Registration
              </label>
              <input
                type="text"
                name="reraRegistration"
                className="form-control"
                placeholder="Enter RERA registration number"
                value={formData.reraRegistration}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                Experience
              </label>
              <input
                type="text"
                name="experience"
                className="form-control"
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                Projects Completed
              </label>
              <input
                type="text"
                name="projectsCompleted"
                className="form-control"
                placeholder="Enter number of completed projects"
                value={formData.projectsCompleted}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                Ongoing Projects
              </label>
              <input
                type="text"
                name="ongoingProjects"
                className="form-control"
                placeholder="Enter number of ongoing projects"
                value={formData.ongoingProjects}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                Certifications
              </label>
              <input
                type="text"
                name="certifications"
                className="form-control"
                placeholder="Enter certifications (comma-separated)"
                value={formData.certifications}
                onChange={handleInputChange}
              />
              <p
                className="text mt10"
                style={{ fontSize: "12px", color: "#6b7280" }}
              >
                Separate multiple certifications with commas
              </p>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                Partnerships
              </label>
              <input
                type="text"
                name="partnerships"
                className="form-control"
                placeholder="Enter partnerships (comma-separated)"
                value={formData.partnerships}
                onChange={handleInputChange}
              />
              <p
                className="text mt10"
                style={{ fontSize: "12px", color: "#6b7280" }}
              >
                Separate multiple partnerships with commas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb40">
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
                placeholder="Enter meta title for SEO"
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
                rows={4}
                className="form-control"
                placeholder="Enter meta description for SEO"
                value={formData.metaDescription}
                onChange={handleInputChange}
              />
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
  );
};

export default AddBuilderForm;


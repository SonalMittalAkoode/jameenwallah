"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import Image from "next/image";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};

const FloorPlanCard = ({
  plan,
  index,
  onChange,
  onRemove,
  onAdd,
  onPreviewClick,
}) => {
  const [preview, setPreview] = useState(() =>
    typeof plan.image === "string"
      ? resolveMediaUrl(plan.image)
      : plan.image instanceof File
      ? URL.createObjectURL(plan.image)
      : null
  );

  useEffect(() => {
    if (plan.image instanceof File) {
      const url = URL.createObjectURL(plan.image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(
      typeof plan.image === "string" ? resolveMediaUrl(plan.image) : null
    );
    return undefined;
  }, [plan.image]);

  const fieldConfig = [
    {
      field: "unitType",
      label: `Unit Type ${index + 1}`,
      placeholder: `Floor Unit Type ${index + 1}`,
    },
    {
      field: "carpetArea",
      label: `Carpet Area ${index + 1}`,
      placeholder: "Enter carpet area in sq.ft.",
    },
    {
      field: "builtUpArea",
      label: `Built Up Area ${index + 1}`,
      placeholder: "Enter built up area in sq.ft.",
    },
    {
      field: "superBuiltUpArea",
      label: `Super Built Up Area ${index + 1}`,
      placeholder: "Enter super built up area in sq.ft.",
    },
    {
      field: "price",
      label: `Floor plan price ${index + 1}`,
      placeholder: "e.g. ₹ 25 Lakh",
    },
  ];

  return (
    <div className="floor-plan-card">
      <div className="floor-plan-card__grid">
        <div className="floor-plan-card__fields">
          {fieldConfig.map((config) => (
            <div className="floor-plan-card__field" key={config.field}>
              <label className="floor-plan-card__label">{config.label}</label>
              <input
                type="text"
                className="form-control"
                placeholder={config.placeholder}
                value={plan[config.field] || ""}
                onChange={(e) => onChange(index, config.field, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="floor-plan-card__media">
          <label className="floor-plan-card__label">
            Floor plan image {index + 1}
          </label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) =>
              onChange(index, "image", e.target.files?.[0] || null)
            }
          />
          {preview && (
            <Image
              src={preview}
              alt={`Floor plan ${index + 1}`}
              className="floor-plan-card__preview"
              width={640}
              height={420}
              unoptimized
              style={{ objectFit: "cover", cursor: "pointer" }}
              onClick={() =>
                typeof onPreviewClick === "function" && onPreviewClick(preview)
              }
            />
          )}
        </div>
      </div>
      <div className="floor-plan-card__footer">
        <div className="floor-plan-card__footer-buttons">
          <button
            type="button"
            className="ud-btn btn-thm btn-sm"
            onClick={() => typeof onAdd === "function" && onAdd(index)}
          >
            Add floor plan
          </button>
          <button
            type="button"
            className="ud-btn btn-thm btn-sm"
            onClick={() => onRemove(index)}
          >
            Remove floor plan {index + 1}
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertyDescription = ({
  data,
  onChange,
  categoryOptions,
  propertyTypeOptions,
  furnishingOptions,
  propertyStatusOptions = [],
  reraOptions,
  featuredOptions = [],
  featuredPropertyOptions,
  builderOptions = [],
  selectStyles,
  showSelect,
  enableFloorPlans = false,
  floorPlans = [],
  onFloorPlansChange,
}) => {
  const selectedCategory =
    categoryOptions.find((option) => option.value === data.category) || null;
  const selectedPropertyType =
    propertyTypeOptions.find((option) => option.value === data.propertyType) ||
    null;
  const selectedFurnishing =
    furnishingOptions.find(
      (option) => option.value === data.furnishingStatus
    ) || null;
  const selectedRera =
    reraOptions.find((option) => option.value === data.reraApproved) || null;
  const resolvedFeaturedOptions =
    featuredPropertyOptions || featuredOptions || [];
  const selectedFeaturedProperty =
    resolvedFeaturedOptions.find(
      (option) => option.value === data.featuredProperty
    ) || null;
  const selectedBuilder =
    builderOptions?.find((option) => option.value === data.builder) || null;
  const floorPlanEntries = Array.isArray(floorPlans) ? floorPlans : [];
  const safeOnFloorPlansChange =
    typeof onFloorPlansChange === "function" ? onFloorPlansChange : () => {};
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleFloorPlanFieldChange = (index, field, value) => {
    const updated = floorPlanEntries.map((plan, idx) =>
      idx === index ? { ...plan, [field]: value } : plan
    );
    safeOnFloorPlansChange(updated);
  };

  const addFloorPlan = () => {
    const blankPlan = {
      unitType: "",
      carpetArea: "",
      builtUpArea: "",
      superBuiltUpArea: "",
      price: "",
      image: null,
    };
    safeOnFloorPlansChange((previousPlans) => {
      const normalized = Array.isArray(previousPlans)
        ? previousPlans
        : floorPlanEntries;
      return [blankPlan, ...normalized];
    });
  };

  const addFloorPlanAfter = (afterIndex) => {
    const blankPlan = {
      unitType: "",
      carpetArea: "",
      builtUpArea: "",
      superBuiltUpArea: "",
      price: "",
      image: null,
    };
    const updated = [...floorPlanEntries];
    updated.splice(afterIndex + 1, 0, blankPlan);
    safeOnFloorPlansChange(updated);
  };

  const removeFloorPlan = (index) => {
    const updated = floorPlanEntries.filter((_, idx) => idx !== index);
    safeOnFloorPlansChange(updated);
  };

  return (
    <div className="form-style1" style={{ paddingBottom: "40px" }}>
      <div className="row">
        <div className="col-sm-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter property title"
              value={data.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Slug (SEO URL){" "}
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                (Auto-generated)
              </span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Auto-generated from title"
              value={data.slug || ""}
              onChange={(e) => onChange("slug", e.target.value)}
            />
            <p
              className="text mt10"
              style={{ fontSize: "12px", color: "#6b7280" }}
            >
              Slug is auto-generated from title. You can edit it manually if
              needed.
            </p>
          </div>
        </div>

        

        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Description
            </label>
            <textarea
              cols={30}
              rows={5}
              className="form-control"
              placeholder="Describe the property..."
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Select Category
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={categoryOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedCategory}
                  onChange={(option) =>
                    onChange("category", option?.value || "")
                  }
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isClearable
                  placeholder="Choose category"
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Builder
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={builderOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedBuilder}
                  onChange={(option) =>
                    onChange("builder", option?.value || "")
                  }
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isClearable
                  placeholder="Select builder"
                  noOptionsMessage={() =>
                    builderOptions?.length
                      ? "No builders match your search"
                      : "No builders available"
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Property Type
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={propertyTypeOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedPropertyType}
                  onChange={(option) =>
                    onChange("propertyType", option?.value || "")
                  }
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isClearable
                  placeholder="Choose property type"
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Price in ₹
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter price"
              value={data.price}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Payment Plan
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter payment plan"
              value={data.paymentPlan}
              onChange={(e) => onChange("paymentPlan", e.target.value)}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              RERA Approved
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={reraOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedRera}
                  onChange={(option) =>
                    onChange("reraApproved", option?.value || "")
                  }
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isClearable
                  placeholder="RERA approved?"
                />
              )}
            </div>
          </div>
        </div>

        {data.reraApproved === "Yes" && (
          <div className="col-sm-6 col-xl-4">
            <div className="mb30">
              <label className="heading-color ff-heading fw600 mb10">
                RERA Number
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter RERA number"
                value={data.reraNumber}
                onChange={(e) => onChange("reraNumber", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="col-sm-6 col-xl-4">
          <div className="mb30">
            <label className="heading-color ff-heading fw600 mb10">
              Featured Property
            </label>
            <div className="location-area">
              {showSelect && (
                <Select
                  options={resolvedFeaturedOptions}
                  styles={selectStyles}
                  className="select-custom pl-0"
                  classNamePrefix="select"
                  value={selectedFeaturedProperty}
                  onChange={(option) =>
                    onChange("featuredProperty", option?.value || "")
                  }
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isClearable
                  placeholder="Is featured property?"
                />
              )}
            </div>
          </div>
        </div>

        {enableFloorPlans && (
          <>
            <div className="col-sm-6 col-xl-4">
              <div className="mb30">
                <label className="heading-color ff-heading fw600 mb10 d-block">
                  Floor Plans
                </label>
                <div className="mt10">
                  <button
                    type="button"
                    className="ud-btn btn-thm"
                    onClick={addFloorPlan}
                  >
                    {floorPlanEntries.length
                      ? "Add more floor plans"
                      : "Add floor plan"}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-sm-12">
              {floorPlanEntries.length > 0 && (
                <>
                  {floorPlanEntries.map((plan, index) => (
                    <FloorPlanCard
                      key={`floor-plan-${index}`}
                      plan={plan}
                      index={index}
                      onChange={handleFloorPlanFieldChange}
                      onAdd={addFloorPlanAfter}
                      onRemove={removeFloorPlan}
                      onPreviewClick={(src) => setLightboxSrc(src)}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
        {lightboxSrc && (
          <div
            className="floor-plan-lightbox"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
            onClick={() => setLightboxSrc(null)}
          >
            <Image
              src={lightboxSrc}
              alt="Floor plan"
              width={1600}
              height={1200}
              unoptimized
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                width: "auto",
                height: "auto",
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        )}

        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter meta title (optional)"
              value={data.metaTitle || ""}
              onChange={(e) => onChange("metaTitle", e.target.value)}
            />
            <p
              className="text mt10"
              style={{ fontSize: "12px", color: "#6b7280" }}
            >
              Used as the page title on the property detail page (if provided).
            </p>
          </div>
        </div>

        <div className="col-sm-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Meta Description (SEO)
            </label>
            <textarea
              cols={30}
              rows={3}
              className="form-control"
              placeholder="Enter meta description (optional)"
              value={data.metaDescription || ""}
              onChange={(e) => onChange("metaDescription", e.target.value)}
            />
            <p
              className="text mt10"
              style={{ fontSize: "12px", color: "#6b7280" }}
            >
              Used as the page description on the property detail page (if provided).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDescription;

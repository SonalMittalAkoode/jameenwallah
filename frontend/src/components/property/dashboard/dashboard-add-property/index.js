"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import PropertyDescription from "./property-description";
import UploadMedia from "./upload-media";
import LocationField from "./LocationField";
import DetailsFiled from "./details-field";
import { getAllAgents } from "@/api/agent";
import { getAllCategories } from "@/api/category";
import { getAllPropertyTypes } from "@/api/propertyType";
import { getAllStates } from "@/api/state";
import { getCitiesByStateId } from "@/api/city";
import { getAreasByCityId } from "@/api/area";
import { getAllAmenities } from "@/api/amenity";
import { createPropertyByAdmin } from "@/api/property";
import { getAllBuilders } from "@/api/builder";

const selectStyles = {
  option: (styles, { isFocused, isSelected, isHovered }) => ({
    ...styles,
    backgroundColor: isSelected
      ? "#FC9401"
      : isHovered || isFocused
      ? "#eb675312"
      : undefined,
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: 9999,
    position: "relative",
  }),
  menuPortal: (styles) => ({
    ...styles,
    zIndex: 9999,
  }),
};

const furnishingStatusOptions = [
  { value: "Furnished", label: "Furnished" },
  { value: "Semi-Furnished", label: "Semi-Furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
];

const buildingStatusOptions = [
  { value: "Ready", label: "Ready" },
  { value: "Under Construction", label: "Under Construction" },
  { value: "Incomplete", label: "Incomplete" },
  { value: "Needs Renovation", label: "Needs Renovation" },
];

const propertyStatusOptions = [
  { value: "Ready to Move", label: "Ready to Move" },
  { value: "Under Construction", label: "Under Construction" },
  { value: "Completed", label: "Completed" },
  { value: "New Launch", label: "New Launch" },
  { value: "Delayed", label: "Delayed" },
];

const ownershipTypeOptions = [
  { value: "Freehold", label: "Freehold" },
  { value: "Leasehold", label: "Leasehold" },
  { value: "Co-operative", label: "Co-operative" },
  { value: "Share of Freehold", label: "Share of Freehold" },
  { value: "Government Lease", label: "Government Lease" },
  { value: "Pending", label: "Pending" },
];

const reraApprovedOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const featuredPropertyOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const basementOptions = [
  { value: "No", label: "No" },
  { value: "Single", label: "Single" },
  { value: "Double", label: "Double" },
  { value: "Triple", label: "Triple" },
  { value: "Parking", label: "Parking" },
  { value: "Service", label: "Service" },
];

const parkingOptions = [
  { value: "Open", label: "Open" },
  { value: "Covered", label: "Covered" },
  { value: "Reserved", label: "Reserved" },
  { value: "Visitor", label: "Visitor" },
  { value: "Basement", label: "Basement" },
  { value: "Street", label: "Street" },
  { value: "Truck", label: "Truck" },
  { value: "Not Available", label: "Not Available" },
];

const facingOptions = [
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north-east", label: "North-East" },
  { value: "north-west", label: "North-West" },
  { value: "south-east", label: "South-East" },
  { value: "south-west", label: "South-West" },
];

const shellStatusOptions = [
  { value: "bare shell", label: "Bare Shell" },
  { value: "warm shell", label: "Warm Shell" },
  { value: "full furnished", label: "Full Furnished" },
];

const waterSourceOptions = [
  { value: "Borewell", label: "Borewell" },
  { value: "Municipal", label: "Municipal" },
  { value: "Mixed", label: "Mixed" },
  { value: "Tanker", label: "Tanker" },
];

const electricityPhaseOptions = [
  { value: "Single Phase", label: "Single Phase" },
  { value: "Three Phase", label: "Three Phase" },
];

const boundaryStatusOptions = [
  { value: "Gated", label: "Gated" },
  { value: "Boundary Wall", label: "Boundary Wall" },
  { value: "Fenced", label: "Fenced" },
];

const washroomAvailabilityOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const pantryAvailabilityOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const boundaryWallOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const gatedCommunityOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const cornerPlotOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const legalStatusOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const constructionOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const generateCustomId = (categoryLabel = "") => {
  const initial = (categoryLabel || "").trim().charAt(0).toUpperCase() || "X";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PROP-${initial}${suffix}`;
};

const generateSlug = (title) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const createInitialFormData = () => ({
  personalDetails: {
    name: "",
    email: "",
    phoneNumber: "",
  },
  description: {
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    description: "",
    category: "",
    propertyType: "",
    builder: "",
    price: "",
    paymentPlan: "",
    reraApproved: "",
    featuredProperty: "",
    reraNumber: "",
  },
  media: {
    images: [],
    virtualTour: null,
    sitePlanImage: null,
    masterPlanImage: null,
    videoLink: "",
  },
  location: {
    address: "",
    state: "",
    city: "",
    area: "",
    zip: "",
    nearBy: "",
    mapEmbedCode: "",
  },
  details: {
    sizeInSqFt: "",
    totalAreaInSqFt: "",
    rooms: "",
    bhk: "",
    bedrooms: "",
    bathrooms: "",
    customId: generateCustomId(),
    parking: "",
    numberOfParkings: "",
    totalFloors: "",
    totalTowers: "",
    numberOfEntrances: "",
    ceilingHeight: "",
    floorLoadCapacity: "",
    completionDate: "",
    possessionDate: "",
    revisedPossessionDate: "",
    basement: "",
    balcony: "",
    plotSize: "",
    plotDimensionLength: "",
    plotDimensionWidth: "",
    facing: "",
    shellStatus: "",
    waterSource: "",
    electricityPhase: "",
    boundaryStatus: "",
    washroomAvailability: "",
    pantryAvailability: "",
    boundaryWall: "",
    gatedCommunity: "",
    cornerPlot: "",
    legalStatus: "",
    construction: "",
    furnishingStatus: "",
    ownershipType: "",
    propertyStatus: "",
    buildingStatus: "",
    availableFrom: "",
  },
  amenities: [],
  assignedAgent: [],
});

const AddPropertyTabContent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState(createInitialFormData);
  const [showSelect, setShowSelect] = useState(false);
  const [agentOptions, setAgentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [allPropertyTypes, setAllPropertyTypes] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [builderOptions, setBuilderOptions] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [optionsError, setOptionsError] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const tokenRef = useRef(null);

  useEffect(() => {
    setShowSelect(true);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    tokenRef.current = token;

    if (!token) {
      setOptionsError("Admin session expired. Please log in again.");
      setAgentError("Admin session expired. Please log in again.");
      return;
    }

    const loadBaseData = async () => {
      try {
        setLoadingOptions(true);
        setLoadingAgents(true);
        setAgentError(null);
        setOptionsError(null);

        const [
          categoryRes,
          propertyTypeRes,
          stateRes,
          amenityRes,
          agentRes,
          builderRes,
        ] = await Promise.all([
          getAllCategories(token),
          getAllPropertyTypes(token),
          getAllStates(token),
          getAllAmenities(token),
          getAllAgents(token),
          getAllBuilders(token),
        ]);

        if (Array.isArray(categoryRes?.data)) {
          setCategoryOptions(
            categoryRes.data.map((item) => ({
              value: item._id,
              label: item.name,
            }))
          );
        } else {
          setCategoryOptions([]);
        }

        if (Array.isArray(propertyTypeRes?.data)) {
          setAllPropertyTypes(propertyTypeRes.data);
        } else {
          setAllPropertyTypes([]);
          setPropertyTypeOptions([]);
        }

        if (Array.isArray(stateRes?.data)) {
          setStateOptions(
            stateRes.data.map((item) => ({
              value: item._id,
              label: item.name,
            }))
          );
        } else {
          setStateOptions([]);
        }

        if (Array.isArray(amenityRes?.data)) {
          setAmenityOptions(
            amenityRes.data.map((item) => ({
              value: item._id,
              label: item.title || item.name,
            }))
          );
        } else {
          setAmenityOptions([]);
        }

        if (Array.isArray(builderRes?.data)) {
          setBuilderOptions(
            builderRes.data.map((builder) => ({
              value: builder._id,
              label: builder.title || builder.slug || "Unnamed Builder",
            }))
          );
        } else {
          setBuilderOptions([]);
        }

        if (Array.isArray(agentRes?.data)) {
          const agentList = agentRes.data.map((agent) => ({
            value: agent._id,
            label: agent.name || agent.email || "Unnamed Agent",
          }));
          setAgentOptions(agentList);
          if (!agentList.length) {
            setAgentError("No agents available. Please add an agent first.");
          }
        } else {
          setAgentOptions([]);
          setAgentError("Failed to load agents.");
        }
      } catch (error) {
        console.error("Error loading base data:", error);
        const message =
          error?.message || "Failed to load form data. Please try again.";
        setOptionsError(message);
        setAgentError(message);
        setCategoryOptions([]);
        setPropertyTypeOptions([]);
        setStateOptions([]);
        setAmenityOptions([]);
        setAgentOptions([]);
        setBuilderOptions([]);
      } finally {
        setLoadingOptions(false);
        setLoadingAgents(false);
      }
    };

    loadBaseData();
  }, []);

  useEffect(() => {
    if (loadingOptions) {
      return;
    }

    const selectedCategoryId = formData.description.category;

    if (!selectedCategoryId) {
      setPropertyTypeOptions([]);
      if (formData.description.propertyType) {
        setFormData((prev) => ({
          ...prev,
          description: {
            ...prev.description,
            propertyType: "",
          },
        }));
      }
      return;
    }

    const filteredPropertyTypes = allPropertyTypes.filter((type) => {
      const categoryId = type.category?._id || type.category;
      return categoryId === selectedCategoryId;
    });

    const nextOptions = filteredPropertyTypes.map((item) => ({
      value: item._id,
      label: item.name,
    }));

    setPropertyTypeOptions(nextOptions);

    const hasCurrentSelection = filteredPropertyTypes.some(
      (item) => item._id === formData.description.propertyType
    );

    if (!hasCurrentSelection && formData.description.propertyType) {
      setFormData((prev) => ({
        ...prev,
        description: {
          ...prev.description,
          propertyType: "",
        },
      }));
    }
  }, [
    formData.description.category,
    formData.description.propertyType,
    allPropertyTypes,
    loadingOptions,
  ]);

  const fetchCities = async (stateId) => {
    if (!tokenRef.current || !stateId) return;
    try {
      setLoadingCities(true);
      setOptionsError(null);
      const response = await getCitiesByStateId(stateId, tokenRef.current);
      if (Array.isArray(response?.data)) {
        setCityOptions(
          response.data.map((city) => ({
            value: city._id,
            label: city.name,
          }))
        );
      } else {
        setCityOptions([]);
      }
    } catch (error) {
      if (error?.code === 404) {
        setCityOptions([]);
      } else {
        console.error("Error fetching cities:", error);
        setOptionsError(error?.message || "Failed to load cities.");
      }
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!tokenRef.current || !cityId) return;
    try {
      setLoadingAreas(true);
      setOptionsError(null);
      const response = await getAreasByCityId(cityId, tokenRef.current);
      if (Array.isArray(response?.data)) {
        setAreaOptions(
          response.data.map((area) => ({
            value: area._id,
            label: area.name,
          }))
        );
      } else {
        setAreaOptions([]);
      }
    } catch (error) {
      if (error?.code === 404) {
        setAreaOptions([]);
      } else {
        console.error("Error fetching areas:", error);
        setOptionsError(error?.message || "Failed to load areas.");
      }
    } finally {
      setLoadingAreas(false);
    }
  };

  const handlePersonalDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }));
  };

  const handleDescriptionChange = (field, value) => {
    setFormData((prev) => {
      const nextDescription = {
        ...prev.description,
        [field]: value,
      };

      // Auto-generate slug from title if title is being changed
      if (field === "title") {
        if (!slugManuallyEdited) {
          nextDescription.slug = generateSlug(value);
        }
      }

      // Track if slug is manually edited
      if (field === "slug") {
        setSlugManuallyEdited(true);
      }

      if (field === "category") {
        nextDescription.propertyType = "";
        const categoryLabel =
          categoryOptions.find((option) => option.value === value)?.label || "";
        // Only auto-generate custom ID if it's empty or was auto-generated
        const updatedCustomId = !prev.details.customId || prev.details.customId.startsWith("PROP-") 
          ? generateCustomId(categoryLabel)
          : prev.details.customId;
        return {
          ...prev,
          description: nextDescription,
          details: {
            ...prev.details,
            customId: updatedCustomId,
          },
        };
      }

      if (field === "reraApproved" && value !== "Yes") {
        nextDescription.reraNumber = "";
      }

      return {
        ...prev,
        description: nextDescription,
      };
    });
  };

  const handleFloorPlansChange = (nextFloorPlans) => {
    if (typeof nextFloorPlans === "function") {
      setFloorPlans((prev) => {
        const resolved = nextFloorPlans(prev);
        return Array.isArray(resolved) ? resolved : [];
      });
      return;
    }
    setFloorPlans(Array.isArray(nextFloorPlans) ? nextFloorPlans : []);
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleDetailsChange = (field, value) => {
    setFormData((prev) => {
      const nextDetails = {
        ...prev.details,
        [field]: value,
      };

      if (
        field === "parking" &&
        (typeof value !== "string" || value === "Not Available" || !value)
      ) {
        nextDetails.numberOfParkings = "";
      }

      return {
        ...prev,
        details: nextDetails,
      };
    });
  };

  const handleStateChange = (option) => {
    const stateId = option?.value || "";
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        state: stateId,
        city: "",
        area: "",
      },
    }));
    setCityOptions([]);
    setAreaOptions([]);
    if (stateId) {
      fetchCities(stateId);
    }
  };

  const handleCityChange = (option) => {
    const cityId = option?.value || "";
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        city: cityId,
        area: "",
      },
    }));
    setAreaOptions([]);
    if (cityId) {
      fetchAreas(cityId);
    }
  };

  const handleAreaChange = (option) => {
    const areaId = option?.value || "";
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        area: areaId,
      },
    }));
  };

  const handleAmenityCheckboxChange = (amenityId, checked) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.amenities) ? prev.amenities : [];
      const nextAmenities = checked
        ? Array.from(new Set([...current, amenityId]))
        : current.filter((id) => id !== amenityId);
      return {
        ...prev,
        amenities: nextAmenities,
      };
    });
  };

  const handleAgentChange = (option) => {
    setFormData((prev) => ({
      ...prev,
      assignedAgent: option ? [option.value] : [],
    }));
  };

  const handleImagesChange = (files) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        images: Array.isArray(files) ? files : [],
      },
    }));
  };

  const handleVirtualTourChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        virtualTour: file || null,
      },
    }));
  };

  const handleSitePlanImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        sitePlanImage: file || null,
      },
    }));
  };

  const handleMasterPlanImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        masterPlanImage: file || null,
      },
    }));
  };

  const handleVideoLinkChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        videoLink: value,
      },
    }));
  };

  const sanitizeText = (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  };

  const normalizeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  };

  const selectedAgent = useMemo(() => {
    if (!formData.assignedAgent.length) return null;
    return (
      agentOptions.find(
        (option) => option.value === formData.assignedAgent[0]
      ) || null
    );
  }, [agentOptions, formData.assignedAgent]);

  const amenityColumns = useMemo(() => {
    if (!amenityOptions.length) return [];
    const itemsPerColumn = Math.ceil(amenityOptions.length / 3);
    return [
      amenityOptions.slice(0, itemsPerColumn),
      amenityOptions.slice(itemsPerColumn, itemsPerColumn * 2),
      amenityOptions.slice(itemsPerColumn * 2),
    ].filter((column) => column.length);
  }, [amenityOptions]);

  const TAB_COUNT = 7;
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const nav = document.querySelector("#nav-tab2");
    if (!nav) return;
    const handler = (e) => {
      const id = e.target?.id;
      if (id && id.startsWith("nav-item")) {
        const num = parseInt(id.replace("nav-item", "").replace("-tab", ""), 10);
        if (!isNaN(num)) setActiveTabIndex(num - 1);
      }
    };
    nav.addEventListener("shown.bs.tab", handler);
    return () => nav.removeEventListener("shown.bs.tab", handler);
  }, []);

  const goToTab = (index) => {
    const btn = document.querySelector(`#nav-item${index + 1}-tab`);
    if (btn) btn.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!formData.assignedAgent.length) {
      setFeedback({
        type: "error",
        message: "Please assign at least one agent before submitting.",
      });
      return;
    }

    if (!tokenRef.current) {
      setFeedback({
        type: "error",
        message: "Admin session expired. Please log in again.",
      });
      return;
    }

    const sanitizedFloorPlans = floorPlans
      .map((plan) => ({
        unitType: sanitizeText(plan.unitType),
        carpetArea: sanitizeText(plan.carpetArea),
        builtUpArea: sanitizeText(plan.builtUpArea),
        superBuiltUpArea: sanitizeText(plan.superBuiltUpArea),
        price: sanitizeText(plan.price),
        image:
          typeof plan.image === "string" && plan.image.trim()
            ? plan.image.trim()
            : "",
        hasFile: plan.image instanceof File,
      }))
      .filter(
        (plan) =>
          plan.unitType ||
          plan.carpetArea ||
          plan.builtUpArea ||
          plan.superBuiltUpArea ||
          plan.price ||
          plan.image ||
          plan.hasFile
      );

    const floorPlanFiles = floorPlans
      .map((plan) => (plan.image instanceof File ? plan.image : null))
      .filter(Boolean);

    const payload = {
      personalDetails: {
        name: sanitizeText(formData.personalDetails.name),
        email: sanitizeText(formData.personalDetails.email),
        phoneNumber: sanitizeText(formData.personalDetails.phoneNumber),
      },
      description: {
        title: sanitizeText(formData.description.title),
        slug:
          sanitizeText(formData.description.slug) ||
          generateSlug(formData.description.title),
        metaTitle: sanitizeText(formData.description.metaTitle),
        metaDescription: sanitizeText(formData.description.metaDescription),
        description: sanitizeText(formData.description.description),
        category: sanitizeText(formData.description.category),
        propertyType: sanitizeText(formData.description.propertyType),
        builder: sanitizeText(formData.description.builder),
        price: normalizeNumber(formData.description.price),
        paymentPlan: sanitizeText(formData.description.paymentPlan),
        reraApproved: sanitizeText(formData.description.reraApproved),
        featuredProperty: sanitizeText(formData.description.featuredProperty),
        reraNumber: sanitizeText(formData.description.reraNumber),
      },
      media: {
        images: formData.media.images,
        virtualTour: formData.media.virtualTour,
        sitePlanImage: formData.media.sitePlanImage,
        masterPlanImage: formData.media.masterPlanImage,
        videoLink: sanitizeText(formData.media.videoLink),
      },
      location: {
        address: sanitizeText(formData.location.address),
        state: sanitizeText(formData.location.state),
        city: sanitizeText(formData.location.city),
        area: sanitizeText(formData.location.area),
        zip: sanitizeText(formData.location.zip),
        nearBy: sanitizeText(formData.location.nearBy),
        mapEmbedCode: sanitizeText(formData.location.mapEmbedCode),
      },
      details: {
        sizeInSqFt: normalizeNumber(formData.details.sizeInSqFt),
        totalAreaInSqFt: normalizeNumber(formData.details.totalAreaInSqFt),
        rooms: normalizeNumber(formData.details.rooms),
        bhk: sanitizeText(formData.details.bhk),
        bedrooms: normalizeNumber(formData.details.bedrooms),
        bathrooms: sanitizeText(formData.details.bathrooms),
        customId: sanitizeText(formData.details.customId),
        parking: sanitizeText(formData.details.parking),
        numberOfParkings: normalizeNumber(formData.details.numberOfParkings),
        totalFloors: normalizeNumber(formData.details.totalFloors),
        totalTowers: normalizeNumber(formData.details.totalTowers),
        numberOfEntrances: normalizeNumber(formData.details.numberOfEntrances),
        ceilingHeight: normalizeNumber(formData.details.ceilingHeight),
        floorLoadCapacity: normalizeNumber(formData.details.floorLoadCapacity),
        possessionDate: sanitizeText(formData.details.possessionDate),
        completionDate: sanitizeText(formData.details.completionDate),
        revisedPossessionDate: sanitizeText(formData.details.revisedPossessionDate),
        basement: sanitizeText(formData.details.basement),
        balcony: normalizeNumber(formData.details.balcony),
        plotSize: normalizeNumber(formData.details.plotSize),
        plotDimensionLength: normalizeNumber(formData.details.plotDimensionLength),
        plotDimensionWidth: normalizeNumber(formData.details.plotDimensionWidth),
        facing: sanitizeText(formData.details.facing),
        shellStatus: sanitizeText(formData.details.shellStatus),
        waterSource: sanitizeText(formData.details.waterSource),
        electricityPhase: sanitizeText(formData.details.electricityPhase),
        boundaryStatus: sanitizeText(formData.details.boundaryStatus),
        washroomAvailability: sanitizeText(formData.details.washroomAvailability),
        pantryAvailability: sanitizeText(formData.details.pantryAvailability),
        boundaryWall: sanitizeText(formData.details.boundaryWall),
        gatedCommunity: sanitizeText(formData.details.gatedCommunity),
        cornerPlot: sanitizeText(formData.details.cornerPlot),
        legalStatus: sanitizeText(formData.details.legalStatus),
        construction: sanitizeText(formData.details.construction),
        furnishingStatus: sanitizeText(formData.details.furnishingStatus),
        ownershipType: sanitizeText(formData.details.ownershipType),
        propertyStatus: sanitizeText(formData.details.propertyStatus),
        buildingStatus: sanitizeText(formData.details.buildingStatus),
        availableFrom: sanitizeText(formData.details.availableFrom),
      },
      amenities: Array.isArray(formData.amenities)
        ? Array.from(new Set(formData.amenities.filter(Boolean)))
        : [],
      assignedAgent: formData.assignedAgent,
      floorPlanFiles,
    };

    payload.description.floorPlans = sanitizedFloorPlans;

    setSubmitting(true);

    try {
      const response = await createPropertyByAdmin(payload, tokenRef.current);
      const successMessage = response?.message || "Property added successfully and marked as verified.";
      setFeedback({
        type: "success",
        message: successMessage,
      });
      alert(successMessage);
      router.push("/cmsadminlogin/my-properties");
      return;
    } catch (error) {
      console.error("Failed to create property:", error);
      const message =
        error?.message ||
        error?.errors ||
        "Failed to add property. Please review the form and try again.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav>
        <div className="nav nav-tabs" id="nav-tab2" role="tablist" >
          <button
            className="nav-link active fw600 ms-3"
            id="nav-item1-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item1"
            type="button"
            role="tab"
            aria-controls="nav-item1"
            aria-selected="true"
          >
            1. Personal Details
          </button>
          <button
            className="nav-link fw600"
            id="nav-item2-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item2"
            type="button"
            role="tab"
            aria-controls="nav-item2"
            aria-selected="false"
          >
            2. Description
          </button>
          <button
            className="nav-link fw600"
            id="nav-item3-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item3"
            type="button"
            role="tab"
            aria-controls="nav-item3"
            aria-selected="false"
          >
            3. Media
          </button>
          <button
            className="nav-link fw600"
            id="nav-item4-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item4"
            type="button"
            role="tab"
            aria-controls="nav-item4"
            aria-selected="false"
          >
            4. Location
          </button>
          <button
            className="nav-link fw600"
            id="nav-item5-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item5"
            type="button"
            role="tab"
            aria-controls="nav-item5"
            aria-selected="false"
          >
            5. Detail
          </button>
          <button
            className="nav-link fw600"
            id="nav-item6-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item6"
            type="button"
            role="tab"
            aria-controls="nav-item6"
            aria-selected="false"
          >
            6. Amenities
          </button>
          <button
            className="nav-link fw600"
            id="nav-item7-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-item7"
            type="button"
            role="tab"
            aria-controls="nav-item7"
            aria-selected="false"
          >
            7. Assign Agent
          </button>
        </div>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="tab-content" id="nav-tabContent">
          <div
            className="tab-pane fade show active"
            id="nav-item1"
            role="tabpanel"
            aria-labelledby="nav-item1-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Personal Details</h4>
              <div className="row">
                <div className="col-sm-6 col-xl-4">
                  <div className="mb30">
                    <label className="heading-color ff-heading fw600 mb10">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name"
                      value={formData.personalDetails.name}
                      onChange={(e) =>
                        handlePersonalDetailsChange("name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="col-sm-6 col-xl-4">
                  <div className="mb30">
                    <label className="heading-color ff-heading fw600 mb10">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email address"
                      value={formData.personalDetails.email}
                      onChange={(e) =>
                        handlePersonalDetailsChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="col-sm-6 col-xl-4">
                  <div className="mb30">
                    <label className="heading-color ff-heading fw600 mb10">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter 10 digit phone number"
                      maxLength={10}
                      value={formData.personalDetails.phoneNumber}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        handlePersonalDetailsChange("phoneNumber", numericValue);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="nav-item2"
            role="tabpanel"
            aria-labelledby="nav-item2-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Property Description</h4>
              <PropertyDescription
                data={formData.description}
                onChange={handleDescriptionChange}
                categoryOptions={categoryOptions}
                propertyTypeOptions={propertyTypeOptions}
                furnishingOptions={furnishingStatusOptions}
                propertyStatusOptions={propertyStatusOptions}
                ownershipTypeOptions={ownershipTypeOptions}
                reraOptions={reraApprovedOptions}
                featuredOptions={featuredPropertyOptions}
                builderOptions={builderOptions}
                selectStyles={selectStyles}
                showSelect={showSelect}
                enableFloorPlans
                floorPlans={floorPlans}
                onFloorPlansChange={handleFloorPlansChange}
              />
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="nav-item3"
            role="tabpanel"
            aria-labelledby="nav-item3-tab"
          >
            <UploadMedia
              media={formData.media}
              onImagesChange={handleImagesChange}
              onVideoLinkChange={handleVideoLinkChange}
              onVirtualTourChange={handleVirtualTourChange}
              onSitePlanImageChange={handleSitePlanImageChange}
              onMasterPlanImageChange={handleMasterPlanImageChange}
              resetSignal={resetSignal}
            />
          </div>

          <div
            className="tab-pane fade"
            id="nav-item4"
            role="tabpanel"
            aria-labelledby="nav-item4-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Property Location</h4>
              <LocationField
                data={formData.location}
                onInputChange={handleLocationChange}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                onAreaChange={handleAreaChange}
                stateOptions={stateOptions}
                cityOptions={cityOptions}
                areaOptions={areaOptions}
                selectStyles={selectStyles}
                showSelect={showSelect}
                loadingStates={loadingOptions}
                loadingCities={loadingCities}
                loadingAreas={loadingAreas}
              />
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="nav-item5"
            role="tabpanel"
            aria-labelledby="nav-item5-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Property Details</h4>
              <DetailsFiled
                data={formData.details}
                onChange={handleDetailsChange}
                basementOptions={basementOptions}
                parkingOptions={parkingOptions}
                facingOptions={facingOptions}
                shellStatusOptions={shellStatusOptions}
                waterSourceOptions={waterSourceOptions}
                electricityPhaseOptions={electricityPhaseOptions}
                boundaryStatusOptions={boundaryStatusOptions}
                washroomAvailabilityOptions={washroomAvailabilityOptions}
                pantryAvailabilityOptions={pantryAvailabilityOptions}
                boundaryWallOptions={boundaryWallOptions}
                gatedCommunityOptions={gatedCommunityOptions}
                cornerPlotOptions={cornerPlotOptions}
                legalStatusOptions={legalStatusOptions}
                constructionOptions={constructionOptions}
                furnishingOptions={furnishingStatusOptions}
                ownershipTypeOptions={ownershipTypeOptions}
                propertyStatusOptions={propertyStatusOptions}
                buildingStatusOptions={buildingStatusOptions}
                selectStyles={selectStyles}
                showSelect={showSelect}
                category={formData.description.category}
                categoryOptions={categoryOptions}
              />
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="nav-item6"
            role="tabpanel"
            aria-labelledby="nav-item6-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Select Amenities</h4>
              {loadingOptions ? (
                <p className="text-muted mb0">Loading amenities...</p>
              ) : amenityColumns.length ? (
                <div className="row">
                  {amenityColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="col-sm-6 col-xl-4">
                      <div className="checkbox-style1">
                        {column.map((amenity) => (
                          <label
                            key={amenity.value}
                            className="custom_checkbox"
                          >
                            {amenity.label}
                            <input
                              type="checkbox"
                              checked={
                                Array.isArray(formData.amenities) &&
                                formData.amenities.includes(amenity.value)
                              }
                              onChange={(e) =>
                                handleAmenityCheckboxChange(
                                  amenity.value,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="checkmark" />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb0">
                  {optionsError ||
                    "No amenities available. Please add amenities first."}
                </p>
              )}
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="nav-item7"
            role="tabpanel"
            aria-labelledby="nav-item7-tab"
          >
            <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
              <h4 className="title fz17 mb30">Assign Agent</h4>
              <div className="row">
                <div className="col-sm-12 col-xl-6">
                  <label className="heading-color ff-heading fw600 mb10">
                    Select Agent
                  </label>
                  <div className="location-area">
                    {showSelect && (
                      <Select
                        styles={selectStyles}
                        className="select-custom pl-0"
                        classNamePrefix="select"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        options={agentOptions}
                        value={selectedAgent}
                        onChange={handleAgentChange}
                        placeholder={
                          loadingAgents
                            ? "Loading agents..."
                            : "Select an agent"
                        }
                        isDisabled={loadingAgents || agentOptions.length === 0}
                        noOptionsMessage={() =>
                          agentError || "No agents available"
                        }
                        isClearable
                      />
                    )}
                  </div>
                  {agentError && (
                    <p className="mt10" style={{ color: "#dc2626" }}>
                      {agentError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {feedback.message && (
          <div
            className={`mt20 mb0 px30 ${
              feedback.type === "success" ? "text-success" : "text-danger"
            }`}
          >
            {feedback.message}
          </div>
        )}
        {optionsError && !feedback.message && (
          <div className="mt20 mb0 px30 text-danger">{optionsError}</div>
        )}

        <div className="d-flex justify-content-end gap-2 mt30 px30 pb30">
          {activeTabIndex > 0 && (
            <button
              type="button"
              className="ud-btn btn-dark"
              onClick={() => goToTab(activeTabIndex - 1)}
            >
              Back
            </button>
          )}
          {activeTabIndex < TAB_COUNT - 1 ? (
            <button
              type="button"
              className="ud-btn btn-thm"
              onClick={() => goToTab(activeTabIndex + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ud-btn btn-thm"
              disabled={submitting || loadingOptions || loadingAgents}
            >
              {submitting ? "Saving..." : "Save Property"}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default AddPropertyTabContent;

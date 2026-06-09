"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { getAllBuilders } from "@/api/builder";
import { getPropertyByIdAdmin, updatePropertyByAdmin } from "@/api/property";

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

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" },
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

const createEmptyFormData = () => ({
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
    completionDate: "",
    possessionDate: "",
    revisedPossessionDate: "",
    basement: "",
    balcony: "",
    totalFloors: "",
    totalTowers: "",
    numberOfEntrances: "",
    ceilingHeight: "",
    floorLoadCapacity: "",
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
  status: "pending",
  rejectionReason: "",
});

const mapPropertyToFormData = (property) => {
  const getId = (value) =>
    typeof value === "object" && value !== null
      ? value._id || value.id || ""
      : value || "";
  const normalizeParking = (value) => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    return value || "";
  };

  const categoryLabel =
    (typeof property.description?.category === "object" &&
      property.description?.category !== null &&
      (property.description.category.name ||
        property.description.category.title ||
        property.description.category.label)) ||
    (typeof property.category === "object" && property.category !== null
      ? property.category.name || property.category.title || ""
      : "");

  return {
    personalDetails: {
      name: property.personalDetails?.name || "",
      email: property.personalDetails?.email || "",
      phoneNumber: property.personalDetails?.phoneNumber || "",
    },
    description: {
      title: property.description?.title || "",
      slug: property.description?.slug || "",
      metaTitle: property.description?.metaTitle || "",
      metaDescription: property.description?.metaDescription || "",
      description: property.description?.description || "",
      category: getId(property.description?.category),
      propertyType: getId(property.description?.propertyType),
      builder: getId(property.description?.builder),
      price:
        property.description?.price !== undefined &&
        property.description?.price !== null
          ? property.description.price
          : "",
      paymentPlan: property.description?.paymentPlan || "",
      reraApproved: property.description?.reraApproved || "",
      featuredProperty: property.description?.featuredProperty || "",
      reraNumber: property.description?.reraNumber || "",
    },
    media: {
      images: property.media?.images || [],
      virtualTour: property.media?.virtualTour || null,
      sitePlanImage: property.media?.sitePlanImage || null,
      masterPlanImage: property.media?.masterPlanImage || null,
      videoLink: property.media?.videoLink || "",
    },
    location: {
      address: property.location?.address || "",
      state: getId(property.location?.state),
      city: getId(property.location?.city),
      area: getId(property.location?.area),
      zip: property.location?.zip || "",
      nearBy: property.location?.nearBy || "",
      mapEmbedCode: property.location?.mapEmbedCode || "",
    },
    details: {
      sizeInSqFt:
        property.details?.sizeInSqFt !== undefined &&
        property.details?.sizeInSqFt !== null
          ? property.details.sizeInSqFt
          : "",
      totalAreaInSqFt:
        property.details?.totalAreaInSqFt !== undefined &&
        property.details?.totalAreaInSqFt !== null
          ? property.details.totalAreaInSqFt
          : "",
      rooms:
        property.details?.rooms !== undefined &&
        property.details?.rooms !== null
          ? property.details.rooms
          : "",
      bhk: property.details?.bhk || "",
      bedrooms:
        property.details?.bedrooms !== undefined &&
        property.details?.bedrooms !== null
          ? property.details.bedrooms
          : "",
      bathrooms:
        property.details?.bathrooms !== undefined &&
        property.details?.bathrooms !== null
          ? property.details.bathrooms.toString()
          : "",
      customId: property.details?.customId || generateCustomId(categoryLabel),
      parking: normalizeParking(property.details?.parking),
      numberOfParkings:
        property.details?.numberOfParkings !== undefined &&
        property.details?.numberOfParkings !== null
          ? property.details.numberOfParkings.toString()
          : property.details?.parkingSize?.toString() || "",
      completionDate: property.details?.completionDate || "",
      possessionDate: property.details?.possessionDate || "",
      revisedPossessionDate: property.details?.revisedPossessionDate || "",
      basement: property.details?.basement || "",
      balcony:
        property.details?.balcony !== undefined &&
        property.details?.balcony !== null
          ? property.details.balcony
          : "",
      totalFloors:
        property.details?.totalFloors !== undefined &&
        property.details?.totalFloors !== null
          ? property.details.totalFloors
          : "",
      totalTowers:
        property.details?.totalTowers !== undefined &&
        property.details?.totalTowers !== null
          ? property.details.totalTowers
          : "",
      numberOfEntrances:
        property.details?.numberOfEntrances !== undefined &&
        property.details?.numberOfEntrances !== null
          ? property.details.numberOfEntrances
          : "",
      ceilingHeight:
        property.details?.ceilingHeight !== undefined &&
        property.details?.ceilingHeight !== null
          ? property.details.ceilingHeight
          : "",
      floorLoadCapacity:
        property.details?.floorLoadCapacity !== undefined &&
        property.details?.floorLoadCapacity !== null
          ? property.details.floorLoadCapacity
          : "",
      plotSize:
        property.details?.plotSize !== undefined &&
        property.details?.plotSize !== null
          ? property.details.plotSize
          : "",
      plotDimensionLength:
        property.details?.plotDimensionLength !== undefined &&
        property.details?.plotDimensionLength !== null
          ? property.details.plotDimensionLength
          : "",
      plotDimensionWidth:
        property.details?.plotDimensionWidth !== undefined &&
        property.details?.plotDimensionWidth !== null
          ? property.details.plotDimensionWidth
          : "",
      facing: property.details?.facing || "",
      shellStatus: property.details?.shellStatus || "",
      waterSource: property.details?.waterSource || "",
      electricityPhase: property.details?.electricityPhase || "",
      boundaryStatus: property.details?.boundaryStatus || "",
      washroomAvailability: property.details?.washroomAvailability || "",
      pantryAvailability: property.details?.pantryAvailability || "",
      boundaryWall: property.details?.boundaryWall || "",
      gatedCommunity: property.details?.gatedCommunity || "",
      cornerPlot: property.details?.cornerPlot || "",
      legalStatus: property.details?.legalStatus || "",
      construction: property.details?.construction || "",
      furnishingStatus: property.details?.furnishingStatus || "",
      ownershipType: property.details?.ownershipType || property.description?.ownershipType || "",
      propertyStatus: property.details?.propertyStatus || property.description?.propertyStatus || "",
      buildingStatus: property.details?.buildingStatus || "",
      availableFrom: property.details?.availableFrom || "",
    },
    amenities: Array.isArray(property.amenities)
      ? property.amenities.map(getId).filter(Boolean)
      : property.amenities
      ? [getId(property.amenities)].filter(Boolean)
      : [],
    assignedAgent: Array.isArray(property.assignedAgent)
      ? property.assignedAgent.map(getId)
      : [],
    status: property.status || "pending",
    rejectionReason: property.rejectionReason || "",
  };
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

const EditPropertyTabContent = ({
  propertyId,
  redirectTo = "/cmsadminlogin/my-properties",
}) => {
  const router = useRouter();
  const tokenRef = useRef(null);

  const [formData, setFormData] = useState(createEmptyFormData);
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

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [saving, setSaving] = useState(false);

  const [optionsError, setOptionsError] = useState(null);
  const [propertyError, setPropertyError] = useState(null);
  const [agentError, setAgentError] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [resetSignal, setResetSignal] = useState(0);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [floorPlans, setFloorPlans] = useState([]);

  useEffect(() => {
    setShowSelect(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    tokenRef.current = token;

    if (!token) {
      setOptionsError("Admin session expired. Please log in again.");
      setAgentError("Admin session expired. Please log in again.");
      setPropertyError("Admin session expired. Please log in again.");
      setLoadingProperty(false);
      return;
    }

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError(null);
        setAgentError(null);

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
          const agentsList = agentRes.data.map((agent) => ({
            value: agent._id,
            label: agent.name || agent.email || "Unnamed Agent",
          }));
          setAgentOptions(agentsList);
          if (!agentsList.length) {
            setAgentError("No agents available. Please add an agent first.");
          }
        } else {
          setAgentOptions([]);
          setAgentError("Failed to load agents.");
        }
      } catch (error) {
        console.error("Error loading options:", error);
        const message =
          error?.message || "Failed to load form data. Please try again.";
        setOptionsError(message);
        setAgentError(message);
        setCategoryOptions([]);
        setPropertyTypeOptions([]);
        setStateOptions([]);
        setAmenityOptions([]);
        setBuilderOptions([]);
        setAgentOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
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

  useEffect(() => {
    const fetchProperty = async () => {
      if (!tokenRef.current) {
        return;
      }
      try {
        setLoadingProperty(true);
        setPropertyError(null);
        const property = await getPropertyByIdAdmin(
          propertyId,
          tokenRef.current
        );

        if (!property) {
          setPropertyError("Property not found or inaccessible.");
          setLoadingProperty(false);
          return;
        }

        const mapped = mapPropertyToFormData(property);
        setFormData(mapped);
        setFloorPlans(
          Array.isArray(property.description?.floorPlans)
            ? property.description.floorPlans
            : []
        );

        // Check if slug was manually edited (different from auto-generated)
        const title = mapped.description.title || "";
        const slug = mapped.description.slug || "";
        const autoGeneratedSlug = generateSlug(title);
        setSlugManuallyEdited(slug !== autoGeneratedSlug && slug !== "");

        const stateId = mapped.location.state;
        const cityId = mapped.location.city;

        if (stateId) {
          await fetchCities(stateId, true);
        }
        if (cityId) {
          await fetchAreas(cityId, true);
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
        setPropertyError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load property details."
        );
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const fetchCities = async (stateId, silent = false) => {
    if (!tokenRef.current || !stateId) return;
    try {
      if (!silent) setLoadingCities(true);
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
      if (!silent) setLoadingCities(false);
    }
  };

  const fetchAreas = async (cityId, silent = false) => {
    if (!tokenRef.current || !cityId) return;
    try {
      if (!silent) setLoadingAreas(true);
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
      if (!silent) setLoadingAreas(false);
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
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
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

  const handleStatusChange = (option) => {
    const statusValue = option?.value || "pending";
    setFormData((prev) => ({
      ...prev,
      status: statusValue,
      rejectionReason: statusValue === "rejected" ? prev.rejectionReason : "",
    }));
  };

  const handleRejectionReasonChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      rejectionReason: value,
    }));
  };

  const handleImagesChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        images: Array.isArray(images) ? images : [],
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

  const selectedStatus = useMemo(
    () =>
      statusOptions.find((option) => option.value === formData.status) || null,
    [formData.status]
  );

  const TAB_COUNT = 8;
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const formRef = useRef(null);

  // Sync activeTabIndex when user clicks tab headers directly
  useEffect(() => {
    if (loadingProperty) return;
    const nav = formRef.current?.querySelector("#nav-tab-edit");
    if (!nav) return;
    const handler = (e) => {
      const id = e.target?.id;
      if (id && id.startsWith("edit-nav-item")) {
        const num = parseInt(id.replace("edit-nav-item", "").replace("-tab", ""), 10);
        if (!isNaN(num)) setActiveTabIndex(num - 1);
      }
    };
    nav.addEventListener("shown.bs.tab", handler);
    return () => nav.removeEventListener("shown.bs.tab", handler);
  }, [loadingProperty]);

  const goToTab = (index) => {
    if (index < 0 || index >= TAB_COUNT) return;
    const form = formRef.current;
    if (!form) return;

    setActiveTabIndex(index);

    // Manually switch tab (works without depending on Bootstrap API)
    const tabButtons = form.querySelectorAll('[id^="edit-nav-item"][id$="-tab"]');
    const tabPanes = form.querySelectorAll('[id^="edit-nav-item"]:not([id$="-tab"])');
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabPanes.forEach((pane) => pane.classList.remove("show", "active"));

    const targetBtn = form.querySelector(`#edit-nav-item${index + 1}-tab`);
    const targetPane = form.querySelector(`#edit-nav-item${index + 1}`);
    if (targetBtn) targetBtn.classList.add("active");
    if (targetPane) targetPane.classList.add("show", "active");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (formData.status === "verified" && !formData.assignedAgent.length) {
      setFeedback({
        type: "error",
        message:
          "Please select at least one agent before marking the property as verified.",
      });
      return;
    }

    if (formData.status === "rejected") {
      if (!formData.rejectionReason || !formData.rejectionReason.trim()) {
        setFeedback({
          type: "error",
          message: "Rejection reason is required when rejecting a property.",
        });
        return;
      }
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
        plotSize: normalizeNumber(formData.details.plotSize),
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
        revisedPossessionDate: sanitizeText(
          formData.details.revisedPossessionDate
        ),
        basement: sanitizeText(formData.details.basement),
        balcony: normalizeNumber(formData.details.balcony),
        plotDimensionLength: normalizeNumber(
          formData.details.plotDimensionLength
        ),
        plotDimensionWidth: normalizeNumber(
          formData.details.plotDimensionWidth
        ),
        facing: sanitizeText(formData.details.facing),
        shellStatus: sanitizeText(formData.details.shellStatus),
        waterSource: sanitizeText(formData.details.waterSource),
        electricityPhase: sanitizeText(formData.details.electricityPhase),
        boundaryStatus: sanitizeText(formData.details.boundaryStatus),
        washroomAvailability: sanitizeText(
          formData.details.washroomAvailability
        ),
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
      status: formData.status,
      rejectionReason: formData.rejectionReason
        ? formData.rejectionReason.trim()
        : "",
    };

    payload.description.floorPlans = sanitizedFloorPlans;

    if (floorPlanFiles.length) {
      payload.floorPlanFiles = floorPlanFiles;
    }

    try {
      setSaving(true);
      const response = await updatePropertyByAdmin(
        propertyId,
        payload,
        tokenRef.current
      );

      const successMessage = response?.message || "Property updated successfully.";
      setFeedback({
        type: "success",
        message: successMessage,
      });
      alert(successMessage);
      setResetSignal((prev) => prev + 1);

      if (redirectTo) {
        setTimeout(() => {
          router.push(redirectTo);
        }, 1200);
      }
    } catch (error) {
      console.error("Failed to update property:", error);
      const message =
        error?.message ||
        error?.errors ||
        error?.response?.data?.message ||
        "Failed to update property. Please review the form and try again.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="p30">
        <p className="mb-0">Loading property details...</p>
      </div>
    );
  }

  if (propertyError) {
    return (
      <div className="p30 text-danger">
        <p className="mb-0">{propertyError}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <nav>
        <div className="nav nav-tabs" id="nav-tab-edit" role="tablist">
          <button
            className="nav-link active fw600 ms-3"
            id="edit-nav-item1-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item1"
            type="button"
            role="tab"
            aria-controls="edit-nav-item1"
            aria-selected="true"
          >
            1. Personal Details
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item2-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item2"
            type="button"
            role="tab"
            aria-controls="edit-nav-item2"
            aria-selected="false"
          >
            2. Description
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item3-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item3"
            type="button"
            role="tab"
            aria-controls="edit-nav-item3"
            aria-selected="false"
          >
            3. Media
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item4-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item4"
            type="button"
            role="tab"
            aria-controls="edit-nav-item4"
            aria-selected="false"
          >
            4. Location
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item5-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item5"
            type="button"
            role="tab"
            aria-controls="edit-nav-item5"
            aria-selected="false"
          >
            5. Detail
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item6-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item6"
            type="button"
            role="tab"
            aria-controls="edit-nav-item6"
            aria-selected="false"
          >
            6. Amenities
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item7-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item7"
            type="button"
            role="tab"
            aria-controls="edit-nav-item7"
            aria-selected="false"
          >
            7. Assign Agent
          </button>
          <button
            className="nav-link fw600"
            id="edit-nav-item8-tab"
            data-bs-toggle="tab"
            data-bs-target="#edit-nav-item8"
            type="button"
            role="tab"
            aria-controls="edit-nav-item8"
            aria-selected="false"
          >
            8. Status
          </button>
        </div>
      </nav>

      <div className="tab-content" id="edit-nav-tabContent">
        <div
          className="tab-pane fade show active"
          id="edit-nav-item1"
          role="tabpanel"
          aria-labelledby="edit-nav-item1-tab"
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
          id="edit-nav-item2"
          role="tabpanel"
          aria-labelledby="edit-nav-item2-tab"
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
              featuredPropertyOptions={featuredPropertyOptions}
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
          id="edit-nav-item3"
          role="tabpanel"
          aria-labelledby="edit-nav-item3-tab"
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
          id="edit-nav-item4"
          role="tabpanel"
          aria-labelledby="edit-nav-item4-tab"
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
          id="edit-nav-item5"
          role="tabpanel"
          aria-labelledby="edit-nav-item5-tab"
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
          id="edit-nav-item6"
          role="tabpanel"
          aria-labelledby="edit-nav-item6-tab"
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
                        <label key={amenity.value} className="custom_checkbox">
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
          id="edit-nav-item7"
          role="tabpanel"
          aria-labelledby="edit-nav-item7-tab"
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
                        loadingOptions
                          ? "Loading agents..."
                          : formData.status === "verified"
                          ? "Select an agent"
                          : "Agents can be assigned when status is Verified"
                      }
                      isDisabled={
                        loadingOptions ||
                        agentOptions.length === 0 ||
                        formData.status !== "verified"
                      }
                      noOptionsMessage={() =>
                        agentError || "No agents available"
                      }
                      isClearable
                    />
                  )}
                </div>
                {formData.status !== "verified" && (
                  <p className="mt10 small">
                    Agents can only be assigned when the status is set to{" "}
                    <strong>Verified</strong>.
                  </p>
                )}
                {agentError && (
                  <p className="mt10" style={{ color: "#dc2626" }}>
                    {agentError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="tab-pane fade"
          id="edit-nav-item8"
          role="tabpanel"
          aria-labelledby="edit-nav-item8-tab"
        >
          <div className="ps-widget bgc-white bdrs12 p30 overflow-hidden position-relative">
            <h4 className="title fz17 mb30">Status & Approval</h4>
            <div className="row">
              <div className="col-sm-12 col-xl-6">
                <label className="heading-color ff-heading fw600 mb10">
                  Property Status
                </label>
                <div className="location-area mb20">
                  {showSelect && (
                    <Select
                      styles={selectStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      options={statusOptions}
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      placeholder="Select property status"
                    />
                  )}
                </div>
              </div>
            </div>
            {formData.status === "rejected" && (
              <div className="row">
                <div className="col-sm-12 col-xl-6">
                  <label className="heading-color ff-heading fw600 mb10">
                    Rejection Reason
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Provide a reason for rejection..."
                    value={formData.rejectionReason}
                    onChange={(e) =>
                      handleRejectionReasonChange(e.target.value)
                    }
                  />
                </div>
              </div>
            )}
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
            disabled={saving || loadingOptions}
          >
            {saving ? "Saving..." : "Save Property"}
          </button>
        )}
      </div>
    </form>
  );
};

export default EditPropertyTabContent;

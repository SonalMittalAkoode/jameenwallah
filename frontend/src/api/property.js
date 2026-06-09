import axios from "axios";
import { getAdminApiBaseUrl, getApiBaseUrl } from "@/api/apiBase";

const dynamicBase = (resolveBaseUrl) => ({
  toString: resolveBaseUrl,
  valueOf: resolveBaseUrl,
  [Symbol.toPrimitive]: resolveBaseUrl,
});

const API_BASE_URL = dynamicBase(() => getAdminApiBaseUrl("http://localhost:5001/admin"));
const FRONTEND_API_BASE_URL = dynamicBase(() => getApiBaseUrl("http://localhost:5001"));

/** Headers for public frontend routes that require an API key (when configured). */
const getFrontendApiHeaders = () => {
  const apiKey =
    process.env.NEXT_PUBLIC_END_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
  return apiKey ? { "x-api-key": apiKey } : {};
};

const appendFloorPlanData = (formData, propertyData) => {
  const floorPlans = propertyData?.description?.floorPlans;
  if (floorPlans !== undefined) {
    formData.append(
      "description[floorPlans]",
      JSON.stringify(floorPlans || [])
    );
  }

  if (Array.isArray(propertyData?.floorPlanFiles)) {
    propertyData.floorPlanFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("floorPlanImages", file);
      }
    });
  }
};

// get all properties
export const getAllProperties = async (token, params = {}) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = { headers };
    if (params && Object.keys(params).length > 0) {
      config.params = params;
    }

    const response = await axios.get(`${API_BASE_URL}/api/property`, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching all properties:", error);
    throw error;
  }
};

// get property by id
export const getPropertyByIdAdmin = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/property/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching property details:", error);
    throw error;
  }
};

// get pending properties
export const getPendingProperties = async (token, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/pending?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pending properties:", error);
    throw error;
  }
};

// get verified properties
export const getVerifiedProperties = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/property/verified`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching verified properties:", error);
    throw error;
  }
};

// get pending property by id
export const getPendingPropertyById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/pending/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching pending property:", error);
    throw error;
  }
};

// get verified property by id
export const getVerifiedPropertyById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/verified/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching verified property:", error);
    throw error;
  }
};

// get assigned property by id
export const getAssignedPropertyById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/assigned/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching assigned property:", error);
    throw error;
  }
};

// get rejected property by id
export const getRejectedPropertyById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/rejected/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching rejected property:", error);
    throw error;
  }
};

// get sold property by id
export const getSoldPropertyById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/property/sold/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching sold property:", error);
    throw error;
  }
};

// update property status
export const updatePropertyStatus = async (id, status, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/property/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating property status:", error);
    throw error;
  }
};

// update property
export const updateProperty = async (id, propertyData, token) => {
  try {
    const isStatusOnlyUpdate =
      Object.keys(propertyData).length === 1 && propertyData.status;

    if (isStatusOnlyUpdate) {
      return await updatePropertyStatus(id, propertyData.status, token);
    }

    const formData = new FormData();
    appendFloorPlanData(formData, propertyData);

    Object.keys(propertyData).forEach((key) => {
      if (key === "floorPlanFiles") return;
      if (key === "floorPlanFiles") return;
      if (key === "media" && propertyData.media) {
        if (
          propertyData.media.images &&
          Array.isArray(propertyData.media.images)
        ) {
          const existingImageUrls = propertyData.media.images
            .filter((img) => typeof img === "string")
            .map((img) => img.trim())
            .filter((img) => img.length > 0);

          formData.append("existingImages", JSON.stringify(existingImageUrls));
          console.log(
            "UpdateProperty - sending existingImages:",
            existingImageUrls
          );

          const newImageFiles = propertyData.media.images.filter(
            (img) => img instanceof File
          );
          newImageFiles.forEach((image) => {
            formData.append("images", image);
          });
          console.log(
            "UpdateProperty - sending new image files:",
            newImageFiles.length
          );
        } else {
          formData.append("existingImages", JSON.stringify([]));
          console.log("UpdateProperty - sending empty existingImages array");
        }

        if (propertyData.media.virtualTour instanceof File) {
          formData.append("virtualTour", propertyData.media.virtualTour);
        } else if (
          typeof propertyData.media.virtualTour === "string" &&
          propertyData.media.virtualTour.trim()
        ) {
          formData.append(
            "existingVirtualTour",
            propertyData.media.virtualTour
          );
        } else {
          formData.append("existingVirtualTour", "");
        }

        if (propertyData.media.sitePlanImage instanceof File) {
          formData.append("sitePlanImage", propertyData.media.sitePlanImage);
        } else if (
          typeof propertyData.media.sitePlanImage === "string" &&
          propertyData.media.sitePlanImage.trim()
        ) {
          formData.append(
            "existingSitePlanImage",
            propertyData.media.sitePlanImage
          );
        } else {
          formData.append("existingSitePlanImage", "");
        }

        if (propertyData.media.masterPlanImage instanceof File) {
          formData.append(
            "masterPlanImage",
            propertyData.media.masterPlanImage
          );
        } else if (
          typeof propertyData.media.masterPlanImage === "string" &&
          propertyData.media.masterPlanImage.trim()
        ) {
          formData.append(
            "existingMasterPlanImage",
            propertyData.media.masterPlanImage
          );
        } else {
          formData.append("existingMasterPlanImage", "");
        }

        if (propertyData.media.videoLink) {
          formData.append("media[videoLink]", propertyData.media.videoLink);
        }
      } else if (key === "personalDetails" && propertyData.personalDetails) {
        Object.keys(propertyData.personalDetails).forEach((subKey) => {
          formData.append(
            `personalDetails[${subKey}]`,
            propertyData.personalDetails[subKey]
          );
        });
      } else if (key === "description" && propertyData.description) {
        Object.keys(propertyData.description).forEach((subKey) => {
          if (subKey === "floorPlans") return;
          const value = propertyData.description[subKey];
          formData.append(
            `description[${subKey}]`,
            value !== undefined && value !== null ? value : ""
          );
        });
      } else if (key === "location" && propertyData.location) {
        Object.keys(propertyData.location).forEach((subKey) => {
          formData.append(`location[${subKey}]`, propertyData.location[subKey]);
        });
      } else if (key === "details" && propertyData.details) {
        Object.keys(propertyData.details).forEach((subKey) => {
          const value = propertyData.details[subKey];
          if (Array.isArray(value)) {
            formData.append(`details[${subKey}]`, JSON.stringify(value));
          } else {
            formData.append(`details[${subKey}]`, value);
          }
        });
      } else if (key === "amenities") {
        if (Array.isArray(propertyData.amenities)) {
          formData.append("amenities", JSON.stringify(propertyData.amenities));
        } else {
          formData.append("amenities", propertyData.amenities);
        }
      } else if (key === "status") {
        formData.append("status", propertyData.status);
      } else if (key !== "_id" && key !== "id") {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await axios.put(
      `${API_BASE_URL}/api/property/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

// create property
export const createProperty = async (propertyData, token) => {
  try {
    const formData = new FormData();
    appendFloorPlanData(formData, propertyData);

    if (propertyData.personalDetails) {
      Object.entries(propertyData.personalDetails).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`personalDetails[${key}]`, value);
        }
      });
    }

    if (propertyData.description) {
      Object.entries(propertyData.description).forEach(([key, value]) => {
        if (key === "floorPlans") return;
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`description[${key}][${index}]`, item);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(`description[${key}]`, value);
        }
      });
    }

    if (propertyData.media) {
      if (Array.isArray(propertyData.media.images)) {
        propertyData.media.images.forEach((file) => {
          if (file instanceof File) {
            formData.append("images", file);
          }
        });
      }
      if (propertyData.media.virtualTour instanceof File) {
        formData.append("virtualTour", propertyData.media.virtualTour);
      }
      if (propertyData.media.sitePlanImage instanceof File) {
        formData.append("sitePlanImage", propertyData.media.sitePlanImage);
      }
      if (propertyData.media.masterPlanImage instanceof File) {
        formData.append("masterPlanImage", propertyData.media.masterPlanImage);
      }
      if (propertyData.media.videoLink) {
        formData.append("media[videoLink]", propertyData.media.videoLink);
      }
    }

    if (propertyData.location) {
      Object.entries(propertyData.location).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`location[${key}]`, value);
        }
      });
    }

    if (propertyData.details) {
      Object.entries(propertyData.details).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(`details[${key}]`, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(`details[${key}]`, value);
        }
      });
    }

    if (
      propertyData.amenities !== undefined &&
      propertyData.amenities !== null
    ) {
      if (Array.isArray(propertyData.amenities)) {
        formData.append("amenities", JSON.stringify(propertyData.amenities));
      } else {
        formData.append("amenities", propertyData.amenities);
      }
    }

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${FRONTEND_API_BASE_URL}/frontend/api/property`,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};

// create property by admin
export const createPropertyByAdmin = async (propertyData, token) => {
  try {
    const formData = new FormData();
    appendFloorPlanData(formData, propertyData);

    if (propertyData.personalDetails) {
      Object.entries(propertyData.personalDetails).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`personalDetails[${key}]`, value);
        }
      });
    }

    if (propertyData.description) {
      Object.entries(propertyData.description).forEach(([key, value]) => {
        if (key === "floorPlans") return;
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`description[${key}][${index}]`, item);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(`description[${key}]`, value);
        }
      });
    }

    if (propertyData.media) {
      if (Array.isArray(propertyData.media.images)) {
        propertyData.media.images.forEach((file) => {
          if (file instanceof File) {
            formData.append("images", file);
          }
        });
      }
      if (propertyData.media.virtualTour instanceof File) {
        formData.append("virtualTour", propertyData.media.virtualTour);
      }
      if (propertyData.media.sitePlanImage instanceof File) {
        formData.append("sitePlanImage", propertyData.media.sitePlanImage);
      }
      if (propertyData.media.masterPlanImage instanceof File) {
        formData.append("masterPlanImage", propertyData.media.masterPlanImage);
      }
      if (propertyData.media.videoLink) {
        formData.append("media[videoLink]", propertyData.media.videoLink);
      }
    }

    if (propertyData.location) {
      Object.entries(propertyData.location).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`location[${key}]`, value);
        }
      });
    }

    if (propertyData.details) {
      Object.entries(propertyData.details).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(`details[${key}]`, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(`details[${key}]`, value);
        }
      });
    }

    if (
      propertyData.amenities !== undefined &&
      propertyData.amenities !== null
    ) {
      if (Array.isArray(propertyData.amenities)) {
        formData.append("amenities", JSON.stringify(propertyData.amenities));
      } else {
        formData.append("amenities", propertyData.amenities);
      }
    }

    if (Array.isArray(propertyData.assignedAgent)) {
      const agentIds = propertyData.assignedAgent.filter(Boolean);
      if (agentIds.length) {
        formData.append("assignedAgent", agentIds.join(","));
      }
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/property/admin`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating property by admin:", error);
    throw error.response?.data || error;
  }
};

// update property by admin
export const updatePropertyByAdmin = async (id, propertyData, token) => {
  try {
    const formData = new FormData();
    appendFloorPlanData(formData, propertyData);

    if (propertyData.personalDetails) {
      Object.entries(propertyData.personalDetails).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`personalDetails[${key}]`, value);
        }
      });
    }

    if (propertyData.description) {
      Object.entries(propertyData.description).forEach(([key, value]) => {
        if (key === "floorPlans") return;
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`description[${key}][${index}]`, item);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(`description[${key}]`, value);
        }
      });
    }

    if (propertyData.media) {
      if (
        propertyData.media.images &&
        Array.isArray(propertyData.media.images)
      ) {
        const existingImageUrls = propertyData.media.images
          .filter((img) => typeof img === "string")
          .map((img) => img.trim())
          .filter((img) => img.length > 0);

        formData.append("existingImages", JSON.stringify(existingImageUrls));
        console.log(
          "UpdatePropertyByAdmin - sending existingImages:",
          existingImageUrls
        );

        const newImageFiles = propertyData.media.images.filter(
          (img) => img instanceof File
        );
        newImageFiles.forEach((image) => {
          formData.append("images", image);
        });
        console.log(
          "UpdatePropertyByAdmin - sending new image files:",
          newImageFiles.length
        );
      } else {
        formData.append("existingImages", JSON.stringify([]));
        console.log(
          "UpdatePropertyByAdmin - sending empty existingImages array"
        );
      }

      if (propertyData.media.virtualTour instanceof File) {
        formData.append("virtualTour", propertyData.media.virtualTour);
      } else if (
        typeof propertyData.media.virtualTour === "string" &&
        propertyData.media.virtualTour.trim()
      ) {
        formData.append("existingVirtualTour", propertyData.media.virtualTour);
      } else {
        formData.append("existingVirtualTour", "");
      }

      if (propertyData.media.sitePlanImage instanceof File) {
        formData.append("sitePlanImage", propertyData.media.sitePlanImage);
      } else if (
        typeof propertyData.media.sitePlanImage === "string" &&
        propertyData.media.sitePlanImage.trim()
      ) {
        formData.append(
          "existingSitePlanImage",
          propertyData.media.sitePlanImage
        );
      } else {
        formData.append("existingSitePlanImage", "");
      }
      if (propertyData.media.masterPlanImage instanceof File) {
        formData.append("masterPlanImage", propertyData.media.masterPlanImage);
      } else if (
        typeof propertyData.media.masterPlanImage === "string" &&
        propertyData.media.masterPlanImage.trim()
      ) {
        formData.append(
          "existingMasterPlanImage",
          propertyData.media.masterPlanImage
        );
      } else {
        formData.append("existingMasterPlanImage", "");
      }

      if (propertyData.media.videoLink) {
        formData.append("media[videoLink]", propertyData.media.videoLink);
      }
    }

    if (propertyData.location) {
      Object.entries(propertyData.location).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`location[${key}]`, value);
        }
      });
    }

    if (propertyData.details) {
      Object.entries(propertyData.details).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(`details[${key}]`, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(`details[${key}]`, value);
        }
      });
    }

    if (
      propertyData.amenities !== undefined &&
      propertyData.amenities !== null
    ) {
      if (Array.isArray(propertyData.amenities)) {
        formData.append("amenities", JSON.stringify(propertyData.amenities));
      } else {
        formData.append("amenities", propertyData.amenities);
      }
    }

    if (Array.isArray(propertyData.assignedAgent)) {
      propertyData.assignedAgent.forEach((agentId) => {
        formData.append("assignedAgent", agentId);
      });
    } else if (propertyData.assignedAgent) {
      formData.append("assignedAgent", propertyData.assignedAgent);
    }

    if (propertyData.status) {
      formData.append("status", propertyData.status);
    }

    if (propertyData.rejectionReason !== undefined) {
      formData.append("rejectionReason", propertyData.rejectionReason || "");
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/property/admin/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating property by admin:", error);
    throw error.response?.data || error;
  }
};

// delete property by admin
export const deletePropertyByAdmin = async (id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/property/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting property by admin:", error);
    throw error.response?.data || error;
  }
};

// get properties by category
export const getPropertiesByCategory = async (categoryName, limit = 10) => {
  try {
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/properties/category/${categoryName}?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch properties by category",
      }
    );
  }
};

// get properties by builder id or slug
export const getPropertiesByBuilderFrontend = async (builderId) => {
  try {
    if (!builderId) {
      throw new Error("Builder ID is required");
    }

    const encodedBuilderId = encodeURIComponent(builderId);
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/properties/builder/${encodedBuilderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching properties by builder:", error);
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch properties by builder",
      }
    );
  }
};

// get single property by slug
export const getPropertyByIdFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/properties/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property details",
      }
    );
  }
};

// get all featured properties
export const getFeaturedProperties = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const url = `${FRONTEND_API_BASE_URL}/frontend/api/properties/featured${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    throw error;
  }
};

// get all properties (public frontend endpoint)
export const getAllPropertiesFrontend = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    const queryString = queryParams.toString();

    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/properties/all${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all frontend properties:", error);
    throw error;
  }
};

// get properties with filters
export const getPropertiesWithFilters = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.search) params.append("search", filters.search);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.category) params.append("category", filters.category);
    if (filters.propertyType) {
      if (Array.isArray(filters.propertyType)) {
        params.append("propertyType", filters.propertyType.join(","));
      } else {
        params.append("propertyType", filters.propertyType);
      }
    }
    if (filters.city && filters.city !== "All Cities") {
      params.append("city", filters.city);
    }
    if (filters.area && String(filters.area).trim()) {
      params.append("area", String(filters.area).trim());
    }
    if (filters.state) params.append("state", filters.state);
    if (filters.priceCategory)
      params.append("priceCategory", filters.priceCategory);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minBedrooms) params.append("minBedrooms", filters.minBedrooms);
    if (filters.minBathrooms)
      params.append("minBathrooms", filters.minBathrooms);
    if (filters.minSize) params.append("minSize", filters.minSize);
    if (filters.maxSize) params.append("maxSize", filters.maxSize);
    if (filters.minYearBuilt)
      params.append("minYearBuilt", filters.minYearBuilt);
    if (filters.maxYearBuilt)
      params.append("maxYearBuilt", filters.maxYearBuilt);
    if (filters.listingStatus && filters.listingStatus !== "All") {
      params.append("listingStatus", filters.listingStatus);
    }
    if (filters.propertyStatus && filters.propertyStatus !== "All") {
      params.append("propertyStatus", filters.propertyStatus);
    }
    if (filters.furnishingStatus && filters.furnishingStatus !== "All") {
      params.append("furnishingStatus", filters.furnishingStatus);
    }
    if (filters.ownershipType && filters.ownershipType !== "All") {
      params.append("ownershipType", filters.ownershipType);
    }
    if (filters.shellStatus && filters.shellStatus !== "All") {
      params.append("shellStatus", filters.shellStatus);
    }
    if (filters.facing && filters.facing !== "All") {
      params.append("facing", filters.facing);
    }
    if (filters.minPlotSize) params.append("minPlotSize", filters.minPlotSize);
    if (filters.maxPlotSize) params.append("maxPlotSize", filters.maxPlotSize);
    if (filters.minTotalArea)
      params.append("minTotalArea", filters.minTotalArea);
    if (filters.maxTotalArea)
      params.append("maxTotalArea", filters.maxTotalArea);
    if (filters.buildingStatus && filters.buildingStatus !== "All") {
      params.append("buildingStatus", filters.buildingStatus);
    }
    if (filters.assignedAgent)
      params.append("assignedAgent", filters.assignedAgent);
    if (filters.sort) params.append("sort", filters.sort);

    const queryString = params.toString();
    const url = `${FRONTEND_API_BASE_URL}/frontend/api/properties${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url, { headers: getFrontendApiHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error fetching properties with filters:", error);
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch properties",
      }
    );
  }
};

// get property list trends for frontend market trend cards
export const getPropertyListTrendsFrontend = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.propertytypeid) queryParams.append("propertytypeid", params.propertytypeid);
    if (params.categoriesid) queryParams.append("categoriesid", params.categoriesid);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    const url = `${FRONTEND_API_BASE_URL}/frontend/api/properties/propertylisttrends${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching property list trends:", error);
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property list trends",
      }
    );
  }
};

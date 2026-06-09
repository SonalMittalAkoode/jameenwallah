import axios from "axios";
import { getAdminApiBaseUrl, getApiBaseUrl } from "@/api/apiBase";

const dynamicBase = (resolveBaseUrl) => ({
  toString: resolveBaseUrl,
  valueOf: resolveBaseUrl,
  [Symbol.toPrimitive]: resolveBaseUrl,
});

const API_BASE_URL = dynamicBase(() => getAdminApiBaseUrl("http://localhost:5001/admin"));
const FRONTEND_API_BASE_URL = dynamicBase(() => getApiBaseUrl("http://localhost:5001"));

// build form data
const buildFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined || value === "") {
      return;
    }

    if (key === "image" && value) {
      if (value instanceof File) {
        formData.append("image", value);
      }
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

// create area
export const createArea = async (areaData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/area`,
      buildFormData(areaData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to create area";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// get all areas
export const getAllAreas = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/area`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch areas",
      }
    );
  }
};

// get area by id
export const getAreaById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/area/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch area details",
      }
    );
  }
};

// update area
export const updateArea = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/area/${id}`,
      buildFormData(updatedData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to update area";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// delete area
export const deleteArea = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/area/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to delete area",
      }
    );
  }
};

// get areas by city id
export const getAreasByCityId = async (cityId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/area/city/${cityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch areas for city",
      }
    );
  }
};

// get all active areas (public frontend endpoint)
export const getAllAreasFrontend = async () => {
  try {
    const response = await axios.get(`${FRONTEND_API_BASE_URL}/frontend/api/areas`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch areas",
      }
    );
  }
};

// get areas by city id (public frontend endpoint)
export const getAreasByCityIdFrontend = async (cityId) => {
  try {
    if (!cityId) {
      throw {
        status: "error",
        message: "City ID is required",
        code: 400,
      };
    }
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/areas/city/${cityId}`
    );
    return response.data;
  } catch (error) {
    // If error.response exists, use its data, otherwise create a proper error object
    if (error.response) {
      const errorData = error.response.data || {};
      throw {
        status: errorData.status || "error",
        message: errorData.message || error.message || "Failed to fetch areas for city",
        code: error.response.status || errorData.code || 500,
        ...errorData,
      };
    }
    // For network errors or other non-HTTP errors
    throw {
      status: "error",
      message: error.message || "Failed to fetch areas for city",
      code: error.code || 500,
    };
  }
};

// get area by id (public frontend endpoint)
export const getAreaByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/areas/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch area details",
      }
    );
  }
};

// get trending areas by city name (public frontend endpoint)
export const getTrendingAreasByCityNameFrontend = async (cityName) => {
  try {
    if (!cityName) {
      throw {
        status: "error",
        message: "City name is required",
        code: 400,
      };
    }
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/areas/trending/${encodeURIComponent(cityName)}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data || {};
      throw {
        status: errorData.status || "error",
        message: errorData.message || error.message || "Failed to fetch trending areas",
        code: error.response.status || errorData.code || 500,
        ...errorData,
      };
    }
    throw {
      status: "error",
      message: error.message || "Failed to fetch trending areas",
      code: error.code || 500,
    };
  }
};

// get all trending areas list (public frontend endpoint)
export const getTrendingAreasListFrontend = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/areas/trendinglist${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data || {};
      throw {
        status: errorData.status || "error",
        message:
          errorData.message || error.message || "Failed to fetch trending areas",
        code: error.response.status || errorData.code || 500,
        ...errorData,
      };
    }
    throw {
      status: "error",
      message: error.message || "Failed to fetch trending areas",
      code: error.code || 500,
    };
  }
};


// get area by slug
export const getAreaBySlug = async (slug) => {
  try {
    const response = await axios.get(
      `${FRONTEND_API_BASE_URL}/frontend/api/areas/slug/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch area",
      }
    );
  }
};

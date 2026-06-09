import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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

// create city
export const createCity = async (cityData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/city`,
      buildFormData(cityData),
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
      error.response?.data?.message || error.message || "Failed to create city";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// get all cities
export const getAllCities = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/city`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch cities",
      }
    );
  }
};

// get cities by state id
export const getCitiesByStateId = async (stateId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/city/state/${stateId}`,
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
        message: "Failed to fetch cities for state",
      }
    );
  }
};

// get city by id
export const getCityById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/city/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch city details",
      }
    );
  }
};

// update city
export const updateCity = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/city/${id}`,
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
      error.response?.data?.message || error.message || "Failed to update city";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// delete city
export const deleteCity = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/city/${id}`,
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
        message: "Failed to delete city",
      }
    );
  }
};

// get cities with property counts
export const getCitiesWithPropertyCounts = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/cities-with-properties`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch cities with property counts",
      }
    );
  }
};

// get all active cities (public frontend endpoint)
export const getAllCitiesFrontend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frontend/api/cities`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch cities",
      }
    );
  }
};

// get cities by state id (public frontend endpoint)
export const getCitiesByStateIdFrontend = async (stateId) => {
  try {
    if (!stateId) {
      throw {
        status: "error",
        message: "State ID is required",
        code: 400,
      };
    }
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/cities/state/${stateId}`
    );
    return response.data;
  } catch (error) {
    // If error.response exists, use its data, otherwise create a proper error object
    if (error.response) {
      const errorData = error.response.data || {};
      throw {
        status: errorData.status || "error",
        message: errorData.message || error.message || "Failed to fetch cities for state",
        code: error.response.status || errorData.code || 500,
        ...errorData,
      };
    }
    // For network errors or other non-HTTP errors
    throw {
      status: "error",
      message: error.message || "Failed to fetch cities for state",
      code: error.code || 500,
    };
  }
};

// get city by id (public frontend endpoint)
export const getCityByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/cities/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch city details",
      }
    );
  }
};

// get city by name (public frontend endpoint)
export const getCityByName = async (name) => {
  try {
    const urlName = String(name || "")
      .trim()
      .replace(/\s+/g, "-");

    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/cities/name/${urlName}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch city",
      }
    );
  }
};

// get cities with property pages (public frontend endpoint)
export const getCityWithPropertyPageFrontend = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/city/citywithpropertypage`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch city property pages",
      }
    );
  }
};
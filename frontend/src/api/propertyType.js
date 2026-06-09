import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create property type
export const createPropertyType = async (propertyTypeData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/property-type`,
      propertyTypeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create property type",
      }
    );
  }
};

// get all property types
export const getAllPropertyTypes = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/property-type`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property types",
      }
    );
  }
};

// get property type by id
export const getPropertyTypeById = async (id, token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/property-type/single/${id}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data || {};
      throw {
        status: errorData.status || "error",
        message:
          errorData.message ||
          error.response.statusText ||
          "Failed to fetch property type details",
        code: errorData.code || error.response.status,
      };
    } else if (error.request) {
      throw {
        status: "error",
        message: "Network error: Unable to connect to the server",
      };
    } else {
      throw {
        status: "error",
        message: error.message || "Failed to fetch property type details",
      };
    }
  }
};

// get property types by category id
export const getPropertyTypesByCategoryId = async (categoryId, token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/property-type/category/${categoryId}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property types by category",
      }
    );
  }
};

// update property type
export const updatePropertyType = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/property-type/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to update property type",
      }
    );
  }
};

// delete property type
export const deletePropertyType = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/property-type/${id}`,
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
        message: "Failed to delete property type",
      }
    );
  }
};

// get property types by category id or name
export const getPropertyTypesByCategory = async (categoryIdOrName) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/property-types/category/${categoryIdOrName}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property types by category",
      }
    );
  }
};

// get all active property types
export const getAllPropertyTypesFrontend = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/property-types`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch all property types",
      }
    );
  }
};

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create propertyPage
export const createPropertyPage = async (propertyPageData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/property-page`,
      propertyPageData,
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
        message: "Failed to create Property Page",
      }
    );
  }
};

// get all propertyPages
export const getAllPropertyPages = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/property-page`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch Property Page",
      }
    );
  }
};

// get property Page by id
export const getPropertyPageById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/property-page/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property Page details",
      }
    );
  }
};

// update property Page
export const updatePropertyPage = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/property-page/${id}`,
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
        message: "Failed to update Property Page",
      }
    );
  }
};

// delete property Page
export const deletePropertyPage = async (id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/property-page/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to delete property Page",
      }
    );
  }
};

// get limited property Pages
export const getLimitedPropertyPages = async (limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/property-page?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property Page",
      }
    );
  }
};

// get property Pages by property ID
export const getPropertyPagesByProperty = async (propertyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/property-page/property/${propertyId}`
    );
    return response.data;
  } catch (error) {
    // Handle different error scenarios - always return a response object, never throw
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        // No propertyPage found - return empty array instead of error
        return {
          status: "success",
          message: "No propertyPage found",
          data: [],
          count: 0,
        };
      }
      // Return error response from server
      return error.response.data || {
        status: "success",
        message: "No propertyPage found",
        data: [],
        count: 0,
      };
    } else if (error.request) {
      // Request made but no response - network error
      return {
        status: "success",
        message: "No propertyPage found",
        data: [],
        count: 0,
      };
    } else {
      // Something else happened - return empty array to prevent errors
      return {
        status: "success",
        message: "No propertyPage found",
        data: [],
        count: 0,
      };
    }
  }
};

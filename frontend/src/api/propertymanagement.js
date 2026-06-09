import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const getFrontendApiHeaders = () => {
  const apiKey =
    process.env.NEXT_PUBLIC_END_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
  return apiKey ? { "x-api-key": apiKey } : {};
};

// create propertymanagement
export const createPropertymanagement = async (propertymanagementData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(propertymanagementData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/propertymanagement`,
      propertymanagementData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create propertymanagement",
      }
    );
  }
};

// get all propertymanagements
export const getAllPropertymanagements = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/propertymanagement`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch propertymanagements",
      }
    );
  }
};

// get propertymanagement by id
export const getPropertymanagementById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/propertymanagement/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch propertymanagement details",
      }
    );
  }
};

// update propertymanagement
export const updatePropertymanagement = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/propertymanagement/${id}`,
      updatedData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to update propertymanagement",
      }
    );
  }
};

// delete propertymanagement
export const deletePropertymanagement = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/propertymanagement/${id}`,
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
        message: "Failed to delete propertymanagement",
      }
    );
  }
};

/** Public list — GET /frontend/api/propertymanagement (PMS listing page nav pills). */
export const getAllPropertymanagementsFrontend = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/propertymanagement`,
      { headers: getFrontendApiHeaders() }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch property management services",
      }
    );
  }
};

// get propertymanagement by id or slug for frontend
export const getPropertymanagementByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/propertymanagement/${encodeURIComponent(id)}`,
      { headers: getFrontendApiHeaders() }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch propertymanagement details",
      }
    );
  }
};

// get propertymanagement by slug for frontend
export const getPropertymanagementBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/propertymanagement/${encodeURIComponent(slug)}`,
      { headers: getFrontendApiHeaders() }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch propertymanagement details",
      }
    );
  }
};

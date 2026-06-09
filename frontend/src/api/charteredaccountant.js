import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create charteredaccountant
export const createCharteredaccountant = async (charteredaccountantData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(charteredaccountantData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/charteredaccountant`,
      charteredaccountantData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create charteredaccountant",
      }
    );
  }
};

// get all charteredaccountants
export const getAllCharteredaccountants = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/charteredaccountant`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch charteredaccountants",
      }
    );
  }
};

// get charteredaccountant by id
export const getCharteredaccountantById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/charteredaccountant/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch charteredaccountant details",
      }
    );
  }
};

// update charteredaccountant
export const updateCharteredaccountant = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/charteredaccountant/${id}`,
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
        message: "Failed to update charteredaccountant",
      }
    );
  }
};

// delete charteredaccountant
export const deleteCharteredaccountant = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/charteredaccountant/${id}`,
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
        message: "Failed to delete charteredaccountant",
      }
    );
  }
};

// get charteredaccountant by id or slug for frontend
export const getCharteredaccountantByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/charteredaccountant/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch charteredaccountant details",
      }
    );
  }
};

// get charteredaccountant by slug for frontend
export const getCharteredaccountantBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/charteredaccountant/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch charteredaccountant details",
      }
    );
  }
};

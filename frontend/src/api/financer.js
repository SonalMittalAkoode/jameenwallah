import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create financer
export const createFinancer = async (financerData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(financerData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/financer`,
      financerData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create financer",
      }
    );
  }
};

// get all financers
export const getAllFinancers = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/financer`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch financers",
      }
    );
  }
};

// get financer by id
export const getFinancerById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/financer/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch financer details",
      }
    );
  }
};

// update financer
export const updateFinancer = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/financer/${id}`,
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
        message: "Failed to update financer",
      }
    );
  }
};

// delete financer
export const deleteFinancer = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/financer/${id}`,
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
        message: "Failed to delete financer",
      }
    );
  }
};

// get financer by id or slug for frontend
export const getFinancerByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/financer/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch financer details",
      }
    );
  }
};

// get financer by slug for frontend
export const getFinancerBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/financer/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch financer details",
      }
    );
  }
};

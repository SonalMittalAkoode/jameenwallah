import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create state
export const createState = async (stateData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/state`,
      stateData,
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
        message: "Failed to create state",
      }
    );
  }
};

// get all states
export const getAllStates = async (token, params = {}) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = { headers };

    if (params && Object.keys(params).length > 0) {
      config.params = params;
    }

    const response = await axios.get(`${API_BASE_URL}/admin/api/state`, config);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch states",
      }
    );
  }
};

// get state by id
export const getStateById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/state/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch state details",
      }
    );
  }
};

// update state
export const updateState = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/state/${id}`,
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
        message: "Failed to update state",
      }
    );
  }
};

// delete state by id
export const deleteState = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/state/${id}`,
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
        message: "Failed to delete state",
      }
    );
  }
};

// get all active states (public frontend endpoint)
export const getAllStatesFrontend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frontend/api/states`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch states",
      }
    );
  }
};

// get state by id (public frontend endpoint)
export const getStateByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/states/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch state details",
      }
    );
  }
};
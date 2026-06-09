import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create lawyer
export const createLawyer = async (lawyerData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(lawyerData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/lawyer`,
      lawyerData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create lawyer",
      }
    );
  }
};

// get all lawyers
export const getAllLawyers = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/lawyer`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch lawyers",
      }
    );
  }
};

// get lawyer by id
export const getLawyerById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/lawyer/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch lawyer details",
      }
    );
  }
};

// update lawyer
export const updateLawyer = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/lawyer/${id}`,
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
        message: "Failed to update lawyer",
      }
    );
  }
};

// delete lawyer
export const deleteLawyer = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/lawyer/${id}`,
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
        message: "Failed to delete lawyer",
      }
    );
  }
};

// get lawyer by id or slug for frontend
export const getLawyerByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/lawyer/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch lawyer details",
      }
    );
  }
};

// get lawyer by slug for frontend
export const getLawyerBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/lawyer/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch lawyer details",
      }
    );
  }
};

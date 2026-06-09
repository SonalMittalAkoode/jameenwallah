import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create partner
export const createArchitect = async (partnerData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(partnerData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/partner`,
      partnerData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create partner",
      }
    );
  }
};

// get all partners
export const getAllArchitects = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/partner`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch partners",
      }
    );
  }
};

// get partner by id
export const getArchitectById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/partner/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch partner details",
      }
    );
  }
};

// update partner
export const updateArchitect = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/partner/${id}`,
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
        message: "Failed to update partner",
      }
    );
  }
};

// delete partner
export const deleteArchitect = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/partner/${id}`,
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
        message: "Failed to delete partner",
      }
    );
  }
};

// get partner by id or slug for frontend
export const getArchitectByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/partner/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch partner details",
      }
    );
  }
};

// get partner by slug for frontend
export const getArchitectBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/partner/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch partner details",
      }
    );
  }
};

// Backward-compatible aliases used by the admin partner pages.
export const createPartner = createArchitect;
export const getPartnerById = getArchitectById;
export const updatePartner = updateArchitect;
export const deletePartner = deleteArchitect;
export const getAllPartners = getAllArchitects;

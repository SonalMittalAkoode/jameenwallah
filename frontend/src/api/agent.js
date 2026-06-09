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

/** Public listing — GET /frontend/api/agent */
export const getAllAgentsFrontend = async () => {
  const response = await axios.get(`${API_BASE_URL}/frontend/api/agent`, {
    headers: getFrontendApiHeaders(),
  });
  return response.data;
};

// create agent
export const createAgent = async (agentData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(agentData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/agent`,
      agentData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create agent",
      }
    );
  }
};

// get all agents
export const getAllAgents = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/agent`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch agents",
      }
    );
  }
};

// get agent by id
export const getAgentById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/agent/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch agent details",
      }
    );
  }
};

// update agent
export const updateAgent = async (id, updatedData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (!(updatedData instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/agent/${id}`,
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
        message: "Failed to update agent",
      }
    );
  }
};

// delete agent
export const deleteAgent = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/agent/${id}`,
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
        message: "Failed to delete agent",
      }
    );
  }
};

// get agent by id or slug for frontend
export const getAgentByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/agent/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch agent details",
      }
    );
  }
};

// get agent by slug for frontend
export const getAgentBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/agent/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch agent details",
      }
    );
  }
};

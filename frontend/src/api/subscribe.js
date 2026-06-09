import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// get all subscribers
export const getSubscribers = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/subscribe`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch subscribers";
    throw new Error(message);
  }
};

// update subscriber
export const updateSubscriber = async (id, isActive, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/subscribe/${id}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to update subscriber";
    throw new Error(message);
  }
};

// subscribe to newsletter (frontend)
export const subscribeToNewsletter = async (email) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/subscribe`,
      { email },
      {
        headers: (() => {
          // If backend requires an API key, send it as `x-api-key`.
          const apiKey =
            process.env.NEXT_PUBLIC_END_API_KEY ||
            process.env.NEXT_PUBLIC_API_KEY ||
            "";
          return apiKey ? { "x-api-key": apiKey } : {};
        })(),
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to subscribe";
    throw new Error(message);
  }
};

// delete subscriber
export const deleteSubscriber = async (id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/subscribe/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message ||
      "Failed to delete subscriber";
    throw new Error(message);
  }
};
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// get dashboard counts
export const getDashboardCounts = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/dashboard/counts`,
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
      "Failed to fetch dashboard counts";

    throw new Error(message);
  }
};

// get property type analytics
export const getPropertyTypeAnalytics = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/dashboard/property-type-analytics`,
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
      "Failed to fetch property type analytics";

    throw new Error(message);
  }
};

// get city level property analytics
export const getCityLevelAnalytics = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/dashboard/city-level-analytics`,
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
      "Failed to fetch city-level analytics";

    throw new Error(message);
  }
};

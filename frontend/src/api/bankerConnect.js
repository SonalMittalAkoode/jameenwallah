import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create banker connect request
export const createBankerConnect = async (bankerConnectData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/banker-connect`,
      bankerConnectData
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit banker connect request";

    throw new Error(message);
  }
};

// get all banker connect enquiries
export const getBankerConnects = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/banker-connect`,
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
      "Failed to fetch banker connect enquiries";

    throw new Error(message);
  }
};

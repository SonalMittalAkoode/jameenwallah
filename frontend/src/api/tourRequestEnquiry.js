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

// get all tour request enquiries
export const getTourRequestEnquiries = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/tour-request-enquiry`,
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
      "Failed to fetch tour request enquiries";

    throw new Error(message);
  }
};

// create tour request enquiry
export const createTourRequestEnquiry = async (enquiryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/tour-request-enquiry`,
      enquiryData,
      {
        headers: {
          "Content-Type": "application/json",
          ...getFrontendApiHeaders(),
        },
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit tour request enquiry";

    throw new Error(message);
  }
};

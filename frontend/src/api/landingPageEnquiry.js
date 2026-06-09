import axios from "axios";
import { getApiBaseUrl } from "@/api/apiBase";

const API_BASE_URL = getApiBaseUrl("http://localhost:5001");

// create landing page enquiry
export const createLandingPageEnquiry = async (enquiryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/landing-page-enquiry`,
      enquiryData
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit enquiry";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// get all landing page enquiries
export const getLandingPageEnquiries = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/landing-page-enquiry`,
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
      "Failed to fetch landing page enquiries";

    throw new Error(message);
  }
};

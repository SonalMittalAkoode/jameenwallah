import axios from "axios";
import { getApiBaseUrl } from "@/api/apiBase";

const API_BASE_URL = getApiBaseUrl("http://localhost:5001");

// get enquiries
export const getEnquiries = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/enquiry`, {
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
      "Failed to fetch enquiries";

    throw new Error(message);
  }
};

// get enquiry analytics
export const getEnquiryAnalytics = async (token) => {
  try {
    const url = `${API_BASE_URL}/admin/api/enquiry/analytics`;
    console.log("Fetching analytics from:", url);
    
    const response = await axios.get(url, {
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
      "Failed to fetch enquiry analytics";

    throw new Error(message);
  }
};

// create enquiry
export const createEnquiryFrontend = async (enquiryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/enquiry`,
      enquiryData
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit enquiry";

    throw new Error(message);
  }
};

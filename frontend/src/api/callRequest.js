import axios from "axios";
import { getAdminApiBaseUrl, getApiBaseUrl } from "@/api/apiBase";

const SERVICE_OPTIONS = [
  "Buy Property",
  "Sell Property",
  "Investment Advisory",
  "Legal Services",
  "Financial Services",
  "Architecture & Design",
  "Chartered Accountant",
  "Property Management",
  "Become a Partner",
  "General Consultation",
];

export const callRequestServiceOptions = SERVICE_OPTIONS;

export const createCallRequestFrontend = async (payload) => {
  try {
    const response = await axios.post(
      `${getApiBaseUrl("http://localhost:5001")}/frontend/api/call-request`,
      payload
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit call request";
    throw new Error(message);
  }
};

export const getCallRequests = async (token) => {
  try {
    const response = await axios.get(
      `${getAdminApiBaseUrl("http://localhost:5001/admin")}/api/call-request`,
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
      "Failed to fetch call requests";
    throw new Error(message);
  }
};

export const updateCallRequest = async (token, id, payload) => {
  try {
    const response = await axios.put(
      `${getAdminApiBaseUrl("http://localhost:5001/admin")}/api/call-request/${id}`,
      payload,
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
      "Failed to update call request";
    throw new Error(message);
  }
};

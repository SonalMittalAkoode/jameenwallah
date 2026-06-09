import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// get all agent contact enquiries
export const getAgentContactEnquiries = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/agent-contact-enquiry`,
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
      "Failed to fetch agent contact enquiries";

    throw new Error(message);
  }
};

// create agent contact enquiry
export const createAgentContactEnquiry = async (enquiryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/frontend/api/agent-contact-enquiry`,
      enquiryData
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to submit agent contact enquiry";

    throw new Error(message);
  }
};

import axios from "axios";
import { getAdminApiBaseUrl } from "@/api/apiBase";

export const getConsultancyEnquiries = async (token) => {
  try {
    const response = await axios.get(
      `${getAdminApiBaseUrl("http://localhost:5001/admin")}/api/consultancy-enquiry`,
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
      "Failed to fetch service enquiries";
    throw new Error(message);
  }
};

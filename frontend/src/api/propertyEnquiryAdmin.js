import axios from "axios";
import { getAdminApiBaseUrl } from "@/api/apiBase";

export const getPropertyEnquiries = async (token) => {
  try {
    const response = await axios.get(
      `${getAdminApiBaseUrl("http://localhost:5001/admin")}/api/property-enquiry`,
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
        message: "Failed to fetch property enquiries",
      }
    );
  }
};

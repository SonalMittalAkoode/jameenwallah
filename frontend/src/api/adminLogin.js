import axios from "axios";
import { getAdminApiBaseUrl } from "./apiBase";

const ADMIN_API_URL = getAdminApiBaseUrl("http://localhost:5001/admin");

// admin login
export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${ADMIN_API_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  }
};

// admin logout
export const adminLogout = async (token) => {
  try {
    const response = await axios.post(
      `${ADMIN_API_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Logout failed");
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  }
};

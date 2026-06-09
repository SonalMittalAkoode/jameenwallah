import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

// Create axios instance for admin API calls
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Function to handle token expiration
const handleTokenExpiration = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
    
    // Only redirect if not already on login page
    const currentPath = window.location.pathname;
    if (currentPath !== "/cmsadminlogin" && !currentPath.endsWith("/cmsadminlogin")) {
      window.location.href = "/cmsadminlogin";
    }
  }
};

// Request interceptor to add token to all admin requests
adminAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
adminAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) or 403 (Forbidden) errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || "";

      // Check if token is expired or invalid
      if (
        status === 401 ||
        status === 403 ||
        message.toLowerCase().includes("token expired") ||
        message.toLowerCase().includes("authorized token expired") ||
        message.toLowerCase().includes("please login again")
      ) {
        handleTokenExpiration();
      }
    }

    return Promise.reject(error);
  }
);

// Set up global axios interceptor for admin pages
// This will catch errors from any axios call made in admin context
let globalInterceptorId = null;

export const setupGlobalAxiosInterceptor = () => {
  // Remove existing interceptor if any
  if (globalInterceptorId !== null) {
    axios.interceptors.response.eject(globalInterceptorId);
  }

  // Add global response interceptor
  globalInterceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only handle errors in admin context
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes("/cmsadminlogin");

        if (isAdminPage && error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error || "";

          // Check if token is expired or invalid
          if (
            status === 401 ||
            status === 403 ||
            message.toLowerCase().includes("token expired") ||
            message.toLowerCase().includes("authorized token expired") ||
            message.toLowerCase().includes("please login again")
          ) {
            handleTokenExpiration();
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

export const removeGlobalAxiosInterceptor = () => {
  if (globalInterceptorId !== null) {
    axios.interceptors.response.eject(globalInterceptorId);
    globalInterceptorId = null;
  }
};

// Export the adminAxios instance
export default adminAxios;

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create faq
export const createFAQ = async (faqData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/faq`,
      faqData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to create FAQ",
      }
    );
  }
};

// get all faqs
export const getAllFAQs = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/faq`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch FAQs",
      }
    );
  }
};

// get faq by id
export const getFAQById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/faq/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch FAQ details",
      }
    );
  }
};

// update faq
export const updateFAQ = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/faq/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to update FAQ",
      }
    );
  }
};

// delete faq
export const deleteFAQ = async (id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/api/faq/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to delete FAQ",
      }
    );
  }
};

// get limited faqs
export const getLimitedFAQs = async (limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/faqs?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch FAQs",
      }
    );
  }
};

// get FAQs by property ID
export const getFAQsByProperty = async (propertyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/faqs/property/${propertyId}`
    );
    return response.data;
  } catch (error) {
    // Handle different error scenarios - always return a response object, never throw
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        // No FAQs found - return empty array instead of error
        return {
          status: "success",
          message: "No FAQs found",
          data: [],
          count: 0,
        };
      }
      // Return error response from server
      return error.response.data || {
        status: "success",
        message: "No FAQs found",
        data: [],
        count: 0,
      };
    } else if (error.request) {
      // Request made but no response - network error
      return {
        status: "success",
        message: "No FAQs found",
        data: [],
        count: 0,
      };
    } else {
      // Something else happened - return empty array to prevent errors
      return {
        status: "success",
        message: "No FAQs found",
        data: [],
        count: 0,
      };
    }
  }
};

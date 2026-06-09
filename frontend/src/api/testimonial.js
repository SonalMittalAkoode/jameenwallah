import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create testimonial
export const createTestimonial = async (testimonialData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/testimonial`,
      testimonialData,
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
        message: "Failed to create testimonial",
      }
    );
  }
};

// get all testimonials
export const getAllTestimonials = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/testimonial`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch testimonials",
      }
    );
  }
};

// get testimonial by id
export const getTestimonialById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/testimonial/${id}`,
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
        message: "Failed to fetch testimonial details",
      }
    );
  }
};

// update testimonial
export const updateTestimonial = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/testimonial/${id}`,
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
        message: "Failed to update testimonial",
      }
    );
  }
};

// delete testimonial
export const deleteTestimonial = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/testimonial/${id}`,
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
        message: "Failed to delete testimonial",
      }
    );
  }
};

// get all testimonials
export const getAllTestimonialsFrontend = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/testimonials`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch testimonials",
      }
    );
  }
};

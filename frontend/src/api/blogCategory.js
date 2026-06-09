import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create blog category
export const createBlogCategory = async (categoryData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/blog-category`,
      categoryData,
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
        message: "Failed to create blog category",
      }
    );
  }
};

// get all blog categories
export const getAllBlogCategories = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/blog-category`,
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
        message: "Failed to fetch blog categories",
      }
    );
  }
};

// get blog category by id
export const getBlogCategoryById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/blog-category/${id}`,
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
        message: "Failed to fetch blog category details",
      }
    );
  }
};

// update blog category
export const updateBlogCategory = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/blog-category/${id}`,
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
        message: "Failed to update blog category",
      }
    );
  }
};

// delete blog category
export const deleteBlogCategory = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/blog-category/${id}`,
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
        message: "Failed to delete blog category",
      }
    );
  }
};

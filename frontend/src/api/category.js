import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// create category
export const createCategory = async (categoryData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/category`,
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
        message: "Failed to create category",
      }
    );
  }
};

// get all categories
export const getAllCategories = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/category`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch categories",
      }
    );
  }
};

// get category by id
export const getCategoryById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/category/${id}`,
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
        message: "Failed to fetch category details",
      }
    );
  }
};

// update category
export const updateCategory = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/category/${id}`,
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
        message: "Failed to update category",
      }
    );
  }
};

// delete category
export const deleteCategory = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/category/${id}`,
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
        message: "Failed to delete category",
      }
    );
  }
};

// get active categories
export const getActiveCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frontend/api/categories`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch active categories",
      }
    );
  }
};

// get category by id
export const getCategoryByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/categories/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch category",
      }
    );
  }
};

// get category by slug
export const getCategoryBySlug = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/categories/slug/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch category",
      }
    );
  }
};

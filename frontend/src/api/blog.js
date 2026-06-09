import axios from "axios";
import { getApiBaseUrl } from "@/api/apiBase";

const API_BASE_URL = {
  toString: () => getApiBaseUrl("http://localhost:5001"),
  valueOf: () => getApiBaseUrl("http://localhost:5001"),
  [Symbol.toPrimitive]: () => getApiBaseUrl("http://localhost:5001"),
};

// create blog
export const createBlog = async (blogData, token) => {
  try {
    const formData = new FormData();

    Object.keys(blogData).forEach((key) => {
      if (key === "image" && blogData[key]) {
        if (blogData[key] instanceof File) {
          formData.append("image", blogData[key]);
        }
      } else if (key === "tags" && Array.isArray(blogData[key])) {
        formData.append(key, blogData[key].join(", "));
      } else if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/admin/api/blog`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to create blog";
    const errorData = error.response?.data || {
      status: "error",
      message: errorMessage,
    };
    console.error("Error creating blog:", error);
    console.error("Error response:", error.response);
    throw errorData;
  }
};

// get all blogs
export const getAllBlogs = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/blog`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blogs",
      }
    );
  }
};

// get blog by id
export const getBlogById = async (id, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/blog/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blog details",
      }
    );
  }
};

// update blog
export const updateBlog = async (id, blogData, token) => {
  try {
    const formData = new FormData();

    Object.keys(blogData).forEach((key) => {
      if (key === "image" && blogData[key]) {
        if (blogData[key] instanceof File) {
          formData.append("image", blogData[key]);
        }
      } else if (key === "tags" && Array.isArray(blogData[key])) {
        formData.append(key, blogData[key].join(", "));
      } else if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });

    const response = await axios.put(
      `${API_BASE_URL}/admin/api/blog/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to update blog";
    const errorData = error.response?.data || {
      status: "error",
      message: errorMessage,
    };
    console.error("Error updating blog:", error);
    console.error("Error response:", error.response);
    throw errorData;
  }
};

// delete blog
export const deleteBlog = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/blog/${id}`,
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
        message: "Failed to delete blog",
      }
    );
  }
};

// get limited blogs
export const getLimitedBlogs = async (limit = 3) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blogs",
      }
    );
  }
};

// get all blogs with pagination
export const getAllBlogsPaginated = async (
  page = 1,
  limit = 10,
  search = "",
  category = "",
  tag = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (category && category.trim()) {
      params.append("category", category.trim());
    }

    if (tag && tag.trim()) {
      params.append("tag", tag.trim());
    }

    const url = `${API_BASE_URL}/frontend/api/blogs/all?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blogs",
      }
    );
  }
};

// get latest blogs
export const getLatestBlogs = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/latest`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch latest blogs",
      }
    );
  }
};

// get popular tags
export const getPopularTags = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/tags/popular`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch popular tags",
      }
    );
  }
};

// get blog categories
export const getBlogCategories = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/categories`
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

// get blog by id
export const getBlogByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blog details",
      }
    );
  }
};

// get blog by slug
export const getBlogBySlugFrontend = async (slug) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/${slug}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch blog details",
      }
    );
  }
};

// get related blogs
export const getRelatedBlogs = async (id, limit = 3) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/blogs/${id}/related?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch related blogs",
      }
    );
  }
};

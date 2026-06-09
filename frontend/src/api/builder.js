import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// build form data
const buildFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined || value === "") {
      return;
    }

    if (key === "image" && value) {
      if (value instanceof File) {
        formData.append("image", value);
      }
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

// create builder
export const createBuilder = async (builderData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/builder`,
      buildFormData(builderData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create builder";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// get all builders
export const getAllBuilders = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/api/builder`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch builders",
      }
    );
  }
};

// get builder by id
export const getBuilderById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/builder/${id}`,
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
        message: "Failed to fetch builder details",
      }
    );
  }
};

// update builder
export const updateBuilder = async (id, builderData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/builder/${id}`,
      buildFormData(builderData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update builder";
    throw {
      status: "error",
      message,
      ...(error.response?.data || {}),
    };
  }
};

// delete builder
export const deleteBuilder = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/builder/${id}`,
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
        message: "Failed to delete builder",
      }
    );
  }
};

// get all builders
export const getAllBuildersFrontend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frontend/api/builders`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch builders",
      }
    );
  }
};

// get single builder by id
export const getBuilderByIdFrontend = async (id) => {
  try {
    if (!id) {
      throw {
        status: "error",
        message: "Builder ID is required",
      };
    }

    const url = `${API_BASE_URL}/frontend/api/builders/${encodeURIComponent(
      id
    )}`;
    console.log("Fetching builder from URL:", url);

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("API Error in getBuilderByIdFrontend:", {
      id,
      url: `${API_BASE_URL}/frontend/api/builders/${id}`,
      error: error?.response?.data || error?.message || error,
      status: error?.response?.status,
    });

    throw (
      error.response?.data || {
        status: "error",
        message: error?.message || "Failed to fetch builder details",
      }
    );
  }
};

import axios from "axios";
import { getApiBaseUrl } from "@/api/apiBase";

const API_BASE_URL = {
  toString: () => getApiBaseUrl("http://localhost:5001"),
  valueOf: () => getApiBaseUrl("http://localhost:5001"),
  [Symbol.toPrimitive]: () => getApiBaseUrl("http://localhost:5001"),
};

// create amenity
export const createAmenity = async (amenityData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/api/amenity`,
      amenityData,
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
        message: "Failed to create amenity",
      }
    );
  }
};

// get all amenities
export const getAllAmenities = async (token) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios.get(`${API_BASE_URL}/admin/api/amenity`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch amenities",
      }
    );
  }
};

// get amenity by id
export const getAmenityById = async (id, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/api/amenity/${id}`,
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
        message: "Failed to fetch amenity details",
      }
    );
  }
};

// update amenity
export const updateAmenity = async (id, updatedData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/api/amenity/${id}`,
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
        message: "Failed to update amenity",
      }
    );
  }
};

// delete amenity
export const deleteAmenity = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/api/amenity/${id}`,
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
        message: "Failed to delete amenity",
      }
    );
  }
};

// get all active amenities (public frontend endpoint)
export const getAllAmenitiesFrontend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frontend/api/amenities`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch amenities",
      }
    );
  }
};

// get amenity by id (public frontend endpoint)
export const getAmenityByIdFrontend = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/amenities/${id}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "error",
        message: "Failed to fetch amenity details",
      }
    );
  }
};

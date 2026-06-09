import axios from "axios";
import { getApiBaseUrl } from "@/api/apiBase";
import { DEFAULT_SITE_CONTENT } from "@/lib/siteContentDefaults";

const API_BASE_URL = {
  toString: () => getApiBaseUrl("http://localhost:5001"),
  valueOf: () => getApiBaseUrl("http://localhost:5001"),
  [Symbol.toPrimitive]: () => getApiBaseUrl("http://localhost:5001"),
};

const getDefaultSiteContent = (pageKey) =>
  DEFAULT_SITE_CONTENT[pageKey] || {
    pageKey,
    title: "JameenWallah",
    metaTitle: "JameenWallah",
    metaDescription:
      "Explore verified real estate opportunities and advisory services with JameenWallah.",
    sections: {},
  };

export const getSiteContentByPageKeyFrontend = async (pageKey) => {
  // Legacy implementation kept for reference:
  // const response = await axios.get(
  //   `${API_BASE_URL}/frontend/api/site-content/${pageKey}`,
  //   {
  //     headers: {
  //       "Cache-Control": "no-cache",
  //       Pragma: "no-cache",
  //     },
  //     params: {
  //       _ts: Date.now(),
  //     },
  //   }
  // );
  // return response.data;

  try {
    const response = await axios.get(
      `${API_BASE_URL}/frontend/api/site-content/${pageKey}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: {
          _ts: Date.now(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.warn(
      `Using default site content for ${pageKey}; frontend site-content API unavailable.`
    );
    return {
      status: "fallback",
      data: getDefaultSiteContent(pageKey),
    };
  }
};

export const getSiteContentByPageKeyAdmin = async (pageKey, token) => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/api/site-content/${pageKey}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateSiteContentByPageKey = async (pageKey, payload, token) => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/api/site-content/${pageKey}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

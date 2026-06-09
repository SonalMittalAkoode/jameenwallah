import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const getFrontendApiHeaders = () => {
  const apiKey =
    process.env.NEXT_PUBLIC_END_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
  return apiKey ? { "x-api-key": apiKey } : {};
};

export const createBecomePartnerEnquiry = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/frontend/api/becomeapartnerenquiry`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        ...getFrontendApiHeaders(),
      },
    }
  );
  return response.data;
};

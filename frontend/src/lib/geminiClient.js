import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;

/**
 * Returns a singleton instance of the Google Generative AI client.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not set or is a placeholder. Please check your .env file.");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Helper to get the model instance.
 */
export function getGeminiModel() {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: "gemini-2.0-flash" });
}

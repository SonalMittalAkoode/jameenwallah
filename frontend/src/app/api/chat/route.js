import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/geminiClient";
import { buildGeminiPrompt } from "@/lib/chatPrompt";
import { validateChatRequest } from "@/lib/chatValidator";
import { extractIntent } from "@/lib/intentExtractor";
import { searchProperties } from "@/lib/propertySearch";

const PYTHON_CHATBOT_URL = process.env.AI_CHATBOT_API_URL || "http://127.0.0.1:8010/chat";

function toPythonChatHistory(history = []) {
  return history.map((message) => ({
    type: message.role === "user" ? "user" : "assistant",
    text: message.content || "",
  }));
}

function getPythonChatSuggestions() {
  return [
    "Best sectors to invest in Gurgaon",
    "Suggest 3 residential properties in Gurgaon",
    "New launches near Dwarka Expressway",
    "Who built this chatbot?",
  ];
}

async function getPythonChatbotResponse(message, history) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  let response;
  try {
    response = await fetch(PYTHON_CHATBOT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: toPythonChatHistory(history),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Python chatbot returned ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.answer) {
    throw new Error("Python chatbot response did not include an answer.");
  }

  return NextResponse.json({
    reply: payload.answer,
    properties: [],
    suggestions: getPythonChatSuggestions(),
    cta: { text: "Contact our Property Experts", href: "/contact" },
    meta: {
      ...(payload.meta || {}),
      engine: "python-crewai-gemini",
      source: "backend/ai-chatbot",
    },
  });
}

/**
 * POST /api/chat
 * Migrated to Google Gemini 1.5 Flash.
 * Handles chat interactions with grounded property data and robust fallbacks.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const validation = validateChatRequest(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { message, history } = validation.data;

    try {
      return await getPythonChatbotResponse(message, history);
    } catch (chatbotError) {
      console.error("Python Chatbot Proxy Error:", chatbotError);
      // Legacy in-route Gemini/Mongo flow is kept below as a fallback when the Python chatbot is unavailable.
    }

    // 1. Detect Intent & Extract Memory
    const { intent, filters, rawFilters } = extractIntent(message, history);

    // 2. Query properties with relaxation support
    const { properties, appliedFilters, isRelaxed, resultConfidence } = await searchProperties(filters);

    // 3. Prepare Gemini Prompt
    const prompt = buildGeminiPrompt(history, message, { properties, intent, isRelaxed });

    // 4. Generate Gemini Response
    let aiResponse;
    try {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      aiResponse = parseJsonResponse(text);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      // Fallback to manual response if API fails
      aiResponse = {
        reply: properties.length
          ? `Here are the most relevant JameenWallah listings I found for ${filters.location || "Gurgaon/NCR"}. You can compare these options by location, configuration, price visibility and buyer fit, then speak with our advisory team for current inventory and site-visit details.`
          : "I can help shortlist Gurgaon/NCR properties by sector, budget, configuration and investment goal. Share your preferred location, property type and budget range so I can narrow the options.",
        properties: [],
        suggestions: ["Best investment projects", "3BHK in Gurgaon", "Ready to move flats"]
      };
    }

    // 5. Generate Dynamic CTA
    const cta = generateCTA(intent);


    // 7. Final Response (Merging DB properties if AI response is empty)
    return NextResponse.json({
      reply: aiResponse.reply,
      properties: (Array.isArray(aiResponse.properties) && aiResponse.properties.length > 0)
        ? aiResponse.properties 
        : properties.map((p, i) => ({ ...p, tag: i === 0 ? "Best Match" : i === 1 ? "Value Deal" : i === 2 ? "Premium Option" : null })),
      suggestions: Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions.slice(0, 5) : [],
      cta: cta,
      meta: {
        intent: intent,
        appliedFilters: rawFilters,
        isRelaxed: isRelaxed,
        resultConfidence: resultConfidence,
        engine: "gemini-2.0-flash"
      }
    });

  } catch (error) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Clean up markdown blocks and parse JSON safely
 */
function parseJsonResponse(text) {
  try {
    // Remove markdown code blocks if present (e.g. ```json ... ```)
    const cleaned = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw text:", text);
    return {
      reply: "I found some properties for you, but I encountered an error while formatting them. Please take a look below.",
      properties: [],
      suggestions: []
    };
  }
}

/**
 * Generates a dynamic Call to Action based on user intent
 */
function generateCTA(intent) {
  switch (intent) {
    case "buy":
      return { text: "Contact our Property Experts", href: "/contact" };
    case "investment":
      return { text: "Consult our Financial Advisor", href: "/financer" };
    case "rent":
      return { text: "Explore Property Management", href: "/property-management-services" };
    default:
      return { text: "Get Professional Legal Advice", href: "/lawyer" };
  }
}

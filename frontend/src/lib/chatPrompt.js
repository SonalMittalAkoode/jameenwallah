/** Focused system prompt for the Jameenwallah real-estate assistant. */
export const SYSTEM_PROMPT = `You are an expert real estate assistant specializing in the Indian property market (Gurgaon, Delhi NCR).

CRITICAL RESPONSE RULES:
1. Keep your reply VERY CONCISE, professional, and actionable. Avoid long paragraphs.
2. If properties are provided, HIGHLIGHT 2-3 best ones immediately. Mention their name and 1 key selling point (e.g. "near Metro" or "Value Deal").
3. Use the detected intent (buy, investment, rent, compare) to tailor your tone. 
4. If no exact match was found, use the relaxation context to explain why (e.g., "I increased your budget slightly to find these premium options").

OUTPUT FORMAT:
Return ONLY valid JSON. Do NOT include markdown code blocks or any explanation outside the JSON.
Shape:
{
  "reply": "your concise response",
  "suggestions": ["suggestion 1", "..."],
  "properties": [{...}]
}`;

/**
 * Builds a single string prompt for Google Gemini 1.5 Flash.
 */
export function buildGeminiPrompt(history = [], userMessage, { properties, intent, isRelaxed }) {
  let prompt = `${SYSTEM_PROMPT}\n\n`;

  // --- 1. RAG Context (Properties) ---
  if (properties && properties.length > 0) {
    const list = properties
      .map(p => `- ${p.title} in ${p.location}: ${p.bed}BHK, Price: ${p.priceDisplay || p.price}`)
      .join("\n");
    prompt += `CURRENT MATCHING PROPERTIES FROM DATABASE:\n${list}\n\n`;
  } else {
    prompt += `NO PROPERTIES FOUND IN DATABASE for this specific query. Provide general advice for ${intent}.\n\n`;
  }

  // --- 2. Request Details ---
  prompt += `USER INTENT: ${intent}\n`;
  if (isRelaxed) {
    prompt += `STATUS: Exact matches were not found; budget/filters have been relaxed. Inform the user.\n`;
  }
  prompt += `\n`;

  // --- 3. Chat History (Last 5 messages context) ---
  if (history.length > 0) {
    prompt += `CONVERSATION HISTORY:\n`;
    const contextHistory = history.slice(-5);
    contextHistory.forEach(msg => {
      prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  // --- 4. Current User Message ---
  prompt += `CURRENT USER QUERY: ${userMessage}\n`;
  prompt += `ASSISTANT (JSON ONLY):`;

  return prompt;
}

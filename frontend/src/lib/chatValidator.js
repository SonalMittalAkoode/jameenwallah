/**
 * Validates the parsed request body for the /api/chat endpoint.
 *
 * @param {unknown} body - Raw parsed JSON from the request.
 * @returns {{ valid: true, data: { message: string, history: Array } }
 *          | { valid: false, error: string }}
 */
export function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const { message, history } = body;

  // --- message ---
  if (typeof message !== "string" || message.trim() === "") {
    return {
      valid: false,
      error: "`message` is required and must be a non-empty string.",
    };
  }

  if (message.trim().length > 2000) {
    return {
      valid: false,
      error: "`message` must not exceed 2000 characters.",
    };
  }

  // --- history ---
  if (history !== undefined && !Array.isArray(history)) {
    return { valid: false, error: "`history` must be an array when provided." };
  }

  const safeHistory = Array.isArray(history) ? history : [];

  // Guard against absurdly long histories to control token spend
  if (safeHistory.length > 40) {
    return {
      valid: false,
      error: "`history` must not contain more than 40 messages.",
    };
  }

  for (const [i, msg] of safeHistory.entries()) {
    if (!msg || typeof msg !== "object") {
      return {
        valid: false,
        error: `history[${i}] must be an object with "role" and "content".`,
      };
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return {
        valid: false,
        error: `history[${i}].role must be "user" or "assistant".`,
      };
    }
    if (typeof msg.content !== "string" || msg.content.trim() === "") {
      return {
        valid: false,
        error: `history[${i}].content must be a non-empty string.`,
      };
    }
  }

  return {
    valid: true,
    data: { message: message.trim(), history: safeHistory },
  };
}

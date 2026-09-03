/**
 * Generate and manage a unique session ID for anonymous users.
 * Stored in localStorage to persist across page reloads.
 */

const SESSION_ID_KEY = "blog-session-id";

/**
 * Generate a random UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a unique session ID for the current user.
 * The session ID persists in localStorage across browser sessions.
 */
export function getSessionId(): string {
  // Try to retrieve existing session ID from localStorage
  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  // Generate a new session ID
  const newSessionId = generateUUID();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

/**
 * Clear the session ID (useful for testing or reset scenarios)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

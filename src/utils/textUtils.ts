/**
 * Decode HTML entities to display text properly
 * Converts encoded characters like &#x2F; to / and &#x27; to '
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return "";

  // Create a temporary textarea element to leverage browser's built-in HTML decoding
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Safe display of user-generated content
 * Decodes HTML entities while preserving security
 */
export function safeDisplayText(text: string | null | undefined): string {
  return decodeHtmlEntities(text);
}

/**
 * Convert plural unit names to singular for price display
 * e.g., "tons" -> "ton", "kg" -> "kg"
 */
export function singularizeUnit(unit: string | null | undefined): string {
  if (!unit) return "";

  const unitLower = unit.toLowerCase();

  // Handle common plural forms
  if (unitLower.endsWith("s") && unitLower !== "kg" && unitLower !== "lbs") {
    return unit.slice(0, -1);
  }

  return unit;
}

import DOMPurify from "dompurify";

/**
 * Input sanitization utility (#26)
 * Strips XSS vectors from user text before sending to APIs
 */

/**
 * Sanitize plain text input (strips all HTML/script tags)
 */
export function sanitizeText(input) {
  if (typeof input !== "string") return "";
  // Strip all HTML tags, keeping just text content
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitize while preserving basic formatting (paragraphs, bold, italic)
 */
export function sanitizeRichText(input) {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize mood name (must be one of known moods)
 */
export function sanitizeMood(mood) {
  const VALID_MOODS = ["Happy", "Sad", "Angry", "Calm", "Excited", "Anxious"];
  if (VALID_MOODS.includes(mood)) return mood;
  return null;
}

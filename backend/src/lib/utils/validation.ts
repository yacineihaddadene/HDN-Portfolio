/**
 * Validation utilities for input sanitization and validation
 */

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 */
export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitizes text to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim();
}

/**
 * Validates and normalizes language parameter
 * Returns 'en' or 'fr', defaults to 'en'
 */
export function validateLanguage(lang: string | null | undefined): "en" | "fr" {
  if (lang === "fr" || lang === "FR") {
    return "fr";
  }
  return "en";
}

/**
 * Extracts requested language from JSONB bilingual object
 */
export function extractLanguageFromJsonb(
  jsonb: { en: string; fr: string } | null | undefined,
  lang: "en" | "fr"
): string {
  if (!jsonb) {
    return "";
  }
  return jsonb[lang] || jsonb.en || "";
}

/**
 * Validates rating is between 1 and 5
 */
export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validates date string format (YYYY-MM-DD)
 */
export function validateDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates that a string is not empty after trimming
 */
export function validateNotEmpty(value: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

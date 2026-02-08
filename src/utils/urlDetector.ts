/**
 * URL Detector Module
 * Detects URLs in pasted text
 */

// URL regex pattern that matches http:// and https:// URLs
const URL_PATTERN = /https?:\/\/[^\s)]+/gi;

/**
 * Detect URLs in the given text
 * @param text The text to search for URLs
 * @returns Array of detected URLs
 */
export function detectURLs(text: string): string[] {
	const matches = text.match(URL_PATTERN);
	return matches ? Array.from(new Set(matches)) : [];
}

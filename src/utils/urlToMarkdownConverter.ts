/**
 * URL to Markdown Converter Service
 * Handles the common logic for converting URLs in text to markdown links
 */

import { detectURLs } from "./urlDetector";
import { fetchTitle } from "./titleFetcher";
import { replaceMultipleURLsWithLinks } from "./linkConverter";

/**
 * Convert all URLs in the given text to markdown links
 * @param text Text containing URLs
 * @param placeholderText Placeholder text to use when title fetch fails
 * @returns Converted text with URLs replaced by markdown links, or null if no URLs found
 */
export async function convertURLsToMarkdownLinks(
	text: string,
	placeholderText: string
): Promise<string | null> {
	// Detect URLs in text
	const urls = detectURLs(text);

	if (urls.length === 0) {
		return null;
	}

	// Remove duplicates
	const uniqueUrls = Array.from(new Set(urls));

	// Fetch titles for all URLs concurrently
	// Use Promise.allSettled to ensure failed fetches don't affect other URLs
	const titlePromises = uniqueUrls.map(url => fetchTitle(url));
	const titleResults = await Promise.allSettled(titlePromises);

	// Create map of URL to title
	// ex) { 'https://example.com': 'Example Domain', 'https://www.google.com': 'Google' }
	const urlTitleMap = new Map(
		uniqueUrls.map((url, i) => {
			const result = titleResults[i];
			if (!result) {
				return [url, null];
			}
			return [url, result.status === 'fulfilled' ? result.value : null];
		})
	);

	// Replace all URLs with inline markdown links
	const convertedText = replaceMultipleURLsWithLinks(
		text,
		urlTitleMap,
		placeholderText
	);

	return convertedText;
}

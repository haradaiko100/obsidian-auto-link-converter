/**
 * Link Converter Module
 * Converts URLs to inline markdown links [title](url)
 */

/**
 * Replace multiple URLs in text with inline markdown links
 * @param text The text containing URLs
 * @param urlTitleMap Map of URL to title (null if fetch failed)
 * @param placeholder Placeholder text for failed fetches
 * @returns Text with all URLs replaced by markdown links
 */
export function replaceMultipleURLsWithLinks(
	text: string,
	urlTitleMap: Map<string, string | null>,
	placeholder: string
): string {
	let result = text;
	for (const [url, title] of urlTitleMap) {
		const displayTitle = title || placeholder;
		const markdownLink = `[${displayTitle}](${url})`;
		// Escape special regex characters in URL
		const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		result = result.replace(new RegExp(escapedUrl, 'g'), markdownLink);
	}
	return result;
}

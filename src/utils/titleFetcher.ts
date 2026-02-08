/**
 * Title Fetcher Module
 * Fetches page titles from URLs
 */

import { requestUrl } from 'obsidian';

/**
 * Fetch the title from a URL
 * @param url The URL to fetch the title from
 * @returns The page title or null if fetch fails
 */
export async function fetchTitle(url: string): Promise<string | null> {
	try {
		const response = await requestUrl({
			url,
			method: 'GET',
			headers: {},
			throw: false
		});

		if (response.status !== 200) {
			return null;
		}

		const html = response.text;
		const title = extractTitle(html);

		return title;
	} catch {
		return null;
	}
}

/**
 * Extract title from HTML content
 * @param html The HTML content
 * @returns The extracted title or null if not found
 */
function extractTitle(html: string): string | null {
	// Try to match <title> tag (case-insensitive, handles newlines)
	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

	if (titleMatch && titleMatch[1]) {
		// Decode HTML entities and clean up whitespace
		const title = titleMatch[1]
			.replace(/\s+/g, ' ') // Replace multiple whitespace with single space
			.trim();

		return decodeHTMLEntities(title);
	}

	return null;
}

/**
 * Decode common HTML entities
 * @param text Text containing HTML entities
 * @returns Decoded text
 */
function decodeHTMLEntities(text: string): string {
	const entities: Record<string, string> = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&apos;': "'",
		'&nbsp;': ' '
	};

	return text.replace(/&[#\w]+;/g, (entity) => {
		if (entity in entities) {
			return entities[entity] || entity;
		}
		// Handle numeric entities like &#8211;
		const match = entity.match(/&#(\d+);/);
		if (match && match[1]) {
			return String.fromCharCode(parseInt(match[1]));
		}
		return entity;
	});
}

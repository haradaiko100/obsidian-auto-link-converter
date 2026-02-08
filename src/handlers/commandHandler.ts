/**
 * Command Handler Module
 * Handles manual conversion of selected URLs via commands
 */

import { Editor } from "obsidian";
import { AutoLinkConverterSettings } from "../settings";
import { convertURLsToMarkdownLinks } from "../utils/urlToMarkdownConverter";
import { ConvertedResult, SUCCESS_MESSAGE } from "../const";

/**
 * Convert URLs in selected text to inline markdown links
 * @param editor The Obsidian editor instance
 * @param settings Plugin settings
 * @returns ConvertedResult
 */
export async function convertSelectedURLs(
	editor: Editor,
	settings: AutoLinkConverterSettings
): Promise<ConvertedResult | null> {
	const selectedText = editor.getSelection();

	if (!selectedText) {
		return null;
	}

	// Convert URLs to markdown links
	const convertedText = await convertURLsToMarkdownLinks(
		selectedText,
		settings.placeholderText
	);

	if (!convertedText) {
		return null;
	}

	// Replace selected text with converted text
	editor.replaceSelection(convertedText);

	return {
		success: true,
		message: SUCCESS_MESSAGE,
	};
}

/**
 * Paste Handler Module
 * Handles paste events and converts URLs to inline markdown links
 */

import { Editor, EditorPosition } from "obsidian";
import { AutoLinkConverterSettings } from "../settings";
import { detectURLs } from "../utils/urlDetector";
import { convertURLsToMarkdownLinks } from "../utils/urlToMarkdownConverter";
import { ConvertedResult, FAILED_TO_CONVERT_MESSAGE, SUCCESS_MESSAGE } from "../const";

/**
 * Generate a unique placeholder ID for tracking paste operations.
 * Uses timestamp and random number to create unique IDs.
 */
function generatePlaceholderId(baseText: string = "Converting"): string {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000);
	return `${baseText}... (${timestamp}-${random})`;
}

/**
 * Find and replace a placeholder in the editor with the final text.
 */
function replacePlaceholderInEditor(
	editor: Editor,
	placeholderId: string,
	replacement: string
): boolean {
	const text = editor.getValue();
	const start = text.indexOf(placeholderId);

	if (start < 0) {
		// unable to find the placeholder in the editor
		return false;
	}

	const end = start + placeholderId.length;
	const startPos = getEditorPositionFromIndex(text, start);
	const endPos = getEditorPositionFromIndex(text, end);

	editor.replaceRange(replacement, startPos, endPos);
	return true;
}

/**
 * Convert text index to EditorPosition (line, ch).
 * ex)
 *  input: {
 *    text: "Hello\nWorld",
 *    index: 5, which is the position of the 'W' in the text
 *  }
 *  output: { line: 1, ch: 0 }
 */
function getEditorPositionFromIndex(text: string, index: number): EditorPosition {
	let line = 0;
	let ch = 0;

	for (let i = 0; i < index; i++) {
		if (text[i] === '\n') {
			line++;
			ch = 0;
		} else {
			ch++;
		}
	}

	return { line, ch };
}

/**
 * Handle paste event: convert URLs to markdown links when applicable.
 * Performs synchronous preparation (preventDefault, placeholder) and async conversion internally.
 *
 * @returns ConvertedResult when this paste was handled (success or failure), null when not handled.
 */
export async function handlePaste(
	event: ClipboardEvent,
	editor: Editor,
	settings: AutoLinkConverterSettings
): Promise<ConvertedResult | null> {
	// validate whether the paste event should be handled
	if (!settings.enableAutoConvert) {
		return null;
	}

	const clipboardData = event.clipboardData;
	if (!clipboardData) {
		return null;
	}
	const pastedText = clipboardData.getData("text/plain");
	if (!pastedText) {
		return null;
	}

	// if no URLs are found, we don't need to handle the paste event
	if (detectURLs(pastedText).length === 0) {
		return null;
	}

	// stop the default paste event
	event.preventDefault();

	// generate a unique placeholder ID and insert it immediately
	// This provides instant visual feedback to the user
	const placeholderId = generatePlaceholderId(settings.placeholderText || "Converting");
	editor.replaceSelection(placeholderId);

	try {
		const convertedText = await convertURLsToMarkdownLinks(pastedText, settings.placeholderText);
		const textToInsert = convertedText ?? pastedText;

		const replaced = replacePlaceholderInEditor(editor, placeholderId, textToInsert);

		if (!replaced) {
			return {
				success: false,
				message: FAILED_TO_CONVERT_MESSAGE,
			};
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
		};
	} catch {
		// revert the placeholder to the original text
		replacePlaceholderInEditor(editor, placeholderId, pastedText);
		return {
			success: false,
			message: FAILED_TO_CONVERT_MESSAGE,
		};
	}
}
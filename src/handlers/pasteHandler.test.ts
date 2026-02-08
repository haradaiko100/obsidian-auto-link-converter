/**
 * Paste Handler Tests
 */

import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { handlePaste } from "./pasteHandler";
import { DEFAULT_SETTINGS, type AutoLinkConverterSettings } from "../settings";
import type { Editor } from "obsidian";

// Mock the URL converter
vi.mock("../utils/urlToMarkdownConverter", () => ({
	convertURLsToMarkdownLinks: vi.fn(),
}));

import { convertURLsToMarkdownLinks } from "../utils/urlToMarkdownConverter";

const mockedConvertURLsToMarkdownLinks = vi.mocked(convertURLsToMarkdownLinks);

describe("PasteHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("handlePaste", () => {
		type HandlePasteCase = {
			name: string;
			settingsOverrides: Partial<AutoLinkConverterSettings>;
			clipboardText: string | null;
			hasClipboardData: boolean;
			convertedText: string | null;
			shouldConvertThrow: boolean;
			expectedResult: { success: boolean; message: string } | null;
			shouldPreventDefault: boolean;
			shouldReplaceSelection: boolean;
		};

		const cases: HandlePasteCase[] = [
			{
				name: "enableAutoConvert が false の場合は何もしない",
				settingsOverrides: { enableAutoConvert: false },
				clipboardText: "https://example.com",
				hasClipboardData: true,
				convertedText: null,
				shouldConvertThrow: false,
				expectedResult: null,
				shouldPreventDefault: false,
				shouldReplaceSelection: false,
			},
			{
				name: "clipboardData がない場合は何もしない",
				settingsOverrides: {},
				clipboardText: null,
				hasClipboardData: false,
				convertedText: null,
				shouldConvertThrow: false,
				expectedResult: null,
				shouldPreventDefault: false,
				shouldReplaceSelection: false,
			},
			{
				name: "URL が含まれていない場合は何もしない",
				settingsOverrides: {},
				clipboardText: "no url here",
				hasClipboardData: true,
				convertedText: null,
				shouldConvertThrow: false,
				expectedResult: null,
				shouldPreventDefault: false,
				shouldReplaceSelection: false,
			},
			{
				name: "URL を含むテキストを正常に変換できる",
				settingsOverrides: {},
				clipboardText: "https://example.com",
				hasClipboardData: true,
				convertedText: "[Example](https://example.com)",
				shouldConvertThrow: false,
				expectedResult: {
					success: true,
					message: "Links converted successfully",
				},
				shouldPreventDefault: true,
				shouldReplaceSelection: true,
			},
			{
				name: "変換に失敗した場合は元のテキストを挿入し、success: false を返す",
				settingsOverrides: {},
				clipboardText: "https://example.com",
				hasClipboardData: true,
				convertedText: null,
				shouldConvertThrow: true,
				expectedResult: {
					success: false,
					message: "Failed to convert links",
				},
				shouldPreventDefault: true,
				shouldReplaceSelection: true,
			},
		];

		it.each(cases)(
			"$name",
			async ({
				settingsOverrides,
				clipboardText,
				hasClipboardData,
				convertedText,
				shouldConvertThrow,
				expectedResult,
				shouldPreventDefault,
				shouldReplaceSelection,
			}) => {
				// Setup mocks only when they will be called
				if (shouldPreventDefault) {
					if (shouldConvertThrow) {
						mockedConvertURLsToMarkdownLinks.mockRejectedValueOnce(
							new Error("Network error")
						);
					} else {
						mockedConvertURLsToMarkdownLinks.mockResolvedValueOnce(convertedText);
					}
				}

				let insertedText = "";
				const editorReplaceSelection = vi.fn((text: string) => {
					insertedText = text;
				});
				const editorGetValue = vi.fn(() => insertedText);
				const editorReplaceRange = vi.fn();

				const editor = {
					replaceSelection: editorReplaceSelection,
					getValue: editorGetValue,
					replaceRange: editorReplaceRange,
				} as unknown as Editor;

				const evtPreventDefault = vi.fn();
				const evt = {
					clipboardData: hasClipboardData
						? {
								getData: () => clipboardText ?? "",
						  }
						: null,
					preventDefault: evtPreventDefault,
				} as unknown as ClipboardEvent;

				const settings: AutoLinkConverterSettings = {
					...DEFAULT_SETTINGS,
					...settingsOverrides,
				};

				const result = await handlePaste(evt, editor, settings);

				expect(result).toEqual(expectedResult);

				if (shouldPreventDefault) {
					expect(evtPreventDefault).toHaveBeenCalledTimes(1);
				} else {
					expect(evtPreventDefault).not.toHaveBeenCalled();
				}

				if (shouldReplaceSelection) {
					expect(editorReplaceSelection).toHaveBeenCalled();
				} else {
					expect(editorReplaceSelection).not.toHaveBeenCalled();
				}
			}
		);
	});
});

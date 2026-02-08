/**
 * Command Handler Tests
 */

import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { convertSelectedURLs } from "./commandHandler";
import { DEFAULT_SETTINGS, type AutoLinkConverterSettings } from "../settings";
import type { Editor } from "obsidian";

// Mock the URL converter
vi.mock("../utils/urlToMarkdownConverter", () => ({
	convertURLsToMarkdownLinks: vi.fn(),
}));

import { convertURLsToMarkdownLinks } from "../utils/urlToMarkdownConverter";

const mockedConvertURLsToMarkdownLinks = vi.mocked(convertURLsToMarkdownLinks);

describe("CommandHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("convertSelectedURLs", () => {
		type ConvertSelectedURLsCase = {
			name: string;
			selectedText: string | null;
			convertedText: string | null;
			placeholderText: string;
			expectedResult: { success: boolean; message: string } | null;
			shouldReplaceSelection: boolean;
			shouldCallConverter?: boolean;
		};

		const cases: ConvertSelectedURLsCase[] = [
			{
				name: "選択範囲がない場合は null を返す",
				selectedText: null,
				convertedText: null,
				placeholderText: "Untitled",
				expectedResult: null,
				shouldReplaceSelection: false,
			},
			{
				name: "空文字が選択されている場合は null を返す",
				selectedText: "",
				convertedText: null,
				placeholderText: "Untitled",
				expectedResult: null,
				shouldReplaceSelection: false,
			},
			{
				name: "URL がない選択範囲の場合は null を返す",
				selectedText: "no urls here",
				convertedText: null,
				placeholderText: "Untitled",
				expectedResult: null,
				shouldReplaceSelection: false,
				shouldCallConverter: true,
			},
			{
				name: "単一 URL を変換できる",
				selectedText: "https://example.com",
				convertedText: "[Example](https://example.com)",
				placeholderText: "Untitled",
				expectedResult: {
					success: true,
					message: "Links converted successfully",
				},
				shouldReplaceSelection: true,
			},
			{
				name: "複数 URL を変換できる",
				selectedText: "Visit https://example.com and https://test.org",
				convertedText:
					"Visit [Example](https://example.com) and [Test Site](https://test.org)",
				placeholderText: "Untitled",
				expectedResult: {
					success: true,
					message: "Links converted successfully",
				},
				shouldReplaceSelection: true,
			},
			{
				name: "テキスト中の URL を変換できる",
				selectedText: "Check out https://example.com for more info",
				convertedText: "Check out [Example](https://example.com) for more info",
				placeholderText: "Untitled",
				expectedResult: {
					success: true,
					message: "Links converted successfully",
				},
				shouldReplaceSelection: true,
			},
			{
				name: "カスタム placeholder を使用できる",
				selectedText: "https://failed.com",
				convertedText: "[Loading...](https://failed.com)",
				placeholderText: "Loading...",
				expectedResult: {
					success: true,
					message: "Links converted successfully",
				},
				shouldReplaceSelection: true,
			},
		];

		it.each(cases)(
			"$name",
			async ({
				selectedText,
				convertedText,
				placeholderText,
				expectedResult,
				shouldReplaceSelection,
				shouldCallConverter,
			}) => {
				// Setup mocks only when they will be called
				if (shouldReplaceSelection || shouldCallConverter) {
					mockedConvertURLsToMarkdownLinks.mockResolvedValueOnce(convertedText);
				}

				const editorGetSelection = vi.fn(() => selectedText ?? "");
				const editorReplaceSelection = vi.fn();

				const editor = {
					getSelection: editorGetSelection,
					replaceSelection: editorReplaceSelection,
				} as unknown as Editor;

				const settings: AutoLinkConverterSettings = {
					...DEFAULT_SETTINGS,
					placeholderText,
				};

				const result = await convertSelectedURLs(editor, settings);

				expect(result).toEqual(expectedResult);

				if (shouldReplaceSelection) {
					expect(editorReplaceSelection).toHaveBeenCalledWith(convertedText);
					expect(mockedConvertURLsToMarkdownLinks).toHaveBeenCalledWith(
						selectedText,
						placeholderText
					);
				} else {
					expect(editorReplaceSelection).not.toHaveBeenCalled();
					if (shouldCallConverter) {
						expect(mockedConvertURLsToMarkdownLinks).toHaveBeenCalledWith(
							selectedText,
							placeholderText
						);
					} else {
						expect(mockedConvertURLsToMarkdownLinks).not.toHaveBeenCalled();
					}
				}
			}
		);
	});
});

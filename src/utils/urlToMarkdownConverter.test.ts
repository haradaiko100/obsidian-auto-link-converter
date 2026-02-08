/**
 * URL to Markdown Converter Tests
 */

import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { convertURLsToMarkdownLinks } from "./urlToMarkdownConverter";

// Mock dependencies
vi.mock("./urlDetector", () => ({
	detectURLs: vi.fn(),
}));

vi.mock("./titleFetcher", () => ({
	fetchTitle: vi.fn(),
}));

vi.mock("./linkConverter", () => ({
	replaceMultipleURLsWithLinks: vi.fn(),
}));

import { detectURLs } from "./urlDetector";
import { fetchTitle } from "./titleFetcher";
import { replaceMultipleURLsWithLinks } from "./linkConverter";

const mockedDetectURLs = vi.mocked(detectURLs);
const mockedFetchTitle = vi.mocked(fetchTitle);
const mockedReplaceMultipleURLsWithLinks = vi.mocked(replaceMultipleURLsWithLinks);

describe("URLToMarkdownConverter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("convertURLsToMarkdownLinks", () => {
		type ConvertURLsToMarkdownLinksCase = {
			name: string;
			text: string;
			placeholderText: string;
			detectedURLs: string[];
			titleResults: Array<{ url: string; title: string | null; shouldReject: boolean }>;
			convertedText: string;
			expected: string | null;
		};

		const cases: ConvertURLsToMarkdownLinksCase[] = [
			{
				name: "URL がない場合は null を返す",
				text: "no urls here",
				placeholderText: "Untitled",
				detectedURLs: [],
				titleResults: [],
				convertedText: "",
				expected: null,
			},
			{
				name: "単一 URL を変換できる",
				text: "https://example.com",
				placeholderText: "Untitled",
				detectedURLs: ["https://example.com"],
				titleResults: [
					{ url: "https://example.com", title: "Example Domain", shouldReject: false },
				],
				convertedText: "[Example Domain](https://example.com)",
				expected: "[Example Domain](https://example.com)",
			},
			{
				name: "複数 URL を変換できる",
				text: "Visit https://example.com and https://test.org",
				placeholderText: "Untitled",
				detectedURLs: ["https://example.com", "https://test.org"],
				titleResults: [
					{ url: "https://example.com", title: "Example", shouldReject: false },
					{ url: "https://test.org", title: "Test Site", shouldReject: false },
				],
				convertedText: "Visit [Example](https://example.com) and [Test Site](https://test.org)",
				expected: "Visit [Example](https://example.com) and [Test Site](https://test.org)",
			},
			{
				name: "タイトル取得に失敗した URL は placeholder を使う",
				text: "https://example.com",
				placeholderText: "Untitled",
				detectedURLs: ["https://example.com"],
				titleResults: [
					{ url: "https://example.com", title: null, shouldReject: true },
				],
				convertedText: "[Untitled](https://example.com)",
				expected: "[Untitled](https://example.com)",
			},
			{
				name: "重複 URL は一度だけタイトルを取得する",
				text: "https://example.com and https://example.com",
				placeholderText: "Untitled",
				detectedURLs: ["https://example.com"], // detectURLs already removes duplicates
				titleResults: [
					{ url: "https://example.com", title: "Example", shouldReject: false },
				],
				convertedText: "[Example](https://example.com) and [Example](https://example.com)",
				expected: "[Example](https://example.com) and [Example](https://example.com)",
			},
			{
				name: "一部のタイトル取得が失敗しても他の URL は変換できる",
				text: "Visit https://example.com and https://failed.com",
				placeholderText: "Untitled",
				detectedURLs: ["https://example.com", "https://failed.com"],
				titleResults: [
					{ url: "https://example.com", title: "Example", shouldReject: false },
					{ url: "https://failed.com", title: null, shouldReject: true },
				],
				convertedText: "Visit [Example](https://example.com) and [Untitled](https://failed.com)",
				expected: "Visit [Example](https://example.com) and [Untitled](https://failed.com)",
			},
		];

		it.each(cases)(
			"$name",
			async ({
				text,
				placeholderText,
				detectedURLs,
				titleResults,
				convertedText,
				expected,
			}) => {
				// Setup mocks
				mockedDetectURLs.mockReturnValueOnce(detectedURLs);

				const uniqueURLs = Array.from(new Set(detectedURLs));

				// Only set up other mocks if there are URLs to process
				if (detectedURLs.length > 0) {
					// Setup fetchTitle mocks
					for (const result of titleResults) {
						if (result.shouldReject) {
							mockedFetchTitle.mockRejectedValueOnce(new Error("Failed to fetch"));
						} else {
							mockedFetchTitle.mockResolvedValueOnce(result.title);
						}
					}

					mockedReplaceMultipleURLsWithLinks.mockReturnValueOnce(convertedText);
				}

				const result = await convertURLsToMarkdownLinks(text, placeholderText);

				expect(result).toBe(expected);

				// Verify detectURLs was called
				expect(mockedDetectURLs).toHaveBeenCalledWith(text);

				// Verify fetchTitle was called for unique URLs
				if (uniqueURLs.length > 0) {
					expect(mockedFetchTitle).toHaveBeenCalledTimes(uniqueURLs.length);
				}

				// Verify replaceMultipleURLsWithLinks was called if URLs were found
				if (detectedURLs.length > 0) {
					expect(mockedReplaceMultipleURLsWithLinks).toHaveBeenCalledWith(
						text,
						expect.any(Map),
						placeholderText
					);
				}
			}
		);
	});
});

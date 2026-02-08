/**
 * TitleFetcher Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTitle } from './titleFetcher';

// Mock the requestUrl function from obsidian
vi.mock('obsidian', () => ({
	requestUrl: vi.fn()
}));

import { requestUrl } from 'obsidian';

describe('TitleFetcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('fetchTitle', () => {
		type MockResolvedResponse = {
			status: number;
			text: string;
			headers: Record<string, string>;
			arrayBuffer: ArrayBuffer;
			json: Record<string, unknown>;
		};

		type FetchTitleCase = {
			name: string;
			url: string;
			mock:
				| {
						type: 'resolve';
						status: number;
						text: string;
					}
				| {
						type: 'reject';
						error: Error;
					};
			expectedTitle: string | null;
			expectedRequestHeaders: Record<string, string>;
		};

		const cases: FetchTitleCase[] = [
			{
				name: 'HTML から title を抽出できる',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head><title>Example Domain</title></head><body></body></html>',
				},
				expectedTitle: 'Example Domain',
				expectedRequestHeaders: {},
			},
			{
				name: '日本語タイトルを扱える',
				url: 'https://zenn.dev/article',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head><title>Obsidianで使っているプラグイン紹介</title></head></html>',
				},
				expectedTitle: 'Obsidianで使っているプラグイン紹介',
				expectedRequestHeaders: {},
			},
			{
				name: 'title の余分な空白を正規化できる',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head><title>  Example   Domain  </title></head></html>',
				},
				expectedTitle: 'Example Domain',
				expectedRequestHeaders: {},
			},
			{
				name: 'HTML エンティティをデコードできる',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head><title>AT&amp;T &amp; Co.</title></head></html>',
				},
				expectedTitle: 'AT&T & Co.',
				expectedRequestHeaders: {},
			},
			{
				name: 'ステータスが 200 以外なら null を返す',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 404,
					text: '',
				},
				expectedTitle: null,
				expectedRequestHeaders: {},
			},
			{
				name: 'title タグが存在しない場合は null を返す',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head></head><body>No title</body></html>',
				},
				expectedTitle: null,
				expectedRequestHeaders: {},
			},
			{
				name: 'ネットワークエラー時は null を返す',
				url: 'https://example.com',
				mock: {
					type: 'reject',
					error: new Error('Network error'),
				},
				expectedTitle: null,
				expectedRequestHeaders: {},
			},
			{
				name: 'title に改行が含まれていても 1 行に正規化できる',
				url: 'https://example.com',
				mock: {
					type: 'resolve',
					status: 200,
					text: '<html><head><title>Example\n   Domain\n   Title</title></head></html>',
				},
				expectedTitle: 'Example Domain Title',
				expectedRequestHeaders: {},
			},
		];

		it.each(cases)('$name', async ({ url, mock, expectedTitle, expectedRequestHeaders }) => {
			const mockedRequestUrl = vi.mocked(requestUrl);

			if (mock.type === 'resolve') {
				const response: MockResolvedResponse = {
					status: mock.status,
					text: mock.text,
					headers: {},
					arrayBuffer: new ArrayBuffer(0),
					json: {},
				};
				mockedRequestUrl.mockResolvedValue(response);
			} else {
				mockedRequestUrl.mockRejectedValue(mock.error);
			}

			const result = await fetchTitle(url);
			expect(result).toBe(expectedTitle);

			expect(requestUrl).toHaveBeenCalledWith({
				url,
				method: 'GET',
				headers: expectedRequestHeaders,
				throw: false,
			});
		});
	});
});

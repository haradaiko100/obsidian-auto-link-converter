/**
 * URLDetector Tests
 */

import { describe, expect, it } from 'vitest';
import { detectURLs } from './urlDetector';

describe('URLDetector', () => {
	describe('detectURLs', () => {
		type DetectURLsCase = {
			name: string;
			text: string;
			expected: string[];
		};

		const cases: DetectURLsCase[] = [
			{
				name: 'HTTP の URL を1件検出できる',
				text: 'Check out http://example.com',
				expected: ['http://example.com'],
			},
			{
				name: 'HTTPS の URL を1件検出できる',
				text: 'Check out https://example.com',
				expected: ['https://example.com'],
			},
			{
				name: '複数 URL を検出できる',
				text: 'Visit https://example.com and http://test.org',
				expected: ['https://example.com', 'http://test.org'],
			},
			{
				name: 'パス付き URL を検出できる',
				text: 'Read https://zenn.dev/karaage0703/articles/fed57bd97487a6',
				expected: ['https://zenn.dev/karaage0703/articles/fed57bd97487a6'],
			},
			{
				name: 'クエリ付き URL を検出できる',
				text: 'Search https://example.com/search?q=test&lang=ja',
				expected: ['https://example.com/search?q=test&lang=ja'],
			},
			{
				name: '重複 URL を除去できる',
				text: 'https://example.com and https://example.com again',
				expected: ['https://example.com'],
			},
			{
				name: 'URL がない場合は空配列を返す',
				text: 'This is just plain text without any links',
				expected: [],
			},
			{
				name: '不完全な URL（ドメインのみ等）は検出しない',
				text: 'example.com or www.example.com',
				expected: [],
			},
			{
				name: 'Markdown 記法の中の URL も検出できる',
				text: 'Link: [title](https://example.com)',
				expected: ['https://example.com'],
			},
		];

		it.each(cases)('$name', ({ text, expected }) => {
			const urls = detectURLs(text);
			expect(urls).toEqual(expected);
		});
	});
});

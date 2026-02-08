/**
 * LinkConverter Tests
 */

import { describe, expect, it } from 'vitest';
import { replaceMultipleURLsWithLinks } from './linkConverter';

describe('LinkConverter', () => {
	describe('replaceMultipleURLsWithLinks', () => {
		type ReplaceMultipleURLsWithLinksCase = {
			name: string;
			text: string;
			entries: Array<[string, string | null]>;
			placeholder: string;
			expected: string;
		};

		const cases: ReplaceMultipleURLsWithLinksCase[] = [
			{
				name: '複数 URL を Markdown リンクに置換できる',
				text: 'Visit https://example.com and https://test.org',
				entries: [
					['https://example.com', 'Example'],
					['https://test.org', 'Test Site'],
				],
				placeholder: 'Untitled',
				expected:
					'Visit [Example](https://example.com) and [Test Site](https://test.org)',
			},
			{
				name: 'タイトル取得失敗（null）の URL は placeholder で置換する',
				text: 'Links: https://example.com and https://failed.com',
				entries: [
					['https://example.com', 'Example'],
					['https://failed.com', null],
				],
				placeholder: 'Untitled',
				expected:
					'Links: [Example](https://example.com) and [Untitled](https://failed.com)',
			},
			{
				name: 'URL マップが空なら入力テキストをそのまま返す',
				text: 'Just plain text',
				entries: [],
				placeholder: 'Untitled',
				expected: 'Just plain text',
			},
			{
				name: '実例（Zenn URL）でも置換できる',
				text: 'https://zenn.dev/karaage0703/articles/fed57bd97487a6',
				entries: [
					[
						'https://zenn.dev/karaage0703/articles/fed57bd97487a6',
						'Obsidianで使っているプラグイン紹介',
					],
				],
				placeholder: 'Untitled',
				expected:
					'[Obsidianで使っているプラグイン紹介](https://zenn.dev/karaage0703/articles/fed57bd97487a6)',
			},
			{
				name: 'クエリパラメータ付き URL を正しく置換できる',
				text: 'Search: https://example.com/search?q=test&lang=ja',
				entries: [
					['https://example.com/search?q=test&lang=ja', 'Search Results'],
				],
				placeholder: 'Untitled',
				expected: 'Search: [Search Results](https://example.com/search?q=test&lang=ja)',
			},
			{
				name: '同一 URL が複数回出現しても全て置換できる',
				text: 'https://example.com and https://example.com again',
				entries: [
					['https://example.com', 'Example'],
				],
				placeholder: 'Untitled',
				expected:
					'[Example](https://example.com) and [Example](https://example.com) again',
			},
			{
				name: 'テキスト中の単一 URL を Markdown リンクに置換できる',
				text: 'Check out https://example.com for more info',
				entries: [
					['https://example.com', 'Example Domain'],
				],
				placeholder: 'Untitled',
				expected: 'Check out [Example Domain](https://example.com) for more info',
			},
		];

		it.each(cases)('$name', ({ text, entries, placeholder, expected }) => {
			const urlTitleMap = new Map<string, string | null>(entries);
			const result = replaceMultipleURLsWithLinks(text, urlTitleMap, placeholder);
			expect(result).toBe(expected);
		});
	});
});

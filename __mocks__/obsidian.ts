/**
 * Mock for Obsidian API
 * Wired via vitest.config.ts resolve.alias.
 */

import { vi } from 'vitest';

export const requestUrl = vi.fn();

export class App {}
export class Plugin {}
export class PluginSettingTab {}
export class Setting {}
export class Notice {}
export class Editor {}
export class EditorPosition {}
export class MarkdownView {}

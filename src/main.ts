import {Editor, Plugin, Notice} from 'obsidian';
import {DEFAULT_SETTINGS, AutoLinkConverterSettings, AutoLinkConverterSettingTab} from "./settings";
import { handlePaste } from "./handlers/pasteHandler";
import { convertSelectedURLs } from "./handlers/commandHandler";
import { FAILED_TO_CONVERT_MESSAGE } from "./const";

export default class AutoLinkConverterPlugin extends Plugin {
	settings: AutoLinkConverterSettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new AutoLinkConverterSettingTab(this.app, this));

		// Register paste event handler
		this.registerEvent(
			this.app.workspace.on('editor-paste', async (event: globalThis.ClipboardEvent, editor: Editor) =>  {
				try {
					const result = await handlePaste(event, editor, this.settings);
					if (!result) {
						return;
					}
					new Notice(result.message);
				} catch {
					new Notice(FAILED_TO_CONVERT_MESSAGE);
				}
			})
		);

		// Register command to convert selected URLs
		this.addCommand({
			id: 'convert-selected-urls',
			name: 'Convert selected links',
			editorCallback: async (editor: Editor) => {
				try {
					const result = await convertSelectedURLs(editor, this.settings);
					if (!result) {
						return;
					}
					new Notice(result.message);
				} catch {
					new Notice(FAILED_TO_CONVERT_MESSAGE);
				}
			}
		});
	}

	onunload() {
		// Cleanup happens automatically via registerEvent
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AutoLinkConverterSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

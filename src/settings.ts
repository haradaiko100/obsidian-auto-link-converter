import {App, PluginSettingTab, Setting} from "obsidian";
import AutoLinkConverterPlugin from "./main";

export interface AutoLinkConverterSettings {
	enableAutoConvert: boolean;
	placeholderText: string;
}

export const DEFAULT_SETTINGS: AutoLinkConverterSettings = {
	enableAutoConvert: true,
	placeholderText: 'Untitled',
}

export class AutoLinkConverterSettingTab extends PluginSettingTab {
	plugin: AutoLinkConverterPlugin;

	constructor(app: App, plugin: AutoLinkConverterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setHeading().setName('Auto link converter settings');

		new Setting(containerEl)
			.setName('Enable auto-conversion')
			.setDesc('Automatically convert pasted urls to reference-style links')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoConvert)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoConvert = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Placeholder text')
			.setDesc('Text to use when page title cannot be fetched (default: "untitled")')
			.addText(text => text
				.setPlaceholder('Untitled')
				.setValue(this.plugin.settings.placeholderText)
				.onChange(async (value) => {
					this.plugin.settings.placeholderText = value || 'Untitled';
					await this.plugin.saveSettings();
				}));
	}
}

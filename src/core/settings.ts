import type { IDBPDatabase } from "idb";
import type { PluginSettings } from "./interfaces/PluginSettings";
import { SettingsTypes } from "./interfaces/PluginSettings";
import type { Plugin } from "./interfaces/plugin.class";
import type { HighliteSchema } from "./interfaces/DataBaseSchema";

export class Settings {

    private DATABASE!: IDBPDatabase<HighliteSchema>;
    private PLUGIN_LIST!: Plugin[];

    settingsMenu: HTMLElement | null;

    private pluginSettings: { [plugin: string]: HTMLElement };

    constructor() {
        /*
        this.settingsMenu = document.getElementById("hs-settings-menu");
        if (this.settingsMenu == null) {
            console.error("Settings menu setup failed. Something went horribly wrong.");
        }
        let titleBar = document.createElement("div");
        titleBar.className = "hs-settings-menu__section";
        let title = document.createElement("span");
        title.innerHTML = "HighLite Settings";
        title.className = "hs-text--yellow";
        title.style.textDecoration = "underline";
        titleBar.appendChild(title);
        this.settingsMenu!.appendChild(titleBar);

        this.pluginSettings = {};
        */
    }

    init() {
        this.DATABASE = document.highlite.highlite.database.database;
        this.PLUGIN_LIST = document.highlite.highlite.pluginLoader.plugins;
    }

    async registerPlugins() {
        for (let plugin of this.PLUGIN_LIST) {
            let pluginSettings = plugin.settings;
            let settingStore: Record<string, boolean | number | string> | undefined = {};
            settingStore = await this.DATABASE.get('settings', plugin.pluginName);
            if (settingStore) { // store found so load settings
                for (let settingKey in pluginSettings) {
                    if (settingStore[settingKey]) { // found the setting in the store
                        pluginSettings[settingKey]!.value = settingStore[settingKey];
                    }
                }
            }
            await this.storePluginSettings(plugin); // store the settings after load which effectively updates the store with any new settings
            //this.registerPlugin(plugin.pluginName);

        }
    }

    private async storePluginSettings(plugin: Plugin) {
        let pluginSettings = plugin.settings;
        let pluginName = plugin.pluginName;
        let settingStore: Record<string, boolean | number | string> = {};
        for (let settingKey in pluginSettings) {
            let setting = pluginSettings[settingKey]!;
            settingStore[settingKey] = setting.value;
        }
        await this.DATABASE.put('settings', settingStore, pluginName);
    }


    private registerPlugin(pluginName: string) {
        let pluginTitleBar = document.createElement("div");
        pluginTitleBar.className = "hs-settings-menu__section";

        let pluginTitle = document.createElement("span");
        pluginTitle.innerHTML = pluginName;
        pluginTitle.className = "hs-text--yellow";

        pluginTitleBar.appendChild(pluginTitle);
        this.settingsMenu!.appendChild(pluginTitleBar);

        this.pluginSettings[pluginName] = pluginTitleBar;
    }

    private registerSettings(settings: PluginSettings) {
        switch (settings.type) {
            case SettingsTypes.checkbox: {
                checkbox = document.createElement("div");
                checkbox.class = "hs-checkbox-container";

                checkboxElem = document.createElement("input");
                checkboxElem.input = "checkbox";
                checkboxElem.classList = ["hs-input", "hs-checkbox"];
                checkboxElem.change = settings.callback;

                checkboxText = document.createElement("label");
                checkboxText.classList = ["input hs-input-label", "hs-normal-weight-text", "hs-text--white"];
                checkboxText.innerHTML = settings.text;

                checkbox.appendChild(checkboxElem);
                checkbox.appendChild(checkboxText);
            }
        }
    }
}
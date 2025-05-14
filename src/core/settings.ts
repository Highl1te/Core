import type { PluginSettings } from "./interfaces/PluginSettings";
import { SettingsType } from "./interface/PluginSettings";

export class Settings {

    settingsMenu: HTMLElement | null;

    private pluginSettings: {[plugin: string]: HTMLElement};

    constructor() {
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
    }

    registerPlugin(pluginName: string) {
        let pluginTitleBar = document.createElement("div");
        pluginTitleBar.className = "hs-settings-menu__section";

        let pluginTitle = document.createElement("span");
        pluginTitle.innerHTML = pluginName;
        pluginTitle.className = "hs-text--yellow";

        pluginTitleBar.appendChild(pluginTitle);
        this.settingsMenu!.appendChild(pluginTitleBar);

        this.pluginSettings[pluginName] = pluginTitleBar;
    }

    registerSettings(settings: PluginSettings) {
        switch (settings.type) {
            case SettingsType.checkbox {
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
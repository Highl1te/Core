import type { IDBPDatabase } from "idb";
import type { PluginSettings } from "./interfaces/PluginSettings";
import { SettingsTypes } from "./interfaces/PluginSettings";
import type { Plugin } from "./interfaces/plugin.class";
import type { HighliteSchema } from "./interfaces/DataBaseSchema";

export class Settings {

    private DATABASE!: IDBPDatabase<HighliteSchema>;
    private PLUGIN_LIST!: Plugin[];

    private pluginSettings!: { [plugin: string]: HTMLElement };

    panelContainer: HTMLDivElement | null = null;
    currentView: HTMLDivElement | null = null;
    mainSettingsView: HTMLDivElement | null = null;
    pluginSettingsView: HTMLDivElement | null = null;


    init() {
        this.DATABASE = document.highlite.highlite.database.database;
        this.PLUGIN_LIST = document.highlite.highlite.pluginLoader.plugins;
        this.createMenu();
    }

    async registerPlugins() {
        for (let plugin of this.PLUGIN_LIST) {
            let pluginSettings = plugin.settings;
            let settingStore: Record<string, boolean | number | string> | undefined = {};
            settingStore = await this.DATABASE.get('settings', plugin.pluginName);
            if (settingStore) { // store found so load settings
                for (let settingKey in pluginSettings) {
                    if (settingStore[settingKey] !== undefined) { // found the setting in the store
                        pluginSettings[settingKey]!.value = settingStore[settingKey];
                    }
                }
            }
            await this.storePluginSettings(plugin); // store the settings after load which effectively updates the store with any new setting
            this.createPluginSettings(plugin);
        }
    }

    setVisible(visible: boolean) {
        if (this.panelContainer) {
            if (visible) {
                this.panelContainer.style.visibility = 'visible';
            } else {
                this.panelContainer.style.visibility = 'hidden';
            }
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

    private createMenu() {
        // Main Panel Container
        this.panelContainer = document.createElement("div");
        this.panelContainer.id = 'highlite-settings-panel'
        this.panelContainer.style.width = '0px';
        this.panelContainer.style.height = '100%';
        this.panelContainer.style.right = '0px';
        this.panelContainer.style.top = '0px';
        this.panelContainer.style.position = 'absolute';
        this.panelContainer.style.zIndex = '9999';
        this.panelContainer.style.backgroundColor = '#222c';
        this.panelContainer.style.transition = 'width 0.3s ease-in-out';
        this.panelContainer.style.fontFamily = 'Inter';

        // Do not bubble up input events to the game
        this.panelContainer.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("focus", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("blur", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("keydown", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("keyup", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("keyup", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("keypress", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("input", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("change", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("mousedown", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("mouseup", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("mousemove", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("scroll", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("touchstart", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("touchmove", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("touchend", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("touchcancel", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("contextmenu", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("drag", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("dragstart", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("dragend", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("dragenter", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("dragover", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("dragleave", (e) => {
            e.stopPropagation();
        });
        this.panelContainer.addEventListener("drop", (e) => {
            e.stopPropagation();
        });

        // Add a button to the top-left corner to toggle the panel
        const toggleButton = document.createElement("button");
        toggleButton.innerText = "<";
        toggleButton.style.position = 'absolute';
        toggleButton.style.top = '35px';
        toggleButton.style.left = '-18px';
        toggleButton.style.zIndex = '10000';
        toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.padding = '5px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.addEventListener("click", () => {
            if (this.panelContainer?.style.width === '250px') {
                this.panelContainer.style.width = '0px';
                toggleButton.innerText = "<";
                document.getElementById('game-container__game-canvas')!.style.width = '100%';
                (document.getElementById('game-container__game-canvas') as HTMLCanvasElement).width = window.innerWidth;
                document.getElementById('hs-screen-mask')!.style.width = '100%';
                document.getElementById('hs-screen-mask')!.style.transition = 'width 0.3s ease-in-out';
            } else {
                this.panelContainer!.style.width = '250px';
                toggleButton.innerText = ">";
                document.getElementById('game-container__game-canvas')!.style.width = 'calc(100% - 250px)';
                (document.getElementById('game-container__game-canvas') as HTMLCanvasElement).width = window.innerWidth - 250;
                document.getElementById('hs-screen-mask')!.style.width = 'calc(100% - 250px)';
                document.getElementById('hs-screen-mask')!.style.transition = 'width 0.3s ease-in-out';
            }
        });

        this.panelContainer.appendChild(toggleButton);
        document.getElementById('game-container')?.appendChild(this.panelContainer);
        document.getElementById('game-container__game-canvas')!.style.transition = 'width 0.3s ease-in-out';


        // Create a content row holder that will hold all the content rows
        this.mainSettingsView = document.createElement("div");
        this.mainSettingsView.id = 'highlite-settings-content-row-holder'
        this.mainSettingsView.style.width = '100%';
        this.mainSettingsView.style.height = '100%';
        this.mainSettingsView.style.overflowY = 'hidden';
        this.mainSettingsView.style.overflowX = 'hidden';
        this.mainSettingsView.style.display = 'flex';
        this.mainSettingsView.style.flexDirection = 'column';

        // Create a title for the settings panel
        const titleRow = document.createElement("div");
        titleRow.id = 'highlite-settings-title-row'
        titleRow.style.width = '100%';
        titleRow.style.height = '50px';
        titleRow.style.display = 'flex';
        titleRow.style.alignItems = 'center';
        titleRow.style.justifyContent = 'center';

        const title = document.createElement("h1");
        title.innerText = "Highlite Settings";
        title.style.color = 'white';
        title.style.fontSize = '20px';
        title.style.margin = '0px';
        title.style.padding = '0px';
        title.style.fontFamily = 'Inter';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        title.style.width = '100%';
        titleRow.appendChild(title);
        this.mainSettingsView.appendChild(titleRow);

        // For each plugin, create a row with a on/off rocker switch, a plugin name, and a cog icon


        this.currentView = this.mainSettingsView;
        this.panelContainer.appendChild(this.currentView);
    }

    private createPluginSettings(plugin: Plugin) {
        const contentRow = document.createElement("div");
        contentRow.id = `highlite-settings-content-row-${plugin.pluginName}`
        contentRow.style.width = '100%';
        contentRow.style.height = '50px';
        contentRow.style.display = 'flex';
        contentRow.style.alignItems = 'center';
        contentRow.style.borderTop = '1px solid black';
        contentRow.style.borderBottom = '1px solid #444';

        const pluginName = document.createElement("h2");
        pluginName.innerText = plugin.pluginName;
        pluginName.style.color = 'white';
        pluginName.style.fontSize = '16px';
        pluginName.style.margin = '0px';
        pluginName.style.padding = '10px';
        pluginName.style.fontFamily = 'Inter';
        pluginName.style.fontWeight = 'bold';
        pluginName.style.textAlign = 'left';
        pluginName.style.width = '100%';

        /* this is for the enable section */
        const toggleSwitch = document.createElement("input");
        toggleSwitch.type = "checkbox";
        toggleSwitch.checked = plugin.settings.enable.value as boolean;
        toggleSwitch.addEventListener("change", async () => {
            plugin.settings.enable.value = toggleSwitch.checked;
            plugin.settings.enable.callback.call(plugin);
            await this.storePluginSettings(plugin);
        });

        // Cog is the character ⚙️
        const cogIcon = document.createElement("span");
        cogIcon.innerText = "⚙️";
        cogIcon.style.color = 'white';
        cogIcon.style.fontSize = '16px';
        cogIcon.style.margin = '0px';
        cogIcon.style.padding = '10px';
        cogIcon.style.fontFamily = 'Inter';
        cogIcon.style.fontWeight = 'bold';
        cogIcon.style.textAlign = 'right';
        cogIcon.style.cursor = 'pointer';
        cogIcon.addEventListener("click", () => {
            // Open the plugin settings
            this.openPluginSettings(plugin);
        })

        // If plugin only has the enable setting, do not append the cog icon
        if (Object.keys(plugin.settings).length === 1) {
            cogIcon.style.display = 'none';
            toggleSwitch.style.margin = "13px";
        }

        contentRow.appendChild(pluginName);
        contentRow.appendChild(toggleSwitch);
        contentRow.appendChild(cogIcon);
        this.mainSettingsView!.appendChild(contentRow);
    }

    private openPluginSettings(plugin: Plugin) {
        // Remove the current view from the panel container
        if (this.currentView) {
            this.panelContainer?.removeChild(this.currentView);
        }

        // Create a content row holder that will hold all the content rows
        this.pluginSettingsView = document.createElement("div");
        this.pluginSettingsView.id = 'highlite-settings-content-row-holder'
        this.pluginSettingsView.style.width = '100%';
        this.pluginSettingsView.style.height = '100%';
        this.pluginSettingsView.style.overflowY = 'hidden';
        this.pluginSettingsView.style.overflowX = 'hidden';
        this.pluginSettingsView.style.display = 'flex';
        this.pluginSettingsView.style.flexDirection = 'column';

        // Create a title for the settings panel
        const titleRow = document.createElement("div");
        titleRow.id = 'highlite-settings-title-row'
        titleRow.style.width = '100%';
        titleRow.style.height = '50px';
        titleRow.style.display = 'flex';
        titleRow.style.alignItems = 'center';
        titleRow.style.justifyContent = 'center';

        const title = document.createElement("h1");
        title.innerText = `${plugin.pluginName} Settings`;
        title.style.color = 'white';
        title.style.fontSize = '20px';
        title.style.margin = '0px';
        title.style.padding = '0px';
        title.style.fontFamily = 'Inter';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        title.style.width = '100%';
        titleRow.appendChild(title);
        this.pluginSettingsView.appendChild(titleRow);

        // Add a back button in the form of a small row
        const backButton = document.createElement("div");
        backButton.id = 'highlite-settings-back-button'
        backButton.style.width = '100%';
        backButton.style.height = '25px';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.justifyContent = 'center';
        backButton.style.cursor = 'pointer';
        backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        backButton.style.color = 'white';
        backButton.style.fontSize = '16px';
        backButton.style.fontFamily = 'Inter';
        backButton.style.fontWeight = 'bold';
        backButton.style.textAlign = 'center';
        backButton.innerText = "Back";
        backButton.addEventListener("click", () => {
            this.panelContainer?.removeChild(this.currentView!);
            this.currentView = this.mainSettingsView;
            this.panelContainer?.appendChild(this.currentView!);
        });

        this.pluginSettingsView.appendChild(backButton);


        // For each plugin setting, create a row with the setting name and appropriate input
        for (const settingKey in plugin.settings) {
            if (settingKey === 'enable') {
                continue; // Skip the enable setting
            }
            let setting = plugin.settings[settingKey];
            const contentRow = document.createElement("div");
            contentRow.id = `highlite-settings-content-row-${settingKey}`
            contentRow.style.width = '100%';
            contentRow.style.display = 'flex';
            contentRow.style.flexDirection = 'column';
            contentRow.style.justifyContent = 'center';
            contentRow.style.padding = '5px 0px';
            contentRow.style.alignItems = 'center';
            contentRow.style.borderTop = '1px solid black';
            contentRow.style.borderBottom = '1px solid #444';

            const settingName = document.createElement("h2");

            // Capitalize the first letter of the name 
            const capitalizedSettingName = settingKey.replace(/([A-Z])/g, " $1");
            const finalizedSettingName = capitalizedSettingName.charAt(0).toUpperCase() + capitalizedSettingName.slice(1);

            // Add appropriate input and label based on the setting name and type

            switch (setting?.type) {
                case SettingsTypes.checkbox:
                    const toggleSwitch = document.createElement("input");
                    toggleSwitch.type = "checkbox";
                    toggleSwitch.checked = setting.value as boolean;
                    toggleSwitch.addEventListener("change", async () => {
                        setting.value = toggleSwitch.checked;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(plugin);
                        console.log(setting);
                    });
                    // Add a label for the toggle switch
                    const toggleLabel = document.createElement("label");
                    toggleLabel.innerText = finalizedSettingName;
                    toggleLabel.style.color = 'white';
                    toggleLabel.style.fontSize = '16px';
                    toggleLabel.style.margin = '0px';
                    toggleLabel.style.padding = '10px';
                    toggleLabel.style.fontFamily = 'Inter';
                    toggleLabel.style.fontWeight = 'bold';
                    toggleLabel.style.textAlign = 'left';


                    contentRow.appendChild(toggleLabel);
                    contentRow.appendChild(toggleSwitch);
                    break;
                case SettingsTypes.range:
                    const numberInput = document.createElement("input");
                    numberInput.type = "number";
                    numberInput.value = setting.value.toString();
                    // Allow floats
                    numberInput.step = "any";
                    // Prevent game from taking away input focus
                    numberInput.addEventListener("focus", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    numberInput.addEventListener("change", async () => {
                        setting.value = parseFloat(numberInput.value);
                        setting.callback.call(plugin);
                        await this.storePluginSettings(plugin);
                        console.log(setting);
                    });

                    // Add a label for the number input
                    const numberLabel = document.createElement("label");
                    numberLabel.innerText = finalizedSettingName;
                    numberLabel.style.color = 'white';
                    numberLabel.style.fontSize = '16px';
                    numberLabel.style.margin = '0px';
                    numberLabel.style.padding = '10px';
                    numberLabel.style.fontFamily = 'Inter';
                    numberLabel.style.fontWeight = 'bold';
                    numberLabel.style.textAlign = 'left';
                    contentRow.appendChild(numberLabel);
                    contentRow.appendChild(numberInput);

                    break;
                default:
                    console.log(`Unsupported setting type for ${settingKey}: ${typeof plugin.settings[settingKey]}`);
            }


            this.pluginSettingsView.appendChild(contentRow);
        }


        this.currentView = this.pluginSettingsView
        this.panelContainer?.appendChild(this.currentView);
    }


}
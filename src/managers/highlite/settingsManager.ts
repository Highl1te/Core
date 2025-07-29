import { type IDBPDatabase } from 'idb';
import type { HighliteSchema } from '../../interfaces/highlite/database/database.schema';
import { type Plugin } from '../../interfaces/highlite/plugin/plugin.class';
import { SettingsTypes } from '../../interfaces/highlite/plugin/pluginSettings.interface';
import type { PanelManager } from './panelManager';

export class SettingsManager {
    private static instance: SettingsManager;
    private panelManager!: PanelManager;
    private database!: IDBPDatabase<HighliteSchema>;
    private pluginList!: Plugin[];
    private username!: string;
    private databaseSettings!: Record<string, Record<string, boolean | number | string>> | undefined;

    private pluginSettings!: { [plugin: string]: HTMLElement };

    panelContainer: HTMLDivElement | null = null;
    currentView: HTMLDivElement | null = null;
    mainSettingsView: HTMLDivElement | null = null;
    pluginSettingsView: HTMLDivElement | null = null;

    constructor() {
        if (SettingsManager.instance) {
            return SettingsManager.instance;
        }
        SettingsManager.instance = this;
        document.highlite.managers.SettingsManager = this;
    }

    async init() {
        this.database = document.highlite.managers.DatabaseManager.database;
        this.pluginList = document.highlite.plugins;
        this.panelManager = document.highlite.managers.PanelManager;
        this.username = document.highlite.gameHooks.EntityManager.Instance._mainPlayer._nameLowerCase;
        this.createMenu();
        return Promise.resolve();
    }

    deinit(): void {
        this.panelManager.removeMenuItem('🛠️');
        if (this.panelContainer) {
            this.panelContainer.remove();
            this.panelContainer = null;
        }

        if (this.currentView) {
            this.currentView.remove();
            this.currentView = null;
        }

        if (this.mainSettingsView) {
            this.mainSettingsView.remove();
            this.mainSettingsView = null;
        }

        if (this.pluginSettingsView) {
            this.pluginSettingsView.remove();
            this.pluginSettingsView = null;
        }
    }

    /**
     * Create reactive proxies for plugin settings that automatically update UI when hidden property changes
     * @param plugin - The plugin whose settings should be made reactive
     */
    private makeSettingsReactive(plugin: Plugin): void {
        for (const settingKey in plugin.settings) {
            if (settingKey === 'enable') continue; // Skip enable setting

            const setting = plugin.settings[settingKey];

            // Create a proxy that intercepts property changes
            plugin.settings[settingKey] = new Proxy(setting, {
                set: (target, property, value) => {
                    const oldValue = target[property as keyof typeof target];
                    (target as any)[property] = value;

                    // If the hidden property changed, update the UI
                    if (property === 'hidden' && oldValue !== value) {
                        // Small delay to ensure the property change is complete
                        setTimeout(() => {
                            this.refreshPluginSettingsVisibility(plugin);
                        }, 0);
                    }

                    // If the disabled property changed, update the UI
                    if (property === 'disabled' && oldValue !== value) {
                        // Small delay to ensure the property change is complete
                        setTimeout(() => {
                            this.refreshPluginSettingsDisabled(plugin);
                        }, 0);
                    }

                    return true;
                }
            });
        }
    }

    async registerPlugins() {
        // TODO: This may need to be placed in a more explicit step.
        this.databaseSettings = await this.database.get('settings', this.username);

        if (this.databaseSettings) {
            // We have settings for the user, so load them into each plugin
            for (const plugin in this.databaseSettings) {
                const pluginSettingData = this.databaseSettings[plugin];
                for (const settingKey in pluginSettingData) {
                    if (pluginSettingData[settingKey] !== undefined) {
                        // Find the plugin in the plugin list
                        const foundPlugin = this.pluginList.find(
                            p => p.pluginName === plugin
                        );
                        if (foundPlugin) {
                            // If the setting exists, update it
                            if (foundPlugin.settings[settingKey]) {
                                foundPlugin.settings[settingKey]!.value =
                                    pluginSettingData[settingKey];

                                // Call the setting's onLoaded callback if it exists
                                if (foundPlugin.settings[settingKey]!.onLoaded) {
                                    foundPlugin.settings[settingKey]!.onLoaded.call(foundPlugin);
                                }
                            }
                        }
                    }
                }
            }
        }

        // This will either "update" or "create" the settings for each plugin on a user.
        for (let plugin of this.pluginList) {
            await this.storePluginSettings(this.username, plugin);
            this.makeSettingsReactive(plugin);
            this.createPluginSettings(plugin);
        }

        return Promise.resolve();
    }

    private async storePluginSettings(username: string, plugin: Plugin): Promise<void> {
        let pluginSettings = plugin.settings;
        let pluginName = plugin.pluginName;
        let settingStore: Record<string, Record<string, boolean | number | string>> = {};
        settingStore[pluginName] = {};
        for (let settingKey in pluginSettings) {
            let setting = pluginSettings[settingKey]!;
            settingStore[pluginName][settingKey] = setting.value;
        }

        if (!this.databaseSettings) {
            // If the database settings are not initialized, we need to create it
            this.databaseSettings = {};
        }

        this.databaseSettings[pluginName] = settingStore[pluginName];

        await this.database.put('settings', this.databaseSettings!, username);
    }

    private createMenu() {
        this.panelContainer = this.panelManager.requestMenuItem(
            '🛠️',
            'Settings'
        )[1] as HTMLDivElement;
        this.panelContainer.style.display = 'flex';
        this.panelContainer.style.width = '100%';
        this.panelContainer.style.background = 'var(--theme-background)';

        // Create a content row holder that will hold all the content rows
        this.mainSettingsView = document.createElement('div');
        this.mainSettingsView.id = 'highlite-settings-content-row-holder';
        this.mainSettingsView.style.overflowY = 'auto';
        this.mainSettingsView.style.overflowX = 'hidden';
        this.mainSettingsView.style.display = 'flex';
        this.mainSettingsView.style.flexDirection = 'column';
        this.mainSettingsView.style.padding = '8px';
        this.mainSettingsView.style.gap = '2px';

        // Create search bar container
        const searchContainer = document.createElement('div');
        searchContainer.style.display = 'flex';
        searchContainer.style.flexDirection = 'column';
        searchContainer.style.gap = '8px';
        searchContainer.style.marginBottom = '8px';
        searchContainer.style.flexShrink = '0';

        // Create search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search plugins...';
        searchInput.style.padding = '10px 12px';
        searchInput.style.borderRadius = '8px';
        searchInput.style.border = '1px solid var(--theme-border)';
        searchInput.style.background = 'var(--theme-background-mute)';
        searchInput.style.color = 'var(--theme-text-primary)';
        searchInput.style.fontSize = '14px';
        searchInput.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        searchInput.style.outline = 'none';
        searchInput.style.transition = 'all 0.2s ease';
        searchInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

        // Placeholder color
        searchInput.style.setProperty(
            '::placeholder',
            'var(--theme-text-muted)'
        );

        // Add focus styling for search input
        searchInput.addEventListener('focus', e => {
            e.preventDefault();
            e.stopPropagation();
            searchInput.style.border = '1px solid var(--theme-accent)';
            searchInput.style.boxShadow =
                '0 0 0 2px var(--theme-accent-transparent-20)';
        });
        searchInput.addEventListener('blur', () => {
            searchInput.style.border = '1px solid var(--theme-border)';
            searchInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        });

        // Add search functionality
        searchInput.addEventListener('input', e => {
            const searchTerm = (
                e.target as HTMLInputElement
            ).value.toLowerCase();
            this.filterPlugins(searchTerm);
        });

        searchContainer.appendChild(searchInput);
        this.mainSettingsView.appendChild(searchContainer);

        this.currentView = this.mainSettingsView;
        this.panelContainer.appendChild(this.currentView);
    }

    private createPluginSettings(plugin: Plugin) {
        const contentRow = document.createElement('div');
        contentRow.id = `highlite-settings-content-row-${plugin.pluginName}`;
        contentRow.style.minHeight = '48px';
        contentRow.style.display = 'flex';
        contentRow.style.alignItems = 'center';
        contentRow.style.background = 'var(--theme-background-mute)';
        contentRow.style.borderRadius = '8px';
        contentRow.style.border = '1px solid var(--theme-border)';
        contentRow.style.margin = '2px 0';
        contentRow.style.transition = 'all 0.2s ease';
        contentRow.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

        // Add hover effect
        contentRow.addEventListener('mouseenter', () => {
            contentRow.style.background = 'var(--theme-background-light)';
            contentRow.style.border = '1px solid var(--theme-divider)';
            contentRow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
        });
        contentRow.addEventListener('mouseleave', () => {
            contentRow.style.background = 'var(--theme-background-mute)';
            contentRow.style.border = '1px solid var(--theme-border)';
            contentRow.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        });

        // Create a container for plugin name and author
        const pluginInfoContainer = document.createElement('div');
        pluginInfoContainer.style.display = 'flex';
        pluginInfoContainer.style.flexDirection = 'column';
        pluginInfoContainer.style.flex = '1';
        pluginInfoContainer.style.minWidth = '0';
        pluginInfoContainer.style.padding = '12px 16px';

        const pluginName = document.createElement('span');
        pluginName.innerText = plugin.pluginName;
        pluginName.style.color = 'var(--theme-text-primary)';
        pluginName.style.fontSize = '14px';
        pluginName.style.margin = '0px';
        pluginName.style.padding = '0px';
        pluginName.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        pluginName.style.fontWeight = '500';
        pluginName.style.textAlign = 'left';
        pluginName.style.letterSpacing = '0.025em';
        pluginName.style.whiteSpace = 'nowrap';
        pluginName.style.overflow = 'hidden';
        pluginName.style.textOverflow = 'ellipsis';
        pluginName.title = plugin.pluginName; // Show full text on hover

        const pluginAuthor = document.createElement('span');
        pluginAuthor.innerText = `by ${plugin.author}`;
        pluginAuthor.style.color = 'var(--theme-text-muted)';
        pluginAuthor.style.fontSize = '12px';
        pluginAuthor.style.margin = '0px';
        pluginAuthor.style.padding = '0px';
        pluginAuthor.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        pluginAuthor.style.fontWeight = '400';
        pluginAuthor.style.textAlign = 'left';
        pluginAuthor.style.letterSpacing = '0.025em';
        pluginAuthor.style.whiteSpace = 'nowrap';
        pluginAuthor.style.overflow = 'hidden';
        pluginAuthor.style.textOverflow = 'ellipsis';
        pluginAuthor.title = `by ${plugin.author}`; // Show full text on hover

        pluginInfoContainer.appendChild(pluginName);
        pluginInfoContainer.appendChild(pluginAuthor);

        /* this is for the enable section */
        const toggleSwitch = document.createElement('input');
        toggleSwitch.type = 'checkbox';
        toggleSwitch.checked = plugin.settings.enable.value as boolean;
        toggleSwitch.style.width = '18px';
        toggleSwitch.style.height = '18px';
        toggleSwitch.style.marginRight = '12px';
        toggleSwitch.style.cursor = 'pointer';
        toggleSwitch.style.accentColor = 'var(--theme-accent)';
        toggleSwitch.addEventListener('change', async () => {
            plugin.settings.enable.value = toggleSwitch.checked;
            plugin.settings.enable.callback.call(plugin);
            await this.storePluginSettings(this.username, plugin);
        });

        // Cog is the character ⚙️
        const cogIcon = document.createElement('span');
        cogIcon.innerText = '⚙️';
        cogIcon.style.color = 'var(--theme-text-muted)';
        cogIcon.style.fontSize = '18px';
        cogIcon.style.marginRight = '8px';
        cogIcon.style.padding = '8px';
        cogIcon.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        cogIcon.style.textAlign = 'right';
        cogIcon.style.cursor = 'pointer';
        cogIcon.style.borderRadius = '4px';
        cogIcon.style.transition = 'all 0.2s ease';

        // Add hover effect for cog icon
        cogIcon.addEventListener('mouseenter', () => {
            cogIcon.style.color = 'var(--theme-text-primary)';
            cogIcon.style.background = 'var(--theme-border-light)';
            cogIcon.style.transform = 'scale(1.1)';
        });
        cogIcon.addEventListener('mouseleave', () => {
            cogIcon.style.color = 'var(--theme-text-muted)';
            cogIcon.style.background = 'transparent';
            cogIcon.style.transform = 'scale(1)';
        });

        cogIcon.addEventListener('click', () => {
            // Open the plugin settings
            this.openPluginSettings(plugin);
        });

        // If plugin only has the enable setting, do not append the cog icon
        if (Object.keys(plugin.settings).length === 1) {
            cogIcon.style.display = 'none';
        }

        contentRow.appendChild(pluginInfoContainer);
        contentRow.appendChild(cogIcon);
        contentRow.appendChild(toggleSwitch);

        this.mainSettingsView!.appendChild(contentRow);
    }

    private openPluginSettings(plugin: Plugin) {
        // Remove the current view from the panel container
        if (this.currentView) {
            this.panelContainer?.removeChild(this.currentView);
        }

        // Create a content row holder that will hold all the content rows
        this.pluginSettingsView = document.createElement('div');

        this.pluginSettingsView.id = 'highlite-settings-content-row-holder';
        this.pluginSettingsView.style.overflowY = 'auto';
        this.pluginSettingsView.style.overflowX = 'hidden';
        this.pluginSettingsView.style.display = 'flex';
        this.pluginSettingsView.style.flexDirection = 'column';
        this.pluginSettingsView.style.padding = '8px';
        this.pluginSettingsView.style.gap = '8px';
        this.pluginSettingsView.style.background = 'var(--theme-background)';

        // Create a title for the settings panel
        const titleRow = document.createElement('div');
        titleRow.id = 'highlite-settings-title-row';
        titleRow.style.minHeight = '60px';
        titleRow.style.display = 'flex';
        titleRow.style.alignItems = 'center';
        titleRow.style.justifyContent = 'center';
        titleRow.style.flexDirection = 'column';
        titleRow.style.background = 'var(--theme-background-mute)';
        titleRow.style.borderRadius = '8px';
        titleRow.style.border = '1px solid var(--theme-border)';
        titleRow.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        titleRow.style.marginBottom = '8px';
        titleRow.style.padding = '16px';

        const title = document.createElement('h1');
        title.innerText = `${plugin.pluginName} Settings`;
        title.style.color = 'var(--theme-text-primary)';
        title.style.fontSize = '22px';
        title.style.margin = '0px';
        title.style.padding = '0px';
        title.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        title.style.fontWeight = '600';
        title.style.textAlign = 'center';
        title.style.width = '100%';
        title.style.letterSpacing = '0.025em';

        const authorText = document.createElement('span');
        authorText.innerText = `by ${plugin.author}`;
        authorText.style.color = 'var(--theme-text-muted)';
        authorText.style.fontSize = '14px';
        authorText.style.margin = '4px 0 0 0';
        authorText.style.padding = '0px';
        authorText.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        authorText.style.fontWeight = '400';
        authorText.style.textAlign = 'center';
        authorText.style.width = '100%';
        authorText.style.letterSpacing = '0.025em';

        titleRow.appendChild(title);
        titleRow.appendChild(authorText);
        this.pluginSettingsView.appendChild(titleRow);

        // Add a back button in the form of a small row
        const backButton = document.createElement('div');
        backButton.id = 'highlite-settings-back-button';
        backButton.style.width = '100%';
        backButton.style.minHeight = '36px';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.justifyContent = 'center';
        backButton.style.cursor = 'pointer';
        backButton.style.background = 'var(--theme-accent)';
        backButton.style.borderRadius = '6px';
        backButton.style.border = '1px solid var(--theme-accent-dark)';
        backButton.style.color = 'var(--theme-text-dark)';
        backButton.style.fontSize = '14px';
        backButton.style.fontFamily =
            'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        backButton.style.fontWeight = '500';
        backButton.style.textAlign = 'center';
        backButton.style.transition = 'all 0.2s ease';
        backButton.style.boxShadow =
            '0 2px 4px var(--theme-accent-transparent-30)';
        backButton.style.letterSpacing = '0.025em';
        backButton.innerText = '← Back';

        // Add hover effect for back button
        backButton.addEventListener('mouseenter', () => {
            backButton.style.background = 'var(--theme-accent-light)';
            backButton.style.boxShadow =
                '0 4px 8px var(--theme-accent-transparent-40)';
            backButton.style.transform = 'translateY(-1px)';
        });
        backButton.addEventListener('mouseleave', () => {
            backButton.style.background = 'var(--theme-accent)';
            backButton.style.boxShadow =
                '0 2px 4px var(--theme-accent-transparent-30)';
            backButton.style.transform = 'translateY(0)';
        });

        backButton.addEventListener('click', () => {
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
            const contentRow = document.createElement('div');
            contentRow.id = `highlite-settings-content-row-${settingKey}`;
            contentRow.style.display = 'flex';
            contentRow.style.flexDirection = 'column';
            contentRow.style.justifyContent = 'center';
            contentRow.style.padding = '16px';
            contentRow.style.alignItems = 'stretch';
            contentRow.style.background = 'var(--theme-background-mute)';
            contentRow.style.borderRadius = '8px';
            contentRow.style.border = '1px solid var(--theme-border)';
            contentRow.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            contentRow.style.transition = 'all 0.2s ease';

            // Handle hidden property with smooth transition
            if (setting.hidden) {
                contentRow.style.display = 'none';
                contentRow.style.opacity = '0';
                contentRow.style.transform = 'translateY(-10px)';
            } else {
                contentRow.style.opacity = '1';
                contentRow.style.transform = 'translateY(0)';
            }

            // Add hover effect
            contentRow.addEventListener('mouseenter', () => {
                contentRow.style.background = 'var(--theme-background-light)';
                contentRow.style.border = '1px solid var(--theme-divider)';
                contentRow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
            });
            contentRow.addEventListener('mouseleave', () => {
                contentRow.style.background = 'var(--theme-background-mute)';
                contentRow.style.border = '1px solid var(--theme-border)';
                contentRow.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            });

            // Use the setting's text property if available, otherwise generate from key name
            const capitalizedSettingName = settingKey.replace(
                /([A-Z])/g,
                ' $1'
            );
            const finalizedSettingName = setting.text ? setting.text : capitalizedSettingName.charAt(0).toUpperCase() + capitalizedSettingName.slice(1);

            // Add appropriate input and label based on the setting name and type

            switch (setting?.type) {
                case SettingsTypes.checkbox:
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.style.display = 'flex';
                    checkboxContainer.style.alignItems = 'center';
                    checkboxContainer.style.gap = '12px';
                    checkboxContainer.style.minWidth = '0'; // Allow flex item to shrink below content size

                    const toggleSwitch = document.createElement('input');
                    toggleSwitch.type = 'checkbox';
                    toggleSwitch.checked = setting.value as boolean;
                    toggleSwitch.style.width = '20px';
                    toggleSwitch.style.height = '20px';
                    toggleSwitch.style.cursor = 'pointer';
                    toggleSwitch.style.accentColor = 'var(--theme-accent)';
                    toggleSwitch.addEventListener('change', async () => {
                        const newValue = toggleSwitch.checked;

                        // Check validation if it exists
                        if (
                            setting.validation &&
                            !setting.validation(newValue)
                        ) {
                            // Invalid value - revert to previous value and show error styling
                            toggleSwitch.checked = setting.value as boolean;
                            toggleSwitch.style.accentColor = '#ff4444';
                            return;
                        }

                        // Valid value - apply and save
                        setting.value = newValue;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(this.username, plugin);

                        // Refresh visibility of all settings in case dependencies changed
                        this.refreshPluginSettingsVisibility(plugin);

                        // Refresh disabled state of all settings in case dependencies changed
                        this.refreshPluginSettingsDisabled(plugin);

                        // Reset styling to normal
                        toggleSwitch.style.accentColor = 'var(--theme-accent)';
                    });

                    // Add a label for the toggle switch
                    const toggleLabel = document.createElement('label');
                    toggleLabel.innerText = finalizedSettingName;
                    toggleLabel.style.color = 'var(--theme-text-primary)';
                    toggleLabel.style.fontSize = '16px';
                    toggleLabel.style.margin = '0px';
                    toggleLabel.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    toggleLabel.style.fontWeight = '500';
                    toggleLabel.style.cursor = 'pointer';
                    toggleLabel.style.letterSpacing = '0.025em';
                    toggleLabel.style.flex = '1'; // Use flex instead of flexGrow for better control
                    toggleLabel.style.minWidth = '0'; // Allow flex item to shrink below content size
                    toggleLabel.style.whiteSpace = 'nowrap';
                    toggleLabel.style.overflow = 'hidden';
                    toggleLabel.style.textOverflow = 'ellipsis';

                    toggleLabel.addEventListener('click', () => {
                        toggleSwitch.click();
                    });

                    checkboxContainer.appendChild(toggleLabel);
                    checkboxContainer.appendChild(toggleSwitch);
                    contentRow.appendChild(checkboxContainer);
                    break;
                case SettingsTypes.range:
                    const rangeContainer = document.createElement('div');
                    rangeContainer.style.display = 'flex';
                    rangeContainer.style.flexDirection = 'column';
                    rangeContainer.style.gap = '8px';

                    const numberInput = document.createElement('input');
                    numberInput.type = 'number';
                    numberInput.value = setting.value.toString();
                    // Allow floats
                    numberInput.step = 'any';
                    numberInput.style.padding = '8px 12px';
                    numberInput.style.borderRadius = '6px';
                    numberInput.style.border = '1px solid var(--theme-border)';
                    numberInput.style.background = 'var(--theme-background)';
                    numberInput.style.color = 'var(--theme-text-primary)';
                    numberInput.style.fontSize = '14px';
                    numberInput.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    numberInput.style.outline = 'none';
                    numberInput.style.transition = 'all 0.2s ease';

                    // Add focus styling
                    numberInput.addEventListener('focus', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        numberInput.style.border =
                            '1px solid var(--theme-accent)';
                        numberInput.style.boxShadow =
                            '0 0 0 2px var(--theme-accent-transparent-20)';
                    });
                    numberInput.addEventListener('blur', () => {
                        numberInput.style.border =
                            '1px solid var(--theme-border)';
                        numberInput.style.boxShadow = 'none';
                    });

                    if(setting.min !== undefined) {
                        numberInput.min = setting.min.toString();
                    }

                    if(setting.max !== undefined) {
                        numberInput.max = setting.max.toString();
                    }

                    numberInput.addEventListener('change', async () => {
                        const newValue = parseFloat(numberInput.value);
                        const min = parseFloat(numberInput.min);
                        const max = parseFloat(numberInput.max);

                        if(newValue < min || newValue > max) {
                            numberInput.style.border = '1px solid #ff4444';
                            numberInput.style.boxShadow =
                                '0 0 0 2px rgba(255, 68, 68, 0.2)';
                            return;
                        }

                        // Check validation if it exists
                        if (
                            setting.validation &&
                            !setting.validation(newValue)
                        ) {
                            // Invalid value - revert to previous value and show error styling
                            numberInput.value = setting.value.toString();
                            numberInput.style.border = '1px solid #ff4444';
                            numberInput.style.boxShadow =
                                '0 0 0 2px rgba(255, 68, 68, 0.2)';
                            return;
                        }

                        // Valid value - apply and save
                        setting.value = newValue;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(this.username, plugin);

                        // Refresh visibility of all settings in case dependencies changed
                        this.refreshPluginSettingsVisibility(plugin);

                        // Reset styling to normal
                        numberInput.style.border =
                            '1px solid var(--theme-border)';
                        numberInput.style.boxShadow = 'none';
                    });

                    // Add a label for the number input
                    const numberLabel = document.createElement('label');
                    numberLabel.innerText = finalizedSettingName;
                    numberLabel.style.color = 'var(--theme-text-primary)';
                    numberLabel.style.fontSize = '16px';
                    numberLabel.style.margin = '0px';
                    numberLabel.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    numberLabel.style.fontWeight = '500';
                    numberLabel.style.letterSpacing = '0.025em';
                    numberLabel.style.whiteSpace = 'nowrap';
                    numberLabel.style.overflow = 'hidden';
                    numberLabel.style.textOverflow = 'ellipsis';

                    rangeContainer.appendChild(numberLabel);
                    rangeContainer.appendChild(numberInput);
                    contentRow.appendChild(rangeContainer);

                    break;

                case SettingsTypes.color:
                    const colorContainer = document.createElement('div');
                    colorContainer.style.display = 'flex';
                    colorContainer.style.flexDirection = 'column';
                    colorContainer.style.gap = '8px';

                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = (setting.value as string) || '#ff0000';
                    colorInput.style.padding = '8px 12px';
                    colorInput.style.borderRadius = '6px';
                    colorInput.style.border = '1px solid var(--theme-border)';
                    colorInput.style.background = 'var(--theme-background)';
                    colorInput.style.color = 'var(--theme-text-primary)';
                    colorInput.style.fontSize = '14px';
                    colorInput.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    colorInput.style.outline = 'none';
                    colorInput.style.transition = 'all 0.2s ease';
                    colorInput.style.cursor = 'pointer';
                    colorInput.style.width = '100%';
                    colorInput.style.height = '40px';

                    // Add focus styling
                    colorInput.addEventListener('focus', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        colorInput.style.border =
                            '1px solid var(--theme-accent)';
                        colorInput.style.boxShadow =
                            '0 0 0 2px var(--theme-accent-transparent-20)';
                    });
                    colorInput.addEventListener('blur', () => {
                        colorInput.style.border =
                            '1px solid var(--theme-border)';
                        colorInput.style.boxShadow = 'none';
                    });

                    colorInput.addEventListener('change', async () => {
                        const newValue = colorInput.value;

                        // Check validation if it exists
                        if (
                            setting.validation &&
                            !setting.validation(newValue)
                        ) {
                            // Invalid value - revert to previous value and show error styling
                            colorInput.value = setting.value as string;
                            colorInput.style.border = '1px solid #ff4444';
                            colorInput.style.boxShadow =
                                '0 0 0 2px rgba(255, 68, 68, 0.2)';
                            return;
                        }

                        // Valid value - apply and save
                        setting.value = newValue;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(this.username, plugin);

                        // Refresh visibility of all settings in case dependencies changed
                        this.refreshPluginSettingsVisibility(plugin);

                        // Reset styling to normal
                        colorInput.style.border =
                            '1px solid var(--theme-border)';
                        colorInput.style.boxShadow = 'none';
                    });

                    // Add a label for the color input
                    const colorLabel = document.createElement('label');
                    colorLabel.innerText = finalizedSettingName;
                    colorLabel.style.color = 'var(--theme-text-primary)';
                    colorLabel.style.fontSize = '16px';
                    colorLabel.style.margin = '0px';
                    colorLabel.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    colorLabel.style.fontWeight = '500';
                    colorLabel.style.letterSpacing = '0.025em';
                    colorLabel.style.whiteSpace = 'nowrap';
                    colorLabel.style.overflow = 'hidden';
                    colorLabel.style.textOverflow = 'ellipsis';

                    colorContainer.appendChild(colorLabel);
                    colorContainer.appendChild(colorInput);
                    contentRow.appendChild(colorContainer);

                    break;

                case SettingsTypes.text:
                    const textContainer = document.createElement('div');
                    textContainer.style.display = 'flex';
                    textContainer.style.flexDirection = 'column';
                    textContainer.style.gap = '8px';

                    const textInput = document.createElement('input');
                    textInput.type = 'text';
                    textInput.value = (setting.value as string) || '';
                    textInput.style.padding = '8px 12px';
                    textInput.style.borderRadius = '6px';
                    textInput.style.border = '1px solid var(--theme-border)';
                    textInput.style.background = 'var(--theme-background)';
                    textInput.style.color = 'var(--theme-text-primary)';
                    textInput.style.fontSize = '14px';
                    textInput.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    textInput.style.outline = 'none';
                    textInput.style.transition = 'all 0.2s ease';

                    // Add focus styling
                    textInput.addEventListener('focus', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        textInput.style.border =
                            '1px solid var(--theme-accent)';
                        textInput.style.boxShadow =
                            '0 0 0 2px var(--theme-accent-transparent-20)';
                    });
                    textInput.addEventListener('blur', () => {
                        textInput.style.border =
                            '1px solid var(--theme-border)';
                        textInput.style.boxShadow = 'none';
                    });

                    textInput.addEventListener('change', async () => {
                        const newValue = textInput.value;

                        // Check validation if it exists
                        if (
                            setting.validation &&
                            !setting.validation(newValue)
                        ) {
                            // Invalid value - revert to previous value and show error styling
                            textInput.value = setting.value as string;
                            textInput.style.border = '1px solid #ff4444';
                            textInput.style.boxShadow =
                                '0 0 0 2px rgba(255, 68, 68, 0.2)';
                            return;
                        }

                        // Valid value - apply and save
                        setting.value = newValue;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(this.username, plugin);

                        // Refresh visibility of all settings in case dependencies changed
                        this.refreshPluginSettingsVisibility(plugin);

                        // Reset styling to normal
                        textInput.style.border =
                            '1px solid var(--theme-border)';
                        textInput.style.boxShadow = 'none';
                    });

                    // Add a label for the text input
                    const textLabel = document.createElement('label');
                    textLabel.innerText = finalizedSettingName;
                    textLabel.style.color = 'var(--theme-text-primary)';
                    textLabel.style.fontSize = '16px';
                    textLabel.style.margin = '0px';
                    textLabel.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    textLabel.style.fontWeight = '500';
                    textLabel.style.letterSpacing = '0.025em';
                    textLabel.style.whiteSpace = 'nowrap';
                    textLabel.style.overflow = 'hidden';
                    textLabel.style.textOverflow = 'ellipsis';

                    textContainer.appendChild(textLabel);
                    textContainer.appendChild(textInput);
                    contentRow.appendChild(textContainer);

                    break;

                case SettingsTypes.button:
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.flexDirection = 'column';
                    buttonContainer.style.gap = '8px';

                    const buttonInput = document.createElement('button');
                    buttonInput.style.width = '100%';
                    buttonInput.style.minHeight = '36px';
                    buttonInput.style.display = 'flex';
                    buttonInput.style.alignItems = 'center';
                    buttonInput.style.justifyContent = 'center';
                    buttonInput.style.cursor = 'pointer';
                    buttonInput.style.background = 'var(--theme-accent)';
                    buttonInput.style.borderRadius = '6px';
                    buttonInput.style.border =
                        '1px solid var(--theme-accent-dark)';
                    buttonInput.style.color = 'var(--theme-text-dark)';
                    buttonInput.style.fontSize = '14px';
                    buttonInput.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    buttonInput.style.fontWeight = '500';
                    buttonInput.style.textAlign = 'center';
                    buttonInput.style.transition = 'all 0.2s ease';
                    buttonInput.style.boxShadow =
                        '0 2px 4px var(--theme-accent-transparent-30)';
                    buttonInput.style.letterSpacing = '0.025em';
                    buttonInput.innerText = finalizedSettingName;

                    buttonInput.addEventListener('click', async () => {
                        setting.callback.call(plugin);

                        // Refresh visibility of all settings in case dependencies changed
                        this.refreshPluginSettingsVisibility(plugin);

                        // Reset styling to normal
                        buttonInput.style.border =
                            '1px solid var(--theme-border)';
                        buttonInput.style.boxShadow = 'none';
                    });

                    buttonInput.addEventListener('mouseenter', () => {
                        buttonInput.style.background =
                            'var(--theme-accent-light)';
                        buttonInput.style.boxShadow =
                            '0 4px 8px var(--theme-accent-transparent-40)';
                        buttonInput.style.transform = 'translateY(-1px)';
                    });

                    buttonInput.addEventListener('mouseleave', () => {
                        buttonInput.style.background = 'var(--theme-accent)';
                        buttonInput.style.boxShadow =
                            '0 2px 4px var(--theme-accent-transparent-30)';
                        buttonInput.style.transform = 'translateY(0)';
                    });

                    buttonContainer.appendChild(buttonInput);
                    contentRow.appendChild(buttonContainer);
                    break;

                case SettingsTypes.combobox:
                    const comboContainer = document.createElement('div');
                    comboContainer.style.display = 'flex';
                    comboContainer.style.flexDirection = 'column';
                    comboContainer.style.gap = '8px';


                    const comboLabel = document.createElement('label');
                    comboLabel.innerText = finalizedSettingName;
                    comboLabel.style.color = 'var(--theme-text-primary)';
                    comboLabel.style.fontSize = '16px';
                    comboLabel.style.margin = '0px';
                    comboLabel.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    comboLabel.style.fontWeight = '500';
                    comboLabel.style.letterSpacing = '0.025em';
                    comboLabel.style.whiteSpace = 'nowrap';
                    comboLabel.style.overflow = 'hidden';
                    comboLabel.style.textOverflow = 'ellipsis';

                    if (!setting.options || !Array.isArray(setting.options) || setting.options.length < 1) {
                        comboLabel.innerText = "Add a dataset array";
                        contentRow.appendChild(comboLabel);
                        break;
                    }

                    const comboSelect = document.createElement('select');

                    comboSelect.addEventListener('change', async () => {
                        const newValue = comboSelect.value;
                        setting.value = newValue;
                        setting.callback.call(plugin);
                        await this.storePluginSettings(this.username, plugin);
                        this.refreshPluginSettingsVisibility(plugin);
                    });

                    // Build combobox list from dataset
                    for (let i = 0; i < setting.options.length; i++) {
                        const option = String(setting.options[i]);
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        comboSelect.appendChild(opt);
                    }

                    if (
                        typeof setting.value !== 'string' ||
                        !setting.options.includes(setting.value)
                    ) {
                        setting.value = setting.options[0];
                        comboSelect.selectedIndex = 0;
                        comboSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    comboSelect.value = setting.value as string;

                    comboSelect.addEventListener('focus', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        comboSelect.style.border =
                            '1px solid var(--theme-accent)';
                        comboSelect.style.boxShadow =
                            '0 0 0 2px var(--theme-accent-transparent-20)';
                    });

                    comboSelect.addEventListener('blur', () => {
                        comboSelect.style.border =
                            '1px solid var(--theme-border)';
                        comboSelect.style.boxShadow = 'none';
                    });

                    comboSelect.style.padding = '8px 12px';
                    comboSelect.style.borderRadius = '6px';
                    comboSelect.style.border = '1px solid var(--theme-border)';
                    comboSelect.style.background = 'var(--theme-background)';
                    comboSelect.style.color = 'var(--theme-text-primary)';
                    comboSelect.style.fontSize = '14px';
                    comboSelect.style.fontFamily =
                        'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
                    comboSelect.style.outline = 'none';
                    comboSelect.style.transition = 'all 0.2s ease';
                    comboSelect.style.cursor = 'pointer';
                    comboSelect.style.width = '100%';
                    comboSelect.style.height = '36px';

                    comboContainer.appendChild(comboLabel);
                    comboContainer.appendChild(comboSelect);
                    contentRow.appendChild(comboContainer);

                    break;

                default:
                    // I don't think it should ever reach the default case
                    throw new Error(`[Highlite] Unsupported setting type for ${settingKey}`);
            }
    
            contentRow.title = setting.description
                ? setting.description
                : finalizedSettingName;

            // Handle initially disabled state
            if (setting.disabled) {
                const inputs = contentRow.querySelectorAll('input, button');
                inputs.forEach(input => {
                    const htmlInput = input as HTMLInputElement | HTMLButtonElement;
                    htmlInput.disabled = true;
                    htmlInput.style.opacity = '0.5';
                    htmlInput.style.cursor = 'not-allowed';
                    htmlInput.style.filter = 'grayscale(50%)';
                });
            }

            this.pluginSettingsView.appendChild(contentRow);
        }

        this.currentView = this.pluginSettingsView;
        this.panelContainer?.appendChild(this.currentView);
    }

    private filterPlugins(searchTerm: string) {
        // Get all plugin rows
        const pluginRows = this.mainSettingsView?.querySelectorAll(
            '[id^="highlite-settings-content-row-"]'
        );

        if (!pluginRows) return;

        pluginRows.forEach(row => {
            const htmlRow = row as HTMLElement;
            // Skip the search container
            if (htmlRow.id === 'highlite-settings-content-row-holder') return;

            // Get the plugin info container
            const pluginInfoContainer = htmlRow.querySelector('div');
            if (
                pluginInfoContainer &&
                pluginInfoContainer.style.flexDirection === 'column'
            ) {
                const pluginNameSpan = pluginInfoContainer
                    .children[0] as HTMLElement;
                const pluginAuthorSpan = pluginInfoContainer
                    .children[1] as HTMLElement;

                if (pluginNameSpan && pluginAuthorSpan) {
                    const pluginName = pluginNameSpan.innerText.toLowerCase();
                    const pluginAuthor =
                        pluginAuthorSpan.innerText.toLowerCase();

                    // Show/hide based on search term matching name or author
                    if (
                        searchTerm === '' ||
                        pluginName.includes(searchTerm) ||
                        pluginAuthor.includes(searchTerm)
                    ) {
                        htmlRow.style.display = 'flex';
                    } else {
                        htmlRow.style.display = 'none';
                    }
                }
            }
        });
    }

    // Method to update the settings panel UI when values change programmatically
    updatePluginSettingsUI(plugin: Plugin) {
        // Only update if we're currently viewing this plugin's settings
        if (
            !this.pluginSettingsView ||
            this.currentView !== this.pluginSettingsView
        ) {
            return;
        }

        // Check if this is the right plugin by looking at the title
        const titleElement = this.pluginSettingsView.querySelector('h1');
        if (
            !titleElement ||
            !titleElement.innerText.includes(plugin.pluginName)
        ) {
            return;
        }

        // Update each setting input element
        for (const settingKey in plugin.settings) {
            if (settingKey === 'enable') {
                continue; // Skip the enable setting
            }

            const setting = plugin.settings[settingKey];
            const contentRow = this.pluginSettingsView.querySelector(
                `#highlite-settings-content-row-${settingKey}`
            );

            if (!contentRow || !setting) continue;

            switch (setting.type) {
                case SettingsTypes.checkbox:
                    const checkbox = contentRow.querySelector(
                        'input[type="checkbox"]'
                    ) as HTMLInputElement;
                    if (checkbox) {
                        checkbox.checked = setting.value as boolean;
                    }
                    break;

                case SettingsTypes.range:
                    const numberInput = contentRow.querySelector(
                        'input[type="number"]'
                    ) as HTMLInputElement;
                    if (numberInput) {
                        numberInput.value = setting.value.toString();
                    }
                    break;

                case SettingsTypes.color:
                    const colorInput = contentRow.querySelector(
                        'input[type="color"]'
                    ) as HTMLInputElement;
                    if (colorInput) {
                        colorInput.value = setting.value as string;
                    }
                    break;

                case SettingsTypes.text:
                    const textInput = contentRow.querySelector(
                        'input[type="text"]'
                    ) as HTMLInputElement;
                    if (textInput) {
                        textInput.value = setting.value as string;
                    }
                    break;
                case SettingsTypes.combobox:
                    const comboInput = contentRow.querySelector(
                        'input[list]'
                    ) as HTMLInputElement;
                    if (comboInput) {
                        comboInput.value = setting.value as string;
                    }
                    break;
            }
        }
    }

    /**
     * Refresh the visibility of all settings for a plugin based on their current hidden state
     * @param plugin - The plugin whose settings visibility should be refreshed
     */
    private refreshPluginSettingsVisibility(plugin: Plugin): void {
        for (const settingKey in plugin.settings) {
            if (settingKey === 'enable') continue; // Skip enable setting

            const setting = plugin.settings[settingKey];
            const contentRow = document.getElementById(`highlite-settings-content-row-${settingKey}`);

            if (!contentRow) continue;

            if (setting.hidden) {
                // Hide with animation
                contentRow.style.opacity = '0';
                contentRow.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    contentRow.style.display = 'none';
                }, 200);
            } else {
                // Show with animation
                if (contentRow.style.display === 'none') {
                    contentRow.style.display = 'flex';

                    // Force reflow
                    contentRow.offsetHeight;

                    setTimeout(() => {
                        contentRow.style.opacity = '1';
                        contentRow.style.transform = 'translateY(0)';
                    }, 10);
                }
            }
        }
    }

    /**
     * Refresh the disabled state of all settings for a plugin based on their current disabled state
     * @param plugin - The plugin whose settings disabled state should be refreshed
     */
    private refreshPluginSettingsDisabled(plugin: Plugin): void {
        for (const settingKey in plugin.settings) {
            if (settingKey === 'enable') continue; // Skip enable setting

            const setting = plugin.settings[settingKey];
            const contentRow = document.getElementById(`highlite-settings-content-row-${settingKey}`);

            if (!contentRow) continue;

            // Find all input elements in the content row
            const inputs = contentRow.querySelectorAll('input, button');

            inputs.forEach(input => {
                const htmlInput = input as HTMLInputElement | HTMLButtonElement;
                if (setting.disabled) {
                    // Disable with visual feedback
                    htmlInput.disabled = true;
                    htmlInput.style.opacity = '0.5';
                    htmlInput.style.cursor = 'not-allowed';
                    htmlInput.style.filter = 'grayscale(50%)';
                } else {
                    // Enable with normal styling
                    htmlInput.disabled = false;
                    htmlInput.style.opacity = '1';
                    htmlInput.style.cursor = 'pointer';
                    htmlInput.style.filter = 'none';
                }
            });
        }
    }

    /**
     * Toggle the visibility of a specific setting for a plugin with smooth animation
     * @param pluginName - The name of the plugin
     * @param settingKey - The key of the setting to toggle
     * @param hidden - Optional: force hidden state (true/false), otherwise toggles current state
     */
    public toggleSettingVisibility(pluginName: string, settingKey: string, hidden?: boolean): void {
        const contentRow = document.getElementById(`highlite-settings-content-row-${settingKey}`);
        if (!contentRow) return;

        // Find the plugin and setting
        const plugin = this.pluginList.find(p => p.pluginName === pluginName);
        if (!plugin || !plugin.settings[settingKey]) return;

        const setting = plugin.settings[settingKey];
        const newHiddenState = hidden !== undefined ? hidden : !setting.hidden;

        // Update the setting's hidden property
        setting.hidden = newHiddenState;

        if (newHiddenState) {
            // Hide with animation
            contentRow.style.opacity = '0';
            contentRow.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                contentRow.style.display = 'none';
            }, 200); // Wait for transition to complete
        } else {
            // Show with animation
            contentRow.style.display = 'flex';

            // Force reflow to ensure display change takes effect
            contentRow.offsetHeight;

            setTimeout(() => {
                contentRow.style.opacity = '1';
                contentRow.style.transform = 'translateY(0)';
            }, 10); // Small delay to ensure smooth transition
        }
    }

    /**
     * Show a hidden setting with smooth animation
     * @param pluginName - The name of the plugin
     * @param settingKey - The key of the setting to show
     */
    public showSetting(pluginName: string, settingKey: string): void {
        this.toggleSettingVisibility(pluginName, settingKey, false);
    }

    /**
     * Hide a setting with smooth animation
     * @param pluginName - The name of the plugin
     * @param settingKey - The key of the setting to hide
     */
    public hideSetting(pluginName: string, settingKey: string): void {
        this.toggleSettingVisibility(pluginName, settingKey, true);
    }
}

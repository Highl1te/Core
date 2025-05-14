export enum SettingsTypes {
    checkbox,
}

export interface PluginSettings {
    text: string;
    type: SettingsTypes;
    callback: Function;
}
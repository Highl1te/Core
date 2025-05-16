import type { PluginSettings } from "./PluginSettings";

export abstract class Plugin {
    abstract pluginName : string;

    abstract init(): void;
    abstract start(): void;
    abstract stop(): void;
    abstract settings : {
        [key: string] : PluginSettings;
    }
    
    postInit?(): void;

    gameHooks = document.highlite.gameHooks

    // Log seems to be broken from loading HighSpell Client
    log(...args: any[]) : void {
        console.info(`[Highlite][${this.pluginName} Plugin]`, ...args);
    }

    info(...args: any[]) : void {
        console.info(`[Highlite][${this.pluginName} Plugin]`, ...args);
    }

    warn(...args: any[]) : void {
        console.warn(`[Highlite][${this.pluginName} Plugin]`, ...args);
    }

    error(...args: any[]) : void {
        console.error(`[Highlite][${this.pluginName} Plugin]`, ...args);
    }
}

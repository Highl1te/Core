import { Plugin } from "./interfaces/plugin.class";

export class PluginLoader {
    plugins : Array<Plugin> = []

    constructor() {
        this.plugins = [];
    }

    registerPlugin<T extends Plugin>(pluginClass : new () => T) : boolean {
        const pluginInstance = new pluginClass();
        console.info(`[Highlite] New plugin ${pluginInstance.pluginName} registered`);

        document.highlite.plugins.push(pluginInstance);
        this.plugins.push(pluginInstance);

        return true;
    }

    startAll() {
        for (const plugin of this.plugins) {
            plugin.start();
        }
    }

    stopAll() {
        for (const plugin of this.plugins) {
            plugin.stop();
        }
    }

    initAll() {
        for (const plugin of this.plugins) {
            plugin.init();
        }
    }

    postInitAll() {
        for (const plugin of this.plugins) {
            if (plugin.postInit) {
                plugin.postInit();
            }
        }
    }
}
import type { PluginLoader } from "./pluginLoader"

declare global {
    interface Window {
        [key: string]: any,
    }

    interface Document {
        highlite: {
            pluginLoader: PluginLoader,
            [key: string]: any,
        },

        client: {
            [key: string]: any,
        },

        game: {
            [key: string]: any,
        }
    }
}
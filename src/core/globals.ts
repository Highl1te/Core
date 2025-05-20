import { Highlite } from "./core"

declare global {
    interface Window {
        [key: string]: any,
    }

    interface Document {
        highlite: {
            highlite: Highlite,
            [key: string]: any,
        },

        BABYLON: {
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
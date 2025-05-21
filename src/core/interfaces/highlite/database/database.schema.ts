import type { DBSchema } from "idb";

export interface HighliteSchema extends DBSchema {
    settings: {
        key: string; //plugin name
        value: Record<string, boolean | number | string>;
    };
}
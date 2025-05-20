import { openDB, type IDBPDatabase } from "idb";
import type { HighliteSchema } from "./core/interfaces/DataBaseSchema";

export class Database {
    database!: IDBPDatabase<HighliteSchema>;

   async initDB() {
        this.database = await openDB<HighliteSchema>('HighliteDatabase', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            }
        });
    }
}
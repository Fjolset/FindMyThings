import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Item, AppSettings } from "../../types/item";

interface FindMyStuffDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: { updatedAt: string };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = "find-my-stuff";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FindMyStuffDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<FindMyStuffDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FindMyStuffDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("items")) {
          const store = db.createObjectStore("items", { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_SETTINGS: AppSettings = {
  speechLang: "da-DK",
  ttsEnabled: true,
  autoReadAnswers: true,
  theme: "system",
  demoDataEnabled: true,
};

/** Whether IndexedDB is usable in this environment. */
export function isStorageAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

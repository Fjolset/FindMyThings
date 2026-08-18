import { getDB, isStorageAvailable, DEFAULT_SETTINGS } from "./db";
import type { AppSettings } from "../../types/item";

const SETTINGS_KEY = "app-settings";
let memorySettings: AppSettings = { ...DEFAULT_SETTINGS };
let usingMemoryFallback = !isStorageAvailable();

class SettingsStore {
  async get(): Promise<AppSettings> {
    try {
      if (usingMemoryFallback) return memorySettings;
      const db = await getDB();
      const stored = (await db.get("settings", SETTINGS_KEY)) as AppSettings | undefined;
      return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
    } catch (err) {
      console.error("Kunne ikke læse indstillinger", err);
      return memorySettings;
    }
  }

  async save(settings: AppSettings): Promise<void> {
    memorySettings = settings;
    try {
      if (usingMemoryFallback) return;
      const db = await getDB();
      await db.put("settings", settings, SETTINGS_KEY);
    } catch (err) {
      console.error("Kunne ikke gemme indstillinger", err);
      usingMemoryFallback = true;
    }
  }
}

export const settingsStore = new SettingsStore();

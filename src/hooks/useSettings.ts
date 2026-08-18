import { useCallback, useEffect, useState } from "react";
import { settingsStore } from "../services/storage/settingsStore";
import { DEFAULT_SETTINGS } from "../services/storage/db";
import type { AppSettings } from "../types/item";

export function applyTheme(theme: AppSettings["theme"]) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", !!dark);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await settingsStore.get();
      setSettings(stored);
      applyTheme(stored.theme);
      setLoading(false);
    })();
  }, []);

  // Keep the theme in sync with OS-level changes when the user has chosen "system".
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const handler = () => {
      if (settings.theme === "system") applyTheme("system");
    };
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, [settings.theme]);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      settingsStore.save(next);
      applyTheme(next.theme);
      return next;
    });
  }, []);

  return { settings, loading, update };
}

import { useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { TagCard } from "../components/TagCard";
import { Button } from "../components/ui/Button";
import { useSettings } from "../hooks/useSettings";
import { itemStore } from "../services/storage/itemStore";
import { DEMO_ITEMS } from "../data/demoItems";

const LANGUAGES = [
  { value: "da-DK", label: "Dansk" },
  { value: "en-US", label: "Engelsk (US)" },
  { value: "en-GB", label: "Engelsk (UK)" },
  { value: "de-DE", label: "Tysk" },
];

export function Settings() {
  const { settings, update } = useSettings();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const json = await itemStore.exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `find-my-stuff-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Data eksporteret.");
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const count = await itemStore.importFromJson(text);
      setStatus(`${count} ting importeret.`);
    } catch {
      setStatus("Kunne ikke læse filen. Sørg for, at det er en eksporteret fil fra Find My Stuff.");
    }
  }

  async function handleClearAll() {
    await itemStore.clearAll();
    setConfirmClear(false);
    setStatus("Alle ting er slettet.");
  }

  async function handleToggleDemoData(enabled: boolean) {
    await update({ demoDataEnabled: enabled });
    if (enabled) {
      await itemStore.bulkPut(DEMO_ITEMS);
      setStatus("Eksempeldata tilføjet.");
    } else {
      for (const demoItem of DEMO_ITEMS) {
        await itemStore.remove(demoItem.id);
      }
      setStatus("Eksempeldata fjernet.");
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-5 pb-10">
      <PageHeader title="Indstillinger" />

      {status && (
        <p role="status" className="rounded-xl bg-moss-light px-4 py-2 text-center text-moss-deep">
          {status}
        </p>
      )}

      <SettingsSection title="Stemme">
        <SettingRow label="Sprog til talegenkendelse">
          <select
            value={settings.speechLang}
            onChange={(e) => update({ speechLang: e.target.value })}
            className="focus-ring rounded-xl border border-line bg-white px-3 py-2 text-ink dark:border-line-dark dark:bg-white/10 dark:text-ink-dark"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Læs svar højt">
          <ToggleSwitch checked={settings.ttsEnabled} onChange={(v) => update({ ttsEnabled: v })} label="Læs svar højt" />
        </SettingRow>
        <SettingRow label="Læs svar højt automatisk">
          <ToggleSwitch checked={settings.autoReadAnswers} onChange={(v) => update({ autoReadAnswers: v })} label="Læs svar automatisk" />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Data">
        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={handleExport}>
            Eksportér data
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Importér data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          {confirmClear ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-coral-light p-4">
              <p className="text-center text-coral">Er du sikker? Alle gemte ting bliver slettet permanent.</p>
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1" onClick={handleClearAll}>
                  Ja, slet alt
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmClear(false)}>
                  Fortryd
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmClear(true)}>
              Slet alle data
            </Button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Udseende">
        <SettingRow label="Tema">
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => update({ theme })}
                className={`focus-ring rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  settings.theme === theme
                    ? "bg-moss text-white"
                    : "bg-white/70 text-ink dark:bg-white/10 dark:text-ink-dark"
                }`}
              >
                {theme === "light" ? "Lys" : theme === "dark" ? "Mørk" : "System"}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Udvikling">
        <SettingRow label="Eksempeldata">
          <ToggleSwitch checked={settings.demoDataEnabled} onChange={handleToggleDemoData} label="Eksempeldata" />
        </SettingRow>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-ink dark:text-ink-dark">{title}</h2>
      <TagCard className="flex flex-col gap-4 p-5 pl-12">{children}</TagCard>
    </section>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink dark:text-ink-dark">{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`focus-ring relative h-8 w-14 rounded-full transition-colors ${checked ? "bg-moss" : "bg-line dark:bg-line-dark"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

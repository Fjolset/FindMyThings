import { useState } from "react";
import type { ParsedItem } from "../types/item";
import { iconForItem } from "../utils/icons";
import { Button } from "./ui/Button";
import { TagCard } from "./TagCard";

interface ConfirmationCardProps {
  items: ParsedItem[];
  onConfirm: (items: { name: string; location: string }[]) => void;
  onRetry: () => void;
  confirmLabel?: string;
}

export function ConfirmationCard({ items, onConfirm, onRetry, confirmLabel = "Gem" }: ConfirmationCardProps) {
  const [draft, setDraft] = useState(items.map((i) => ({ name: i.name, location: i.location })));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <div className="animate-pop mx-auto flex w-full max-w-sm flex-col gap-4">
      <p className="text-center text-lg font-semibold text-ink-soft dark:text-ink-soft-dark">
        {draft.length > 1 ? "Jeg har gemt:" : "Jeg har gemt:"}
      </p>
      {draft.map((entry, idx) => (
        <TagCard key={idx} className="p-5 pl-12" accentColor="moss">
          {editingIndex === idx ? (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">
                Ting
                <input
                  className="focus-ring mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-lg text-ink dark:border-line-dark dark:bg-white/10 dark:text-ink-dark"
                  value={entry.name}
                  onChange={(e) => updateDraft(idx, { name: e.target.value })}
                  autoFocus
                />
              </label>
              <label className="text-sm font-medium text-ink-soft dark:text-ink-soft-dark">
                Placering
                <input
                  className="focus-ring mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-lg text-ink dark:border-line-dark dark:bg-white/10 dark:text-ink-dark"
                  value={entry.location}
                  onChange={(e) => updateDraft(idx, { location: e.target.value })}
                />
              </label>
              <Button variant="secondary" onClick={() => setEditingIndex(null)}>
                Færdig
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingIndex(idx)}
              className="focus-ring flex w-full items-center gap-4 text-left"
              aria-label={`Ret ${entry.name}`}
            >
              <span className="text-3xl" aria-hidden="true">
                {iconForItem(entry.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-semibold text-ink dark:text-ink-dark">{entry.name}</p>
                <p className="truncate text-ink-soft dark:text-ink-soft-dark">📍 {entry.location}</p>
              </div>
              <span className="text-sm text-honey-deep">Ret</span>
            </button>
          )}
        </TagCard>
      ))}

      <div className="mt-2 flex flex-col gap-3">
        <Button variant="primary" size="lg" onClick={() => onConfirm(draft)} disabled={draft.some((d) => !d.name.trim() || !d.location.trim())}>
          ✓ {confirmLabel}
        </Button>
        <Button variant="ghost" size="lg" onClick={onRetry}>
          ✕ Prøv igen
        </Button>
      </div>
    </div>
  );

  function updateDraft(idx: number, patch: Partial<{ name: string; location: string }>) {
    setDraft((prev) => prev.map((entry, i) => (i === idx ? { ...entry, ...patch } : entry)));
  }
}

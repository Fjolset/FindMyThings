import type { HistoryEntry } from "../types/item";
import { formatRelativeDa } from "../utils/formatDate";

export function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) return null;
  return (
    <ol className="relative ml-3 border-l-2 border-line pl-6 dark:border-line-dark">
      {history.map((entry, index) => (
        <li key={entry.id} className="relative pb-6 last:pb-0">
          <span
            className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-paper dark:border-paper-dark ${
              index === 0 ? "bg-moss" : "bg-line dark:bg-line-dark"
            }`}
            aria-hidden="true"
          />
          <p className={`font-medium ${index === 0 ? "text-ink dark:text-ink-dark" : "text-ink-soft dark:text-ink-soft-dark"}`}>
            {entry.location}
          </p>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark">{formatRelativeDa(entry.changedAt)}</p>
        </li>
      ))}
    </ol>
  );
}

import type { SearchMatch } from "../types/item";
import { iconForItem } from "../utils/icons";
import { TagCard } from "./TagCard";

export function AmbiguousChooser({ matches, onSelect }: { matches: SearchMatch[]; onSelect: (id: string) => void }) {
  return (
    <div className="animate-rise mx-auto flex w-full max-w-sm flex-col gap-4">
      <p className="text-center font-display text-xl font-semibold text-ink dark:text-ink-dark">
        Mener du {matches.map((m) => m.item.name.toLowerCase()).join(" eller ")}?
      </p>
      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <TagCard key={m.item.id} as="button" onClick={() => onSelect(m.item.id)} className="p-4 pl-12" accentColor="honey">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {iconForItem(m.item.name, m.item.category)}
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark">{m.item.name}</p>
                <p className="text-sm text-ink-soft dark:text-ink-soft-dark">📍 {m.item.location}</p>
              </div>
            </div>
          </TagCard>
        ))}
      </div>
    </div>
  );
}

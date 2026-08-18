import { iconForItem } from "../utils/icons";

export function SuccessCelebration({ items }: { items: { name: string; location: string }[] }) {
  return (
    <div className="animate-pop mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center">
      <span className="text-5xl" aria-hidden="true">
        ✨
      </span>
      <p className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Gemt!</p>
      <div className="flex w-full flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-moss-light px-5 py-3 text-moss-deep">
            <p className="font-display text-lg font-semibold">
              {iconForItem(item.name)} {item.name}
            </p>
            <p>📍 {item.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

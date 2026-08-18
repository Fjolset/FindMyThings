import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-rise flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line px-6 py-12 text-center dark:border-line-dark">
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="font-display text-xl font-semibold text-ink dark:text-ink-dark">{title}</p>
      {description && <p className="max-w-xs text-ink-soft dark:text-ink-soft-dark">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

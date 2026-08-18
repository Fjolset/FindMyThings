import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="flex items-start gap-3 px-5 pb-2 pt-6">
      {onBack !== undefined && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="Tilbage"
          className="focus-ring mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-xl shadow-tag dark:bg-white/10"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink dark:text-ink-dark">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-ink-soft dark:text-ink-soft-dark">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

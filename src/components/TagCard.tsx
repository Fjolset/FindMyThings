import type { ReactNode } from "react";

interface TagCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
  accentColor?: "moss" | "honey" | "coral" | "slate";
  size?: "sm" | "md";
}

const ACCENT_BG: Record<NonNullable<TagCardProps["accentColor"]>, string> = {
  moss: "bg-moss-light",
  honey: "bg-honey-light",
  coral: "bg-coral-light",
  slate: "bg-white/60 dark:bg-white/10",
};

export function TagCard({ children, className = "", as = "div", onClick, accentColor = "slate", size = "md" }: TagCardProps) {
  const holeSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const content = (
    <>
      <span
        className={`pointer-events-none absolute left-4 top-4 ${holeSize} rounded-full border-2 border-line dark:border-line-dark ${ACCENT_BG[accentColor]}`}
        aria-hidden="true"
      />
      {children}
    </>
  );

  const baseClasses = `relative rounded-3xl border border-line bg-white/70 shadow-tag dark:border-line-dark dark:bg-white/[0.04] ${className}`;

  if (as === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`focus-ring text-left transition-transform duration-150 active:scale-[0.98] ${baseClasses}`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

export type { TagCardProps };

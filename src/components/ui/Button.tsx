import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "lg" | "md";
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-moss text-white hover:bg-moss-deep active:scale-[0.98]",
  secondary: "bg-honey-light text-honey-deep hover:bg-honey/20 active:scale-[0.98]",
  ghost: "bg-transparent text-ink hover:bg-black/5 dark:text-ink-dark dark:hover:bg-white/5",
  danger: "bg-coral-light text-coral hover:bg-coral/20 active:scale-[0.98]",
};

export function Button({ variant = "primary", size = "md", icon, children, className = "", ...rest }: ButtonProps) {
  const sizeClasses = size === "lg" ? "px-6 py-4 text-lg rounded-2xl gap-3" : "px-4 py-3 text-base rounded-xl gap-2";
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

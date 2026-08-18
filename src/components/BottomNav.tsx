import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Hjem", icon: "🏠", end: true },
  { to: "/find", label: "Find", icon: "🔎", end: false },
  { to: "/items", label: "Ting", icon: "📦", end: false },
  { to: "/settings", label: "Indstillinger", icon: "⚙️", end: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur dark:border-line-dark dark:bg-paper-dark/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Hovednavigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `focus-ring flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "text-moss dark:text-moss-light" : "text-ink-soft dark:text-ink-soft-dark"
                }`
              }
            >
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

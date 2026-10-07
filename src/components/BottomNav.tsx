import { Link } from "@tanstack/react-router";
import { useEliteMode } from "../lib/elite-mode-context";

// Primary navigation lives along the BOTTOM of the viewport (like a native app)
// rather than down the side. This frees the entire horizontal width for the
// trader's command center and keeps the most-used destinations within thumb reach.
const NAV_ITEMS = [
  {
    to: "/dashboard" as const,
    label: "Command",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/recap" as const,
    label: "Recap",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <path d="M7 7l2 2 4-4" />
        <path d="M7 12h6" />
        <path d="M7 15h4" />
      </svg>
    ),
  },
  {
    to: "/os" as const,
    label: "Behaviour",
    primary: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 5v5l3 2" />
      </svg>
    ),
  },
  {
    to: "/history" as const,
    label: "History",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 5.5V10l3 2" />
      </svg>
    ),
  },
  {
    to: "/journal" as const,
    label: "Journal",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M7 7h6M7 10h6M7 13h4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const { eliteMode } = useEliteMode();
  const brand = eliteMode ? "#ff3d00" : "var(--color-brand)";

  return (
    <nav
      className="flex-shrink-0 border-t bg-[var(--color-surface-elevated)] z-40 bottom-nav-safe"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto max-w-3xl flex items-stretch justify-around px-1 sm:px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const baseClass =
            "relative flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[10px] font-semibold no-underline transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]";
          return (
            <Link
              key={item.to}
              to={item.to}
              className={baseClass}
              activeProps={{
                className: `${baseClass} elite-nav-active`,
                style: {
                  color: brand,
                  backgroundColor: eliteMode
                    ? "rgba(255,61,0,0.1)"
                    : "rgba(0,255,136,0.1)",
                },
              }}
            >
              <span
                className={item.primary ? "flex items-center justify-center" : ""}
                style={
                  item.primary
                    ? {
                        marginTop: -14,
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: brand,
                        color: eliteMode ? "#fff" : "var(--color-surface)",
                        boxShadow: eliteMode
                          ? "0 0 18px rgba(255,61,0,0.45)"
                          : "0 6px 16px rgba(0,255,136,0.25)",
                      }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

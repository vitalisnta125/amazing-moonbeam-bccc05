import { Link } from "@tanstack/react-router";
import { useIdentity } from "../lib/identity-context";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function Navigation() {
  const { user, ready, logout } = useIdentity();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  if (!ready || !user) return null;

  const links = [
    { to: "/dashboard" as const, label: "Command Center" },
    { to: "/journal" as const, label: "Journal" },
    { to: "/history" as const, label: "History" },
  ];

  return (
    <nav className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] z-50 flex-shrink-0">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 no-underline"
          >
            <span className="text-xl font-black tracking-tight text-[var(--color-brand)]">
              EXECURE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] transition-colors no-underline"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-brand-light)] bg-[var(--color-brand)]/10 no-underline",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] transition-colors cursor-pointer bg-transparent"
            >
              Log out
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] no-underline"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] bg-transparent border-none cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}

import { Link } from "@tanstack/react-router";
import { CalendarDays, Flame, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarBrand, SidebarNav } from "./Sidebar";

const TABS = [
  { to: "/dashboard" as const, label: "Overview", icon: LayoutGrid },
  { to: "/today" as const, label: "Today", icon: CalendarDays },
  { to: "/history" as const, label: "Discipline", icon: Flame },
];

const tabClass =
  "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 h-12 text-[10px] font-medium";

// Below 1024px the sidebar becomes a bottom tab bar (the app's existing mobile
// pattern) with the full navigation available from "Menu".
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="lg:hidden flex-shrink-0 border-t border-line bg-bg bottom-nav-safe z-30">
        <div className="mx-auto max-w-xl flex items-stretch px-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                to={t.to}
                className="flex flex-1 min-w-0 no-underline"
              >
                {({ isActive }: { isActive: boolean }) => (
                  <span className={`${tabClass} ${isActive ? "text-fg" : "text-fg-3"}`}>
                    <Icon size={18} strokeWidth={1.6} />
                    <span className="truncate max-w-full">{t.label}</span>
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className={`${tabClass} bg-transparent border-none cursor-pointer text-fg-3`}
            aria-label="Open navigation"
          >
            <Menu size={18} strokeWidth={1.6} />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            className="absolute inset-0 bg-black/60 border-none cursor-default"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="fade-in relative w-[272px] max-w-[85vw] h-full flex flex-col bg-bg border-r border-line">
            <div className="flex items-center justify-between h-[var(--topbar-height)] px-4 border-b border-line">
              <SidebarBrand />
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost px-2"
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-line px-2 py-2">
              <Link
                to="/"
                className="flex items-center gap-2.5 h-9 px-2.5 text-[13px] text-fg-2 no-underline"
              >
                <LogOut size={15} strokeWidth={1.6} />
                Log out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

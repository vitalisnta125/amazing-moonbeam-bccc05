import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { LogoMark, Wordmark } from "../Logo";
import { NAV_ITEMS } from "./nav";
import { NavLinkItem } from "./NavLinkItem";

export function SidebarBrand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
      <LogoMark size={24} />
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.06em] text-fg">
          <Wordmark />
        </span>
        <span className="text-[9px] font-medium tracking-[0.18em] text-fg-3 mt-1">BEHAVIOUR OS</span>
      </span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-px">
      {NAV_ITEMS.map((item) => (
        <NavLinkItem key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

// Persistent desktop sidebar (≥1024px).
export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col flex-shrink-0 w-[var(--sidebar-width)] border-r border-line bg-bg">
      <div className="flex items-center h-[var(--topbar-height)] px-4 border-b border-line flex-shrink-0">
        <SidebarBrand />
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarNav />
      </div>
      <div className="border-t border-line px-2 py-2 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2.5 h-8 px-2.5 rounded-[4px] text-[13px] text-fg-2 hover:text-fg hover:bg-panel-2 no-underline"
        >
          <LogOut size={15} strokeWidth={1.6} />
          Log out
        </Link>
      </div>
    </aside>
  );
}

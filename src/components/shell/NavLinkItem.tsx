import { Link } from "@tanstack/react-router";
import type { NavItem } from "./nav";

const base = "relative flex items-center gap-2.5 h-8 px-2.5 rounded-[4px] text-[13px] transition-colors";

export function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;

  return (
    <Link to={item.to} onClick={onNavigate} className="block no-underline">
      {({ isActive }: { isActive: boolean }) => (
        <span className={`${base} ${isActive ? "text-fg bg-panel-2" : "text-fg-2 hover:text-fg hover:bg-panel-2"}`}>
          {isActive && <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-fg" />}
          <Icon size={15} strokeWidth={1.6} className="flex-shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
        </span>
      )}
    </Link>
  );
}

import {
  ArrowLeftRight,
  CalendarDays,
  Flame,
  LayoutGrid,
  Scale,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Tabs of the legacy Behaviour OS control surface (/os). The page itself is
// kept (not deleted — its data and code stay intact) but is no longer linked
// from the primary nav: Today/Rules/Trades now cover its ground with the
// simpler local Today store. Only `App.jsx` and its route still import these.
export type OsTab = "overview" | "session" | "rules" | "propfirm" | "leaderboard";
export const OS_TABS: OsTab[] = ["overview", "session", "rules", "propfirm", "leaderboard"];

export type AppPath =
  | "/dashboard"
  | "/today"
  | "/recap"
  | "/rules"
  | "/history"
  | "/settings"
  | "/journal"
  | "/os";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  to: AppPath;
}

// The primary nav: a flat list, shown in the sidebar and the mobile bottom
// bar. Deliberately short — everything else (AI Coach, DNA, leaderboard,
// prop-firm risk, reports, playbooks, replay) is out of scope for this MVP
// and stays unlinked rather than being deleted.
export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, to: "/dashboard" },
  { label: "Today", icon: CalendarDays, to: "/today" },
  { label: "Trades", icon: ArrowLeftRight, to: "/recap" },
  { label: "Rules", icon: Scale, to: "/rules" },
  { label: "Discipline", icon: Flame, to: "/history" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

// Resolve the current location to its nav label for the top bar.
export function resolveNav(pathname: string): string | null {
  return NAV_ITEMS.find((item) => item.to === pathname)?.label ?? null;
}

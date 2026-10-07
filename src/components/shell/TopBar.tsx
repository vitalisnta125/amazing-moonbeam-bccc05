import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoMark } from "../Logo";
import { resolveNav } from "./nav";
import { formatClock, formatFullDate } from "../../lib/local-date";

// Live clock, in the browser's own local time. Rendered only after mount so
// the server and client markup match.
function useNow(intervalMs = 15000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Context bar: where you are, the local date and time, and a direct link to
// Today, the day's command centre.
export function TopBar() {
  const location = useRouterState({ select: (s) => s.location });
  const label = resolveNav(location.pathname);
  const now = useNow();

  return (
    <header className="flex-shrink-0 flex items-center justify-between gap-3 h-[var(--topbar-height)] px-4 sm:px-6 lg:px-8 border-b border-line bg-bg">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/dashboard" className="lg:hidden flex items-center no-underline" aria-label="EXECURE home">
          <LogoMark size={22} />
        </Link>
        {label && <span className="text-[13px] font-medium text-fg truncate">{label}</span>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-3 pr-3 mr-1 border-r border-line h-6">
          <span className="text-[12px] text-fg-3">{now ? formatFullDate(now) : " "}</span>
          <span className="num text-[12px] text-fg-2">{now ? formatClock(now) : " "}</span>
        </div>
        <Link to="/recap" className="btn btn-secondary hidden sm:inline-flex">
          Trades
        </Link>
        <Link to="/today" className="btn btn-primary">
          Today
        </Link>
      </div>
    </header>
  );
}

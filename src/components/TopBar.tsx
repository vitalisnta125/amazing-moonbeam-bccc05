import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useEliteMode } from "../lib/elite-mode-context";
import { LogoMark, Wordmark } from "./Logo";

// Slim top bar: brand, the Elite Mode switch and the account control. With
// primary navigation moved to the bottom bar, this keeps the full width and the
// vertical space below entirely for the trader's behaviour command center.
export function TopBar() {
  const { eliteMode, toggleEliteMode } = useEliteMode();
  const [showFlash, setShowFlash] = useState(false);

  function handleToggle() {
    if (!eliteMode) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 600);
    }
    toggleEliteMode();
  }

  const brand = eliteMode ? "#ff3d00" : "var(--color-brand)";

  return (
    <header
      className="elite-header elite-redline relative flex-shrink-0 flex items-center justify-between gap-3 border-b px-4 sm:px-6 h-14 bg-[var(--color-surface-elevated)] overflow-hidden z-40"
      style={{ borderColor: "var(--color-border)" }}
    >
      <Link to="/dashboard" className="flex items-center gap-2 no-underline">
        <LogoMark size={30} />
        <span
          className={`text-base font-black tracking-tight ${eliteMode ? "elite-badge" : "text-[var(--color-text-primary)]"}`}
        >
          {eliteMode ? "EXECURE" : <Wordmark />}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded transition-all duration-500"
          style={{
            color: brand,
            backgroundColor: eliteMode ? "rgba(255,61,0,0.1)" : "rgba(0,255,136,0.1)",
          }}
        >
          {eliteMode ? "ELITE" : "BETA"}
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Elite Mode switch */}
        <button
          onClick={handleToggle}
          className="relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none overflow-hidden transition-all duration-500"
          style={{
            backgroundColor: eliteMode ? "rgba(255,61,0,0.12)" : "var(--color-surface-card)",
            color: eliteMode ? "#ff3d00" : "var(--color-text-secondary)",
          }}
        >
          {showFlash && (
            <span
              className="absolute inset-0 rounded-lg elite-activate-flash"
              style={{ backgroundColor: "rgba(255,61,0,0.2)" }}
            />
          )}
          <svg
            width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="transition-transform duration-500 relative z-10"
            style={{ transform: eliteMode ? "rotate(72deg) scale(1.1)" : "none" }}
          >
            <path d="M7 1l2 4h4l-3.5 3 1.5 5L7 10 3 13l1.5-5L1 5h4l2-4z" />
          </svg>
          <span className="hidden sm:inline relative z-10">Elite</span>
          <span
            className="w-8 h-[16px] rounded-full relative transition-all duration-500 z-10"
            style={{
              backgroundColor: eliteMode ? "#ff3d00" : "var(--color-border)",
            }}
          >
            <span
              className="w-3 h-3 rounded-full absolute top-[2px] transition-all duration-500"
              style={{
                left: eliteMode ? "16px" : "2px",
                backgroundColor: eliteMode ? "#fff" : "#8899aa",
              }}
            />
          </span>
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-500"
            style={{
              backgroundColor: "var(--color-surface-card)",
              borderColor: eliteMode ? "rgba(255,61,0,0.3)" : "var(--color-border)",
              color: brand,
            }}
          >
            AT
          </div>
          <Link
            to="/"
            className="hidden sm:inline text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors no-underline"
          >
            Log out
          </Link>
        </div>
      </div>
    </header>
  );
}

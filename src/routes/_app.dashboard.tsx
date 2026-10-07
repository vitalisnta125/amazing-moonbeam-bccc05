import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TradingViewWidget } from "../components/TradingViewWidget";
import { useEliteMode } from "../lib/elite-mode-context";
import { useSessionPlan } from "../lib/session-plan-context";
import { useRecaps } from "../lib/recaps-context";
import { summarise, type RecapSummary } from "../lib/recap-stats";
import { OUTCOMES, RULES_TOTAL } from "../lib/trade-rules";
import {
  DASHBOARD_WIDGETS,
  useDashboardPrefs,
} from "../lib/dashboard-prefs-context";
import { usePersistentState } from "../lib/use-persistent-state";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

function CircularGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "var(--color-brand)",
  trackColor = "var(--color-border)",
  label,
  elite = false,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  elite?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={elite ? "elite-gauge" : ""}
      style={{ transition: "filter 0.6s ease" }}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} style={{ transition: "stroke 0.6s ease" }} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.6s ease" }}
      />
      <text x="50%" y={label ? "45%" : "50%"} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={size * 0.28} fontWeight="900" fontFamily="Inter, sans-serif">
        {value}
      </text>
      {label && (
        <text x="50%" y="65%" textAnchor="middle" dominantBaseline="central" fill="var(--color-text-secondary)" fontSize={size * 0.09} fontWeight="500" fontFamily="Inter, sans-serif">
          {label}
        </text>
      )}
    </svg>
  );
}

function WidgetCard({
  title,
  children,
  accent = false,
  eliteMode,
}: {
  title?: string;
  children: React.ReactNode;
  accent?: boolean;
  eliteMode: boolean;
}) {
  return (
    <div
      className="elite-card bg-[var(--color-surface-card)] rounded-xl p-5 transition-all duration-500"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: accent
          ? eliteMode
            ? "rgba(255,61,0,0.18)"
            : "rgba(0,255,136,0.14)"
          : "var(--color-border)",
      }}
    >
      {title && (
        <h3
          className="text-[11px] font-bold uppercase tracking-wider mb-4 transition-colors duration-500"
          style={{ color: eliteMode ? "#ff3d00" : "var(--color-text-secondary)" }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Widgets                                                                    */
/* -------------------------------------------------------------------------- */

function FocusWidget({ eliteMode, brandColor }: { eliteMode: boolean; brandColor: string }) {
  const [intention, setIntention] = usePersistentState("focus-intention", "");
  const [editing, setEditing] = useState(false);
  return (
    <WidgetCard accent eliteMode={eliteMode} title={eliteMode ? "Mission Intent" : "Today's Intention"}>
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            onBlur={() => setEditing(false)}
            rows={2}
            placeholder="e.g. Trade only my A+ setup. Walk away after two trades."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            style={{ border: "1px solid var(--color-border)" }}
          />
          <button
            onClick={() => setEditing(false)}
            className="self-end text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer border-none"
            style={{ backgroundColor: brandColor, color: eliteMode ? "#fff" : "var(--color-surface)" }}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left bg-transparent border-none cursor-pointer p-0"
        >
          <p
            className="text-lg font-bold leading-snug"
            style={{ color: intention ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
          >
            {intention || "Set your intention for the session →"}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Behaviour first. The score takes care of itself. Tap to edit.
          </p>
        </button>
      )}
    </WidgetCard>
  );
}

function ReadinessWidget({
  eliteMode,
  brandColor,
  summary,
}: {
  eliteMode: boolean;
  brandColor: string;
  summary: RecapSummary;
}) {
  const recap = summary.today ?? summary.latest;
  const followed = recap?.rulesFollowed ?? 0;
  const total = recap?.rulesTotal ?? RULES_TOTAL;
  const score = total ? Math.round((followed / total) * 100) : 0;
  const caption = summary.today
    ? "Today's confirmations"
    : recap
      ? `Last recorded ${recap.sessionDate}`
      : "No check recorded yet";

  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Combat Readiness" : "Pre-Trade Readiness"}>
      <div className="flex items-center gap-6">
        <CircularGauge value={score} size={120} strokeWidth={10} label="/ 100" color={brandColor} elite={eliteMode} />
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-secondary)]">{caption}</p>
          {recap && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {followed}/{total} entry rules confirmed
            </p>
          )}
          <Link
            to="/check"
            className="inline-block mt-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-500 no-underline"
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: eliteMode ? "rgba(255,61,0,0.3)" : "rgba(0,255,136,0.3)",
              color: brandColor,
              backgroundColor: "transparent",
            }}
          >
            {eliteMode ? "Run Diagnostics" : "Run Check"}
          </Link>
        </div>
      </div>
    </WidgetCard>
  );
}

function StreakWidget({
  eliteMode,
  summary,
}: {
  eliteMode: boolean;
  summary: RecapSummary;
}) {
  const amber = eliteMode ? "#ff3d00" : "var(--color-amber)";
  const streak = summary.currentStreak;
  const max = Math.max(30, summary.longestStreak);
  // The seven most-recent recorded days, oldest-first, for the mini track.
  const recentDays = [...summary.recent].reverse().slice(-7);
  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Kill Streak" : "Discipline Streak"}>
      <div className="flex items-center gap-6">
        <CircularGauge value={streak} max={max} size={120} strokeWidth={10} color={amber} elite={eliteMode} />
        <div className="flex-1">
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            {eliteMode ? "Consecutive elite sessions without deviation" : "Consecutive days following your rules"}
          </p>
          {recentDays.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {recentDays.map((day) => (
                <div
                  key={day.sessionDate}
                  title={`${day.sessionDate}: ${day.discipline}`}
                  className="w-6 h-6 rounded transition-all duration-500"
                  style={{
                    backgroundColor:
                      day.discipline === "full"
                        ? eliteMode
                          ? "#ff3d00"
                          : "var(--color-brand)"
                        : day.discipline === "partial"
                          ? "var(--color-streak-amber)"
                          : "var(--color-streak-grey)",
                    opacity: day.discipline === "full" ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Record a session to start your streak.
            </p>
          )}
          <Link to="/history" className="inline-block mt-3 text-xs no-underline" style={{ color: "var(--color-text-muted)" }}>
            View full history →
          </Link>
        </div>
      </div>
    </WidgetCard>
  );
}

function PlanWidget({ eliteMode, brandColor }: { eliteMode: boolean; brandColor: string }) {
  const { lockedPlan } = useSessionPlan();
  return (
    <WidgetCard eliteMode={eliteMode}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider transition-colors duration-500" style={{ color: eliteMode ? "#ff3d00" : "var(--color-text-secondary)" }}>
          {eliteMode ? "Mission Parameters" : "Today's Session Plan"}
        </h3>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded transition-all duration-500"
          style={
            lockedPlan
              ? { color: brandColor, backgroundColor: eliteMode ? "rgba(255,61,0,0.1)" : "rgba(0,255,136,0.1)" }
              : { color: "var(--color-text-muted)", backgroundColor: "var(--color-surface-elevated)" }
          }
        >
          {lockedPlan ? "LOCKED" : "NOT SET"}
        </span>
      </div>
      {lockedPlan ? (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-secondary)]">Session</span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{lockedPlan.sessionLabel}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-secondary)]">Bias</span>
              <span className="text-sm font-semibold transition-colors duration-500" style={{ color: lockedPlan.biasColor || brandColor }}>
                {lockedPlan.biasIcon} {lockedPlan.biasLabel}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-secondary)]">Max Trades</span>
              <span className="text-sm font-black text-[var(--color-text-primary)]">{lockedPlan.maxTrades}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Risk / Trade</span>
              <span className="text-sm font-black text-[var(--color-text-primary)]">{lockedPlan.riskPerTrade}%</span>
            </div>
          </div>
          <Link to="/session" className="mt-4 block text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors no-underline">
            Edit plan →
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-3xl mb-3 opacity-30">📋</div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">{eliteMode ? "No parameters configured" : "No plan set for today"}</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">{eliteMode ? "Define your mission before engaging." : "Lock in your session rules before you trade."}</p>
          <Link to="/session" className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-500 no-underline" style={{ backgroundColor: brandColor, color: eliteMode ? "#fff" : "var(--color-surface)" }}>
            {eliteMode ? "Configure Parameters" : "Create Plan"}
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

function GoalsWidget({ eliteMode, brandColor }: { eliteMode: boolean; brandColor: string }) {
  const [goals, setGoals] = usePersistentState<Goal[]>("goals", []);
  const [draft, setDraft] = useState("");

  function addGoal() {
    const text = draft.trim();
    if (!text) return;
    setGoals((g) => [...g, { id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, text, done: false }]);
    setDraft("");
  }

  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Objectives" : "Goals & Intentions"}>
      <div className="space-y-1.5">
        {goals.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] pb-1">
            No goals yet. Add what a disciplined session looks like for you.
          </p>
        )}
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: goal.done ? (eliteMode ? "rgba(255,61,0,0.08)" : "rgba(0,255,136,0.08)") : "var(--color-surface-elevated)" }}
          >
            <button
              onClick={() => setGoals((g) => g.map((x) => (x.id === goal.id ? { ...x, done: !x.done } : x)))}
              className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black flex-shrink-0 cursor-pointer"
              style={{
                backgroundColor: goal.done ? brandColor : "transparent",
                border: goal.done ? "none" : "1px solid var(--color-border)",
                color: "var(--color-surface)",
              }}
            >
              {goal.done ? "✓" : ""}
            </button>
            <span
              className="text-sm flex-1"
              style={{
                color: goal.done ? "var(--color-text-muted)" : "var(--color-text-primary)",
                textDecoration: goal.done ? "line-through" : "none",
              }}
            >
              {goal.text}
            </span>
            <button
              onClick={() => setGoals((g) => g.filter((x) => x.id !== goal.id))}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Add a goal…"
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          style={{ border: "1px solid var(--color-border)" }}
        />
        <button
          onClick={addGoal}
          className="rounded-lg px-4 py-2 text-sm font-bold cursor-pointer border-none"
          style={{ backgroundColor: brandColor, color: eliteMode ? "#fff" : "var(--color-surface)" }}
        >
          Add
        </button>
      </div>
    </WidgetCard>
  );
}

function BehaviourWidget({
  eliteMode,
  brandColor,
  summary,
}: {
  eliteMode: boolean;
  brandColor: string;
  summary: RecapSummary;
}) {
  const amber = eliteMode ? "#ff6e40" : "var(--color-amber)";
  function tag(pct: number) {
    return pct >= 75 ? "Strong" : pct >= 50 ? "Moderate" : "Needs work";
  }
  const rows = [
    {
      label: "Rule Adherence",
      pct: summary.avgAdherence,
      color: summary.avgAdherence >= 75 ? brandColor : amber,
    },
    {
      label: "Discipline Rate",
      pct: summary.greenRate,
      color: summary.greenRate >= 75 ? brandColor : amber,
    },
    {
      label: "Win Rate",
      pct: summary.winRate,
      color: summary.winRate >= 50 ? brandColor : amber,
    },
  ];
  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Performance Metrics" : "Behaviour Replay"}>
      {summary.total === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Record sessions to see your behaviour trends.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--color-text-secondary)]">{r.label}</span>
                <span className="text-xs font-bold" style={{ color: r.color }}>
                  {r.pct}% · {tag(r.pct)}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function TimelineWidget({
  eliteMode,
  summary,
}: {
  eliteMode: boolean;
  summary: RecapSummary;
}) {
  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Execution Log" : "Recent Sessions"}>
      {summary.recent.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No sessions yet.{" "}
          <Link to="/recap" className="no-underline" style={{ color: "var(--color-brand)" }}>
            Add a recap →
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {summary.recent.map((r) => {
            const outcome = OUTCOMES.find((o) => o.value === r.outcome);
            return (
              <div key={r.sessionDate} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-all duration-500 ${r.discipline === "full" && eliteMode ? "elite-pulse" : ""}`}
                    style={{
                      backgroundColor:
                        r.discipline === "full"
                          ? eliteMode
                            ? "#ff3d00"
                            : "var(--color-brand)"
                          : r.discipline === "partial"
                            ? "var(--color-amber)"
                            : "var(--color-streak-grey)",
                    }}
                  />
                  <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />
                </div>
                <div className="pb-1">
                  <p className="text-[10px] text-[var(--color-text-muted)]">{r.sessionDate}</p>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">
                    {r.rulesFollowed}/{r.rulesTotal} rules · {outcome?.label ?? r.outcome}
                  </p>
                  {r.rMultiple != null && (
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {r.rMultiple > 0 ? "+" : ""}{r.rMultiple}R{r.pair ? ` · ${r.pair}` : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

function CoverageWidget({
  eliteMode,
  brandColor,
  summary,
}: {
  eliteMode: boolean;
  brandColor: string;
  summary: RecapSummary;
}) {
  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Mission Coverage" : "Progress Coverage"}>
      <div className="flex items-center gap-6">
        <CircularGauge value={summary.avgAdherence} size={100} strokeWidth={7} label="/ 100" color={brandColor} elite={eliteMode} />
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="text-center">
            <p className="text-2xl font-black text-[var(--color-text-primary)]">{summary.total}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: brandColor }}>{summary.greenRate}%</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Clean Days</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

function RuleBreaksWidget({
  eliteMode,
  brandColor,
  summary,
}: {
  eliteMode: boolean;
  brandColor: string;
  summary: RecapSummary;
}) {
  const today = summary.today;
  // Rules missed today only count once a trade was taken; a no-trade day has no
  // breaches by definition (patience is the rule).
  const missed =
    today && today.outcome !== "no-trade"
      ? today.rulesTotal - today.rulesFollowed
      : 0;
  const danger = missed > 0 ? "var(--color-danger)" : brandColor;
  return (
    <WidgetCard eliteMode={eliteMode} title={eliteMode ? "Violation Counter" : "Rule Break Counter"}>
      <div className="flex items-center gap-6">
        <span className="text-5xl font-black transition-colors duration-500" style={{ color: danger }}>{missed}</span>
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {missed > 0 ? "Rules missed on today's trade" : eliteMode ? "Zero deviations" : "Rules broken today"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {missed > 0
              ? "Review the setup before the next entry."
              : eliteMode
                ? "Maintain operational discipline."
                : "Keep it at zero. Your identity depends on it."}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}

function CoachWidget({ eliteMode }: { eliteMode: boolean }) {
  const insights = eliteMode
    ? [
        "Win rate drops 32% after 3 consecutive losses. Abort sequence.",
        "Peak performance window: London session. Allocate maximum focus.",
        "Patience metrics up 15% this week. Maintain trajectory.",
      ]
    : [
        "Your win rate drops 32% after 3 consecutive losses. Consider stepping away.",
        "Best performance during the London session. Focus your energy here.",
        "Your patience score improved 15% this week.",
      ];
  return (
    <WidgetCard eliteMode={eliteMode} accent title={eliteMode ? "Tactical Intel" : "AI Coach Insights"}>
      <div className="space-y-3">
        {insights.map((text, i) => (
          <div key={i} className="bg-[var(--color-surface)]/50 rounded-lg p-3 border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function ChartWidget({ mounted }: { mounted: boolean }) {
  return (
    <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden transition-all duration-500" style={{ height: "360px" }}>
      {mounted && <TradingViewWidget />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Customize panel                                                            */
/* -------------------------------------------------------------------------- */

function CustomizePanel({ brandColor }: { brandColor: string }) {
  const { order, isVisible, toggleWidget, moveWidget, showChart, setShowChart, reset } = useDashboardPrefs();
  const metaById = Object.fromEntries(DASHBOARD_WIDGETS.map((w) => [w.id, w]));

  return (
    <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 transition-all duration-500">
      {/* Focus Mode — the psychological-pressure lever */}
      <div
        className="rounded-lg p-4 mb-4 flex items-start justify-between gap-4"
        style={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}
      >
        <div>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">Focus Mode</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-md">
            Hide the live chart so candle moves don't pull you into unplanned trades.
            Review your process first — the market will still be there.
          </p>
        </div>
        <button
          onClick={() => setShowChart(!showChart)}
          className="flex-shrink-0 w-12 h-7 rounded-full relative transition-all duration-300 cursor-pointer border-none"
          style={{ backgroundColor: showChart ? brandColor : "var(--color-border)" }}
          aria-label="Toggle live chart"
        >
          <span
            className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
            style={{ left: showChart ? "26px" : "4px", backgroundColor: "#fff" }}
          />
        </button>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
        Build your screen
      </p>
      <div className="space-y-1.5">
        {order.map((id, i) => {
          const meta = metaById[id];
          if (!meta) return null;
          const visible = isVisible(id);
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--color-surface-elevated)" }}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => moveWidget(id, -1)}
                  disabled={i === 0}
                  className="text-[10px] leading-none text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveWidget(id, 1)}
                  disabled={i === order.length - 1}
                  className="text-[10px] leading-none text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{meta.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{meta.description}</p>
              </div>
              <button
                onClick={() => toggleWidget(id)}
                className="flex-shrink-0 w-10 h-6 rounded-full relative transition-all duration-300 cursor-pointer border-none"
                style={{ backgroundColor: visible ? brandColor : "var(--color-border)" }}
                aria-label={`Toggle ${meta.label}`}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full transition-all duration-300"
                  style={{ left: visible ? "20px" : "4px", backgroundColor: "#fff" }}
                />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={reset}
        className="mt-4 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer"
      >
        Reset to defaults
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function DashboardPage() {
  const [mounted] = useState(true);
  const [customizing, setCustomizing] = useState(false);
  const { eliteMode } = useEliteMode();
  const { order, isVisible } = useDashboardPrefs();
  const { recaps } = useRecaps();
  const summary = summarise(recaps);
  const brandColor = eliteMode ? "#ff3d00" : "var(--color-brand)";

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const dateString = now.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });

  function renderWidget(id: string) {
    switch (id) {
      case "focus":
        return <FocusWidget eliteMode={eliteMode} brandColor={brandColor} />;
      case "readiness":
        return <ReadinessWidget eliteMode={eliteMode} brandColor={brandColor} summary={summary} />;
      case "streak":
        return <StreakWidget eliteMode={eliteMode} summary={summary} />;
      case "plan":
        return <PlanWidget eliteMode={eliteMode} brandColor={brandColor} />;
      case "goals":
        return <GoalsWidget eliteMode={eliteMode} brandColor={brandColor} />;
      case "behaviour":
        return <BehaviourWidget eliteMode={eliteMode} brandColor={brandColor} summary={summary} />;
      case "timeline":
        return <TimelineWidget eliteMode={eliteMode} summary={summary} />;
      case "coverage":
        return <CoverageWidget eliteMode={eliteMode} brandColor={brandColor} summary={summary} />;
      case "rulebreaks":
        return <RuleBreaksWidget eliteMode={eliteMode} brandColor={brandColor} summary={summary} />;
      case "coach":
        return <CoachWidget eliteMode={eliteMode} />;
      case "chart":
        return <ChartWidget mounted={mounted} />;
      default:
        return null;
    }
  }

  const visibleWidgets = order.filter((id) => isVisible(id));

  return (
    <div>
      {/* Page header */}
      <div className="elite-header elite-redline flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] relative overflow-hidden">
        <div>
          <h1 className="text-base font-bold text-[var(--color-text-primary)] m-0">
            {eliteMode ? "Execute with precision." : "Good morning, Alex."}
          </h1>
          <p className="text-xs m-0 transition-colors duration-500" style={{ color: eliteMode ? "#ff3d00" : "var(--color-text-secondary)" }}>
            {eliteMode ? "Elite mode engaged. No excuses." : "Discipline today. Freedom tomorrow."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[var(--color-text-secondary)] m-0">{dateString}</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] m-0">{timeString}</p>
          </div>
          <button
            onClick={() => setCustomizing((c) => !c)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-500"
            style={{
              border: `1px solid ${customizing ? brandColor : "var(--color-border)"}`,
              color: customizing ? brandColor : "var(--color-text-secondary)",
              backgroundColor: customizing ? (eliteMode ? "rgba(255,61,0,0.1)" : "rgba(0,255,136,0.1)") : "transparent",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3H3v3M13 6V3h-3M10 13h3v-3M3 10v3h3" />
            </svg>
            {customizing ? "Done" : "Customize"}
          </button>
        </div>
      </div>

      {/* Stacked content */}
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
        {customizing && <CustomizePanel brandColor={brandColor} />}

        {visibleWidgets.length === 0 && !customizing ? (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--color-text-secondary)]">Your screen is empty.</p>
            <button
              onClick={() => setCustomizing(true)}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none"
              style={{ backgroundColor: brandColor, color: eliteMode ? "#fff" : "var(--color-surface)" }}
            >
              Add widgets
            </button>
          </div>
        ) : (
          visibleWidgets.map((id) => <div key={id}>{renderWidget(id)}</div>)
        )}

        {/* Primary calls to action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/check"
            className="elite-cta flex-1 block py-4 rounded-xl font-bold text-base text-center transition-all duration-500 no-underline"
            style={{
              backgroundColor: brandColor,
              color: eliteMode ? "#fff" : "var(--color-surface)",
              boxShadow: eliteMode ? "0 0 30px rgba(255,61,0,0.25), 0 0 60px rgba(255,61,0,0.1)" : "0 8px 20px rgba(0,255,136,0.2)",
            }}
          >
            {eliteMode ? "INITIATE PRE-TRADE SEQUENCE" : "START PRE-TRADE CHECK"}
          </Link>
          <Link
            to="/recap"
            className="flex-1 block py-4 rounded-xl font-bold text-base text-center transition-all duration-500 no-underline"
            style={{
              border: `1px solid ${eliteMode ? "rgba(255,61,0,0.4)" : "rgba(0,255,136,0.4)"}`,
              color: brandColor,
              backgroundColor: "transparent",
            }}
          >
            {eliteMode ? "LOG / BACKFILL SESSION" : "RECAP A SESSION"}
          </Link>
        </div>
      </div>
    </div>
  );
}

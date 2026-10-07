// EXECURE — The Behaviour Operating System for Traders
//
// A self-contained, mobile-first behaviour OS. Everything in this file persists
// to localStorage and works offline. It reuses the EXECURE theme tokens defined
// in styles.css (--color-brand, --color-surface, etc.) so the look stays
// consistent with the rest of the app.
//
// Modules:
//   • Discipline Score        — a live composite of how well rules were followed
//   • Session Lock            — freeze the day's plan; trades are counted against it
//   • Rule Violations         — log breaches, each carries a weighted penalty
//   • Prop Firm Compliance    — daily loss / drawdown / target tracking with status
//   • Accountability Leaderboard — rank against peers by discipline, not P&L

import { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Theme (mirrors src/styles.css tokens so this file is self-contained)        */
/* -------------------------------------------------------------------------- */

const THEME = {
  brand: "var(--color-brand)",
  brandDark: "var(--color-brand-dark)",
  surface: "var(--color-surface)",
  elevated: "var(--color-surface-elevated)",
  card: "var(--color-surface-card)",
  border: "var(--color-border)",
  text: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  danger: "var(--color-danger)",
  amber: "var(--color-amber)",
  success: "var(--color-success)",
};

/* -------------------------------------------------------------------------- */
/* localStorage-backed state (SSR-safe)                                        */
/* -------------------------------------------------------------------------- */

const STORAGE_PREFIX = "execure:os:v1:";

// Reads on the client only (TanStack Start renders this on the server first),
// so the first paint matches the server output and there is no hydration flash.
function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      /* corrupt or unavailable storage — fall back to defaults */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota or private-mode — silently ignore */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

/* -------------------------------------------------------------------------- */
/* Domain config & defaults                                                    */
/* -------------------------------------------------------------------------- */

const SESSION_TYPES = [
  { value: "london", label: "London", time: "08:00–12:00 GMT" },
  { value: "newyork", label: "New York", time: "13:00–17:00 GMT" },
  { value: "asian", label: "Asian", time: "00:00–06:00 GMT" },
  { value: "overlap", label: "London / NY Overlap", time: "13:00–16:00 GMT" },
];

const BIAS_OPTIONS = [
  { value: "bullish", label: "Bullish", icon: "▲", color: THEME.success },
  { value: "bearish", label: "Bearish", icon: "▼", color: THEME.danger },
  { value: "neutral", label: "Neutral", icon: "◆", color: THEME.amber },
];

// Severity → penalty points removed from the discipline score for the day.
const SEVERITY = {
  minor: { label: "Minor", weight: 5, color: THEME.amber },
  major: { label: "Major", weight: 15, color: "#ff6e40" },
  critical: { label: "Critical", weight: 30, color: THEME.danger },
};

const RULEBOOK = [
  { id: "no-check", label: "Traded without a pre-trade check", severity: "major" },
  { id: "overtrade", label: "Exceeded max trades for the session", severity: "major" },
  { id: "oversize", label: "Risked more than planned per trade", severity: "critical" },
  { id: "moved-stop", label: "Moved a stop loss away from price", severity: "critical" },
  { id: "revenge", label: "Revenge traded after a loss", severity: "critical" },
  { id: "no-setup", label: "Entered with no valid setup (FOMO)", severity: "major" },
  { id: "off-session", label: "Traded outside the planned session", severity: "minor" },
  { id: "early-exit", label: "Cut a winner early out of fear", severity: "minor" },
];

const CHECKLIST_ITEMS = [
  { id: "bias", label: "Higher-timeframe bias confirmed" },
  { id: "level", label: "Trading from a key level" },
  { id: "risk", label: "Risk per trade defined" },
  { id: "news", label: "Checked the news calendar" },
  { id: "mindset", label: "Calm, focused, well-rested" },
  { id: "plan", label: "Session plan locked in" },
];

const DEFAULT_SESSION = {
  type: "london",
  bias: "neutral",
  maxTrades: 3,
  riskPerTrade: 1,
  dailyLossLimit: 3,
  locked: false,
  lockedAt: null,
  tradesTaken: 0,
};

const DEFAULT_PROPFIRM = {
  accountSize: 100000,
  dailyLossLimitPct: 5,
  maxDrawdownPct: 10,
  profitTargetPct: 8,
  minTradingDays: 5,
  // live figures the trader updates as the challenge progresses
  dailyPnL: -1200,
  totalProfit: 4300,
  peakDrawdownPct: 3.4,
  tradingDays: 3,
};

const DEFAULT_PROFILE = { name: "You", streak: 11, daysClean: 24 };

// Peers for the accountability leaderboard. The trader is injected & ranked live.
const PEERS = [
  { id: "p1", name: "M. Okafor", handle: "@disciplined_mo", score: 96, streak: 41 },
  { id: "p2", name: "S. Petrova", handle: "@sniper_sv", score: 92, streak: 28 },
  { id: "p3", name: "K. Tan", handle: "@process_kt", score: 88, streak: 19 },
  { id: "p4", name: "D. Reyes", handle: "@riskfirst", score: 81, streak: 14 },
  { id: "p5", name: "A. Novak", handle: "@flatby3", score: 74, streak: 9 },
  { id: "p6", name: "J. Mensah", handle: "@nofomo_jm", score: 69, streak: 6 },
];

const TABS = [
  { id: "overview", label: "Overview", icon: "◎" },
  { id: "session", label: "Session", icon: "⏻" },
  { id: "rules", label: "Rules", icon: "⚑" },
  { id: "propfirm", label: "Prop Firm", icon: "▣" },
  { id: "leaderboard", label: "Leaders", icon: "♛" },
];

/* -------------------------------------------------------------------------- */
/* Small presentational primitives                                             */
/* -------------------------------------------------------------------------- */

function ScoreRing({ value, max = 100, size = 168, stroke = 12, color, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = pct * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={THEME.border}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
      />
      <text
        x="50%"
        y={label ? "44%" : "50%"}
        textAnchor="middle"
        dominantBaseline="central"
        fill={THEME.text}
        fontSize={size * 0.3}
        fontWeight="900"
      >
        {Math.round(value)}
      </text>
      {label && (
        <text
          x="50%"
          y="63%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={THEME.textSecondary}
          fontSize={size * 0.085}
          fontWeight="600"
          letterSpacing="1"
        >
          {label}
        </text>
      )}
    </svg>
  );
}

function Card({ children, className = "", accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${className}`}
      style={{
        backgroundColor: THEME.card,
        borderColor: accent ? "rgba(0, 255, 136, 0.18)" : THEME.border,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: THEME.textSecondary }}
      >
        {children}
      </h3>
      {right}
    </div>
  );
}

function Meter({ label, value, max, color, danger = false, suffix = "" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: THEME.textSecondary }}>
          {label}
        </span>
        <span
          className="text-xs font-bold"
          style={{ color: danger ? THEME.danger : color }}
        >
          {value}
          {suffix} / {max}
          {suffix}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: THEME.surface }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: danger ? THEME.danger : color,
            transition: "width 0.5s ease, background-color 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function Pill({ tone = "neutral", children }) {
  const map = {
    good: { bg: "rgba(0,255,136,0.12)", fg: THEME.success },
    warn: { bg: "rgba(245,158,11,0.14)", fg: THEME.amber },
    bad: { bg: "rgba(239,68,68,0.14)", fg: THEME.danger },
    neutral: { bg: THEME.elevated, fg: THEME.textMuted },
  };
  const c = map[tone] || map.neutral;
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function scoreColor(score) {
  if (score >= 80) return THEME.success;
  if (score >= 55) return THEME.amber;
  return THEME.danger;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Root component                                                              */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [tab, setTab] = usePersistentState("tab", "overview");
  const [session, setSession] = usePersistentState("session", DEFAULT_SESSION);
  const [violations, setViolations] = usePersistentState("violations", []);
  const [checklist, setChecklist] = usePersistentState("checklist", {});
  const [propfirm, setPropfirm] = usePersistentState("propfirm", DEFAULT_PROPFIRM);
  const [profile, setProfile] = usePersistentState("profile", DEFAULT_PROFILE);

  /* ---- derived: today's violations & penalty ---- */
  const today = todayKey();
  const todaysViolations = useMemo(
    () => violations.filter((v) => v.day === today),
    [violations, today]
  );
  const penalty = useMemo(
    () =>
      todaysViolations.reduce(
        (sum, v) => sum + (SEVERITY[v.severity]?.weight || 0),
        0
      ),
    [todaysViolations]
  );

  /* ---- derived: discipline score (transparent composite) ---- */
  const checklistPct = useMemo(() => {
    const done = CHECKLIST_ITEMS.filter((i) => checklist[i.id]).length;
    return Math.round((done / CHECKLIST_ITEMS.length) * 100);
  }, [checklist]);

  const ruleAdherence = Math.max(0, 100 - penalty);

  const planCompliance = useMemo(() => {
    let v = 100;
    if (!session.locked) v -= 30; // an unlocked day is an undisciplined day
    if (session.tradesTaken > session.maxTrades)
      v -= (session.tradesTaken - session.maxTrades) * 20;
    return Math.max(0, v);
  }, [session]);

  const disciplineScore = useMemo(
    () =>
      Math.round(
        ruleAdherence * 0.5 + checklistPct * 0.25 + planCompliance * 0.25
      ),
    [ruleAdherence, checklistPct, planCompliance]
  );

  /* ---- prop firm compliance evaluation ---- */
  const prop = useMemo(() => {
    const dailyLossCap = (propfirm.accountSize * propfirm.dailyLossLimitPct) / 100;
    const dailyLossUsed = Math.max(0, -propfirm.dailyPnL);
    const targetCash = (propfirm.accountSize * propfirm.profitTargetPct) / 100;
    const checks = [
      {
        key: "daily",
        label: "Daily loss",
        ok: dailyLossUsed <= dailyLossCap,
        atRisk: dailyLossUsed > dailyLossCap * 0.7,
      },
      {
        key: "drawdown",
        label: "Max drawdown",
        ok: propfirm.peakDrawdownPct <= propfirm.maxDrawdownPct,
        atRisk: propfirm.peakDrawdownPct > propfirm.maxDrawdownPct * 0.7,
      },
      {
        key: "days",
        label: "Min trading days",
        ok: propfirm.tradingDays >= propfirm.minTradingDays,
        atRisk: false,
      },
    ];
    const breached = checks.some((c) => !c.ok && c.key !== "days");
    const atRisk = checks.some((c) => c.atRisk);
    const status = breached ? "Breached" : atRisk ? "At Risk" : "Compliant";
    return { dailyLossCap, dailyLossUsed, targetCash, checks, status };
  }, [propfirm]);

  /* ---- leaderboard (inject the trader, rank by discipline) ---- */
  const leaderboard = useMemo(() => {
    const me = {
      id: "me",
      name: profile.name || "You",
      handle: "@you",
      score: disciplineScore,
      streak: profile.streak,
      me: true,
    };
    return [...PEERS, me].sort((a, b) => b.score - a.score || b.streak - a.streak);
  }, [disciplineScore, profile]);
  const myRank = leaderboard.findIndex((e) => e.me) + 1;

  /* ---- actions ---- */
  function logViolation(rule) {
    setViolations((prev) => [
      {
        uid: `${rule.id}-${prev.length}-${todayKey()}-${Math.round(performance.now())}`,
        ruleId: rule.id,
        label: rule.label,
        severity: rule.severity,
        day: todayKey(),
        time: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
  }
  function removeViolation(uid) {
    setViolations((prev) => prev.filter((v) => v.uid !== uid));
  }
  function toggleCheck(id) {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function lockSession() {
    setSession((s) => ({
      ...s,
      locked: true,
      lockedAt: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }
  function unlockSession() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Unlocking mid-session breaks your plan. This is logged as a major violation. Continue?"
      )
    )
      return;
    logViolation({
      id: "unlock",
      label: "Unlocked the session plan mid-day",
      severity: "major",
    });
    setSession((s) => ({ ...s, locked: false, lockedAt: null }));
  }
  function addTrade() {
    setSession((s) => {
      const next = s.tradesTaken + 1;
      if (next > s.maxTrades) {
        logViolation(RULEBOOK.find((r) => r.id === "overtrade"));
      }
      return { ...s, tradesTaken: next };
    });
  }
  function closeDayClean() {
    if (todaysViolations.length > 0) {
      if (
        typeof window !== "undefined" &&
        !window.confirm(
          "You logged violations today, so the streak resets. Close the day anyway?"
        )
      )
        return;
      setProfile((p) => ({ ...p, streak: 0, daysClean: p.daysClean }));
    } else {
      setProfile((p) => ({
        ...p,
        streak: p.streak + 1,
        daysClean: p.daysClean + 1,
      }));
    }
    // reset the day
    setSession((s) => ({
      ...DEFAULT_SESSION,
      type: s.type,
      maxTrades: s.maxTrades,
      riskPerTrade: s.riskPerTrade,
      dailyLossLimit: s.dailyLossLimit,
    }));
    setChecklist({});
    setViolations((prev) => prev.filter((v) => v.day !== todayKey()));
  }

  /* ---- render ---- */
  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: THEME.surface, color: THEME.text }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{
          backgroundColor: "rgba(8,12,20,0.85)",
          borderColor: THEME.border,
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black"
                style={{ backgroundColor: THEME.brand, color: THEME.surface }}
              >
                E
              </span>
              <h1 className="text-sm font-black tracking-tight truncate">
                EXECURE{" "}
                <span style={{ color: THEME.textMuted }} className="font-semibold">
                  · Behaviour OS
                </span>
              </h1>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: THEME.textSecondary }}>
              Discipline today. Freedom tomorrow.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px]" style={{ color: THEME.textMuted }}>
                Discipline
              </p>
              <p
                className="text-lg font-black leading-none"
                style={{ color: scoreColor(disciplineScore) }}
              >
                {disciplineScore}
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: THEME.elevated }}
            >
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold">{profile.streak}</span>
            </div>
          </div>
        </div>

        {/* Tab bar — horizontally scrollable on small screens */}
        <nav className="mx-auto max-w-3xl px-2 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 min-w-[72px] flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: active ? "rgba(0,255,136,0.1)" : "transparent",
                  color: active ? THEME.brand : THEME.textSecondary,
                }}
              >
                <span className="text-sm leading-none">{t.icon}</span>
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 pb-24 space-y-4">
        {tab === "overview" && (
          <OverviewTab
            disciplineScore={disciplineScore}
            ruleAdherence={ruleAdherence}
            checklistPct={checklistPct}
            planCompliance={planCompliance}
            todaysViolations={todaysViolations}
            session={session}
            propStatus={prop.status}
            myRank={myRank}
            totalRanked={leaderboard.length}
            checklist={checklist}
            toggleCheck={toggleCheck}
            closeDayClean={closeDayClean}
            profile={profile}
          />
        )}

        {tab === "session" && (
          <SessionTab
            session={session}
            setSession={setSession}
            lockSession={lockSession}
            unlockSession={unlockSession}
            addTrade={addTrade}
          />
        )}

        {tab === "rules" && (
          <RulesTab
            todaysViolations={todaysViolations}
            penalty={penalty}
            logViolation={logViolation}
            removeViolation={removeViolation}
          />
        )}

        {tab === "propfirm" && (
          <PropFirmTab propfirm={propfirm} setPropfirm={setPropfirm} prop={prop} />
        )}

        {tab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} myRank={myRank} profile={profile} />
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Overview                                                               */
/* -------------------------------------------------------------------------- */

function OverviewTab({
  disciplineScore,
  ruleAdherence,
  checklistPct,
  planCompliance,
  todaysViolations,
  session,
  propStatus,
  myRank,
  totalRanked,
  checklist,
  toggleCheck,
  closeDayClean,
  profile,
}) {
  const color = scoreColor(disciplineScore);
  return (
    <>
      {/* Discipline score hero */}
      <Card accent className="flex flex-col sm:flex-row items-center gap-5">
        <ScoreRing value={disciplineScore} color={color} label="DISCIPLINE" />
        <div className="flex-1 w-full space-y-3">
          <SectionTitle right={<Pill tone={disciplineScore >= 80 ? "good" : disciplineScore >= 55 ? "warn" : "bad"}>{disciplineScore >= 80 ? "Locked In" : disciplineScore >= 55 ? "Watch It" : "Off Process"}</Pill>}>
            How the score is built
          </SectionTitle>
          <Meter label="Rule adherence (50%)" value={ruleAdherence} max={100} color={THEME.success} suffix="" />
          <Meter label="Pre-trade checklist (25%)" value={checklistPct} max={100} color={THEME.brand} />
          <Meter label="Plan compliance (25%)" value={planCompliance} max={100} color={THEME.amber} />
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Streak" value={`${profile.streak}d`} icon="🔥" />
        <StatTile
          label="Violations"
          value={todaysViolations.length}
          icon="⚑"
          tone={todaysViolations.length === 0 ? "good" : "bad"}
        />
        <StatTile
          label="Trades"
          value={`${session.tradesTaken}/${session.maxTrades}`}
          icon="↹"
          tone={session.tradesTaken > session.maxTrades ? "bad" : "neutral"}
        />
        <StatTile
          label="Prop Firm"
          value={propStatus}
          icon="▣"
          tone={propStatus === "Compliant" ? "good" : propStatus === "At Risk" ? "warn" : "bad"}
        />
      </div>

      {/* Pre-trade checklist */}
      <Card>
        <SectionTitle right={<span className="text-xs font-bold" style={{ color: THEME.brand }}>{checklistPct}%</span>}>
          Pre-Trade Checklist
        </SectionTitle>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((item) => {
            const done = !!checklist[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                style={{ backgroundColor: done ? "rgba(0,255,136,0.08)" : THEME.elevated }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black flex-shrink-0"
                  style={{
                    backgroundColor: done ? THEME.brand : "transparent",
                    border: done ? "none" : `1px solid ${THEME.border}`,
                    color: THEME.surface,
                  }}
                >
                  {done ? "✓" : ""}
                </span>
                <span
                  className="text-sm"
                  style={{ color: done ? THEME.text : THEME.textSecondary }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Rank + close day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <SectionTitle>Accountability</SectionTitle>
          <p className="text-sm" style={{ color: THEME.textSecondary }}>
            You rank
          </p>
          <p className="text-3xl font-black" style={{ color: THEME.brand }}>
            #{myRank}
            <span className="text-base font-semibold" style={{ color: THEME.textMuted }}>
              {" "}
              / {totalRanked}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: THEME.textMuted }}>
            Ranked by discipline, never by P&L.
          </p>
        </Card>
        <Card>
          <SectionTitle>End of Day</SectionTitle>
          <p className="text-xs mb-3" style={{ color: THEME.textSecondary }}>
            {todaysViolations.length === 0
              ? "Clean sheet today. Close the day to extend your streak."
              : "Violations logged today — closing resets the streak."}
          </p>
          <button
            onClick={closeDayClean}
            className="w-full rounded-xl py-3 text-sm font-bold transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: todaysViolations.length === 0 ? THEME.brand : THEME.elevated,
              color: todaysViolations.length === 0 ? THEME.surface : THEME.textSecondary,
              border: todaysViolations.length === 0 ? "none" : `1px solid ${THEME.border}`,
            }}
          >
            {todaysViolations.length === 0 ? "Close Day — Clean ✓" : "Close & Reset Streak"}
          </button>
        </Card>
      </div>
    </>
  );
}

function StatTile({ label, value, icon, tone = "neutral" }) {
  const fg =
    tone === "good"
      ? THEME.success
      : tone === "bad"
      ? THEME.danger
      : tone === "warn"
      ? THEME.amber
      : THEME.text;
  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: THEME.card, borderColor: THEME.border }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: THEME.textMuted }}>
          {label}
        </span>
        <span className="text-xs opacity-70">{icon}</span>
      </div>
      <p className="text-xl font-black mt-1 truncate" style={{ color: fg }}>
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Session Lock                                                           */
/* -------------------------------------------------------------------------- */

function SessionTab({ session, setSession, lockSession, unlockSession, addTrade }) {
  const locked = session.locked;
  const sessionMeta = SESSION_TYPES.find((s) => s.value === session.type);
  const overtraded = session.tradesTaken > session.maxTrades;

  function update(patch) {
    if (locked) return;
    setSession((s) => ({ ...s, ...patch }));
  }

  return (
    <>
      <Card accent={locked}>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Session Lock</SectionTitle>
          <Pill tone={locked ? "good" : "neutral"}>{locked ? `Locked · ${session.lockedAt}` : "Open"}</Pill>
        </div>

        {/* Session type */}
        <label className="text-xs" style={{ color: THEME.textSecondary }}>
          Session
        </label>
        <div className="grid grid-cols-2 gap-2 mt-1.5 mb-4">
          {SESSION_TYPES.map((s) => {
            const active = session.type === s.value;
            return (
              <button
                key={s.value}
                onClick={() => update({ type: s.value })}
                disabled={locked}
                className="rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: active ? "rgba(0,255,136,0.1)" : THEME.elevated,
                  borderColor: active ? THEME.brand : THEME.border,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: active ? THEME.brand : THEME.text }}>
                  {s.label}
                </p>
                <p className="text-[10px]" style={{ color: THEME.textMuted }}>
                  {s.time}
                </p>
              </button>
            );
          })}
        </div>

        {/* Bias */}
        <label className="text-xs" style={{ color: THEME.textSecondary }}>
          Bias
        </label>
        <div className="grid grid-cols-3 gap-2 mt-1.5 mb-4">
          {BIAS_OPTIONS.map((b) => {
            const active = session.bias === b.value;
            return (
              <button
                key={b.value}
                onClick={() => update({ bias: b.value })}
                disabled={locked}
                className="rounded-lg border px-2 py-2 text-center transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.04)" : THEME.elevated,
                  borderColor: active ? b.color : THEME.border,
                }}
              >
                <span className="text-sm font-bold" style={{ color: b.color }}>
                  {b.icon} {b.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Numeric limits */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <NumberField
            label="Max trades"
            value={session.maxTrades}
            disabled={locked}
            min={1}
            onChange={(v) => update({ maxTrades: v })}
          />
          <NumberField
            label="Risk / trade %"
            value={session.riskPerTrade}
            step={0.25}
            disabled={locked}
            min={0.25}
            onChange={(v) => update({ riskPerTrade: v })}
          />
          <NumberField
            label="Daily loss %"
            value={session.dailyLossLimit}
            step={0.5}
            disabled={locked}
            min={0.5}
            onChange={(v) => update({ dailyLossLimit: v })}
          />
        </div>

        {locked ? (
          <button
            onClick={unlockSession}
            className="w-full rounded-xl py-3 text-sm font-bold border"
            style={{ borderColor: THEME.danger, color: THEME.danger, backgroundColor: "transparent" }}
          >
            Unlock Session (logs a violation)
          </button>
        ) : (
          <button
            onClick={lockSession}
            className="w-full rounded-xl py-3 text-sm font-bold transition-transform active:scale-[0.98]"
            style={{ backgroundColor: THEME.brand, color: THEME.surface }}
          >
            Lock In Session Plan
          </button>
        )}
      </Card>

      {/* Trade counter — only meaningful once locked */}
      <Card>
        <SectionTitle right={<Pill tone={overtraded ? "bad" : "neutral"}>{overtraded ? "Over limit" : `${sessionMeta?.label}`}</Pill>}>
          Trades Taken
        </SectionTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-black" style={{ color: overtraded ? THEME.danger : THEME.text }}>
              {session.tradesTaken}
              <span className="text-lg" style={{ color: THEME.textMuted }}>
                {" "}
                / {session.maxTrades}
              </span>
            </p>
            <p className="text-xs mt-1" style={{ color: THEME.textSecondary }}>
              {locked
                ? overtraded
                  ? "You are past your plan. Stop."
                  : "Logged against your locked plan."
                : "Lock the session to start counting."}
            </p>
          </div>
          <button
            onClick={addTrade}
            disabled={!locked}
            className="rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: THEME.elevated, color: THEME.text, border: `1px solid ${THEME.border}` }}
          >
            + Trade
          </button>
        </div>
        <Meter
          label="Daily loss limit used"
          value={Math.min(session.dailyLossLimit, session.dailyLossLimit)}
          max={session.dailyLossLimit}
          color={THEME.amber}
          suffix="%"
        />
      </Card>
    </>
  );
}

function NumberField({ label, value, onChange, disabled, step = 1, min = 0 }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider" style={{ color: THEME.textMuted }}>
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        step={step}
        min={min}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-60 outline-none"
        style={{
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          color: THEME.text,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Rule Violations                                                        */
/* -------------------------------------------------------------------------- */

function RulesTab({ todaysViolations, penalty, logViolation, removeViolation }) {
  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle>Rule Violations Today</SectionTitle>
            <p className="text-4xl font-black" style={{ color: todaysViolations.length ? THEME.danger : THEME.success }}>
              {todaysViolations.length}
            </p>
            <p className="text-xs" style={{ color: THEME.textSecondary }}>
              −{penalty} points off your discipline score
            </p>
          </div>
          <div className="text-right text-5xl opacity-20">⚑</div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Log a Violation</SectionTitle>
        <div className="space-y-1.5">
          {RULEBOOK.map((rule) => {
            const sev = SEVERITY[rule.severity];
            return (
              <button
                key={rule.id}
                onClick={() => logViolation(rule)}
                className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors active:scale-[0.99]"
                style={{ backgroundColor: THEME.elevated }}
              >
                <span className="text-sm" style={{ color: THEME.text }}>
                  {rule.label}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", color: sev.color }}
                >
                  −{sev.weight} · {sev.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>Today's Log</SectionTitle>
        {todaysViolations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🟢</p>
            <p className="text-sm font-semibold" style={{ color: THEME.success }}>
              No violations logged
            </p>
            <p className="text-xs" style={{ color: THEME.textMuted }}>
              Keep it at zero. Your identity depends on it.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysViolations.map((v) => {
              const sev = SEVERITY[v.severity];
              return (
                <div
                  key={v.uid}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ backgroundColor: THEME.elevated }}
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: sev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: THEME.text }}>
                      {v.label}
                    </p>
                    <p className="text-[10px]" style={{ color: THEME.textMuted }}>
                      {v.time} · {sev.label} (−{sev.weight})
                    </p>
                  </div>
                  <button
                    onClick={() => removeViolation(v.uid)}
                    className="text-xs px-2 py-1 rounded-md"
                    style={{ color: THEME.textMuted, backgroundColor: "transparent" }}
                  >
                    Undo
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Prop Firm Compliance                                                   */
/* -------------------------------------------------------------------------- */

function PropFirmTab({ propfirm, setPropfirm, prop }) {
  function set(patch) {
    setPropfirm((p) => ({ ...p, ...patch }));
  }
  const statusTone =
    prop.status === "Compliant" ? "good" : prop.status === "At Risk" ? "warn" : "bad";

  return (
    <>
      <Card accent>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Prop Firm Compliance</SectionTitle>
          <Pill tone={statusTone}>{prop.status}</Pill>
        </div>
        <div className="space-y-3">
          <Meter
            label="Daily loss used"
            value={Math.round(prop.dailyLossUsed)}
            max={Math.round(prop.dailyLossCap)}
            color={THEME.amber}
            danger={prop.dailyLossUsed > prop.dailyLossCap}
            suffix=""
          />
          <Meter
            label="Drawdown"
            value={propfirm.peakDrawdownPct}
            max={propfirm.maxDrawdownPct}
            color={THEME.brand}
            danger={propfirm.peakDrawdownPct > propfirm.maxDrawdownPct}
            suffix="%"
          />
          <Meter
            label="Profit target progress"
            value={Math.max(0, propfirm.totalProfit)}
            max={Math.round(prop.targetCash)}
            color={THEME.success}
            suffix=""
          />
          <Meter
            label="Trading days"
            value={propfirm.tradingDays}
            max={propfirm.minTradingDays}
            color={THEME.brand}
            suffix=""
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {prop.checks.map((c) => (
            <div
              key={c.key}
              className="rounded-lg px-2 py-2 text-center"
              style={{ backgroundColor: THEME.elevated }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: THEME.textMuted }}>
                {c.label}
              </p>
              <p
                className="text-sm font-bold mt-0.5"
                style={{ color: c.ok ? THEME.success : THEME.danger }}
              >
                {c.ok ? "PASS" : "FAIL"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Challenge Rules</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Account size $" value={propfirm.accountSize} step={5000} onChange={(v) => set({ accountSize: v })} />
          <NumberField label="Profit target %" value={propfirm.profitTargetPct} step={0.5} onChange={(v) => set({ profitTargetPct: v })} />
          <NumberField label="Daily loss limit %" value={propfirm.dailyLossLimitPct} step={0.5} onChange={(v) => set({ dailyLossLimitPct: v })} />
          <NumberField label="Max drawdown %" value={propfirm.maxDrawdownPct} step={0.5} onChange={(v) => set({ maxDrawdownPct: v })} />
          <NumberField label="Min trading days" value={propfirm.minTradingDays} onChange={(v) => set({ minTradingDays: v })} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Live Figures</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Today's P&L $" value={propfirm.dailyPnL} step={50} min={-1000000} onChange={(v) => set({ dailyPnL: v })} />
          <NumberField label="Total profit $" value={propfirm.totalProfit} step={50} min={-1000000} onChange={(v) => set({ totalProfit: v })} />
          <NumberField label="Peak drawdown %" value={propfirm.peakDrawdownPct} step={0.1} onChange={(v) => set({ peakDrawdownPct: v })} />
          <NumberField label="Trading days done" value={propfirm.tradingDays} onChange={(v) => set({ tradingDays: v })} />
        </div>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Accountability Leaderboard                                             */
/* -------------------------------------------------------------------------- */

function LeaderboardTab({ leaderboard, myRank, profile }) {
  return (
    <>
      <Card accent>
        <SectionTitle>Your Standing</SectionTitle>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-black" style={{ color: THEME.brand }}>
              #{myRank}
            </p>
            <p className="text-xs" style={{ color: THEME.textSecondary }}>
              of {leaderboard.length} traders · {profile.streak}-day streak
            </p>
          </div>
          <p className="text-xs text-right max-w-[12rem]" style={{ color: THEME.textMuted }}>
            The board ranks discipline, not profit. Process compounds.
          </p>
        </div>
      </Card>

      <Card>
        <SectionTitle>Accountability Leaderboard</SectionTitle>
        <div className="space-y-1.5">
          {leaderboard.map((e, i) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{
                backgroundColor: e.me ? "rgba(0,255,136,0.1)" : THEME.elevated,
                border: e.me ? `1px solid ${THEME.brand}` : "1px solid transparent",
              }}
            >
              <span
                className="w-6 text-center text-sm font-black flex-shrink-0"
                style={{ color: i < 3 ? THEME.brand : THEME.textMuted }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: THEME.text }}>
                  {e.name} {e.me && <span style={{ color: THEME.brand }}>(you)</span>}
                </p>
                <p className="text-[10px]" style={{ color: THEME.textMuted }}>
                  {e.handle} · 🔥 {e.streak}d
                </p>
              </div>
              <div
                className="rounded-lg px-2.5 py-1 text-sm font-black flex-shrink-0"
                style={{ backgroundColor: THEME.surface, color: scoreColor(e.score) }}
              >
                {e.score}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

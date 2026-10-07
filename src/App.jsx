// EXECURE — The Behaviour Operating System for Traders
//
// A self-contained, mobile-first behaviour OS. Everything in this file persists
// to localStorage and works offline. It reuses the EXECURE theme tokens defined
// in styles.css (--color-mint, --color-panel, etc.) so the look stays
// consistent with the rest of the app.
//
// Modules:
//   • Discipline Score        — a live composite of how well rules were followed
//   • Session Lock            — freeze the day's plan; trades are counted against it
//   • Rule Violations         — log breaches, each carries a weighted penalty
//   • Prop Firm Compliance    — daily loss / drawdown / target tracking with status
//   • Accountability Leaderboard — rank against peers by discipline, not P&L

import { useEffect, useMemo, useState } from "react";
import { LeaderboardTable } from "./components/behaviour/LeaderboardTable";

/* -------------------------------------------------------------------------- */
/* Theme (mirrors src/styles.css tokens so this file is self-contained)        */
/* -------------------------------------------------------------------------- */

const THEME = {
  surface: "var(--color-bg)",
  card: "var(--color-panel)",
  elevated: "var(--color-panel-2)",
  border: "var(--color-line)",
  text: "var(--color-fg)",
  textSecondary: "var(--color-fg-2)",
  textMuted: "var(--color-fg-3)",
  danger: "var(--color-red)",
  amber: "var(--color-amber)",
  success: "var(--color-mint)",
  insight: "var(--color-violet)",
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
  major: { label: "Major", weight: 15, color: THEME.danger },
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
  { id: "overview", label: "Today" },
  { id: "session", label: "Session lock" },
  { id: "rules", label: "Rules" },
  { id: "propfirm", label: "Risk" },
  { id: "leaderboard", label: "Leaderboard" },
];

const TAB_COPY = {
  overview: { title: "Today", description: "Today's live discipline score, pre-trade checklist and end-of-day close." },
  session: { title: "Session lock", description: "Freeze the day's plan. Executions are counted against it." },
  rules: { title: "Rules", description: "Log breaches as they happen. Each carries a weighted penalty." },
  propfirm: { title: "Risk", description: "Daily loss, drawdown and challenge compliance." },
  leaderboard: { title: "Leaderboard", description: "Accountability ranked by discipline — never by P&L." },
};

/* -------------------------------------------------------------------------- */
/* Small presentational primitives                                             */
/* -------------------------------------------------------------------------- */

function Card({ children, className = "" }) {
  return <div className={`panel p-4 min-w-0 ${className}`}>{children}</div>;
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="label-caps m-0">{children}</h3>
      {right}
    </div>
  );
}

function Meter({ label, value, max, color, danger = false, suffix = "" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: THEME.textSecondary }}>
          {label}
        </span>
        <span className="num text-[12px]" style={{ color: danger ? THEME.danger : THEME.text }}>
          {value}
          {suffix} / {max}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: THEME.elevated }}>
        <div
          className="h-full rounded-[2px]"
          style={{
            width: `${pct}%`,
            backgroundColor: danger ? THEME.danger : color,
            transition: "width 0.4s ease, background-color 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

const TONE = {
  good: THEME.success,
  warn: THEME.amber,
  bad: THEME.danger,
  insight: THEME.insight,
  neutral: THEME.textSecondary,
};

function Pill({ tone = "neutral", children }) {
  const fg = TONE[tone] || TONE.neutral;
  return (
    <span
      className="inline-flex items-center h-[18px] text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 rounded-[3px] whitespace-nowrap"
      style={{
        color: fg,
        backgroundColor: tone === "neutral" ? THEME.elevated : `color-mix(in srgb, ${fg} 10%, transparent)`,
      }}
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

export default function App({ tab: urlTab, onTabChange } = {}) {
  // The URL (?tab=) is the source of truth when present; the last-used tab is
  // remembered for plain /os visits.
  const [storedTab, setStoredTab] = usePersistentState("tab", "overview");
  const tab = urlTab ?? storedTab;
  function setTab(next) {
    setStoredTab(next);
    onTabChange?.(next);
  }
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
  const copy = TAB_COPY[tab] || TAB_COPY.overview;
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      {/* Page header with today's live discipline score */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-[20px] leading-7 font-semibold tracking-[-0.01em] m-0">{copy.title}</h1>
          <p className="text-[13px] m-0 mt-1" style={{ color: THEME.textSecondary }}>
            {copy.description}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div>
            <p className="label-caps m-0 text-[10px]">Discipline today</p>
            <p className="num text-[20px] leading-none m-0 mt-1.5" style={{ color: scoreColor(disciplineScore) }}>
              {disciplineScore}
            </p>
          </div>
          <div>
            <p className="label-caps m-0 text-[10px]">Streak</p>
            <p className="num text-[20px] leading-none m-0 mt-1.5">{profile.streak}d</p>
          </div>
        </div>
      </div>

      {/* Segmented tab control — mirrors the sidebar deep links */}
      <nav className="flex gap-px mb-4 border-b overflow-x-auto no-scrollbar" style={{ borderColor: THEME.border }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative h-9 px-3 text-[13px] whitespace-nowrap bg-transparent border-none cursor-pointer transition-colors"
              style={{ color: active ? THEME.text : THEME.textSecondary }}
            >
              {t.label}
              {active && (
                <span className="absolute left-2 right-2 -bottom-px h-px" style={{ backgroundColor: THEME.text }} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
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
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Today (overview)                                                       */
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
  const tone = disciplineScore >= 80 ? "good" : disciplineScore >= 55 ? "warn" : "bad";
  return (
    <>
      {/* Discipline score breakdown */}
      <Card className="lg:col-span-5">
        <SectionTitle right={<Pill tone={tone}>{disciplineScore >= 80 ? "Locked in" : disciplineScore >= 55 ? "Watch it" : "Off process"}</Pill>}>
          Discipline score
        </SectionTitle>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="num text-[28px] leading-none" style={{ color: scoreColor(disciplineScore) }}>
            {disciplineScore}
          </span>
          <span className="num text-[13px]" style={{ color: THEME.textMuted }}>/ 100</span>
        </div>
        <div className="space-y-3">
          <Meter label="Rule adherence · 50%" value={ruleAdherence} max={100} color={THEME.success} />
          <Meter label="Pre-trade checklist · 25%" value={checklistPct} max={100} color={THEME.success} />
          <Meter label="Plan compliance · 25%" value={planCompliance} max={100} color={THEME.success} />
        </div>
      </Card>

      {/* Quick stats */}
      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 content-start">
        <StatTile label="Streak" value={`${profile.streak}d`} />
        <StatTile
          label="Violations"
          value={todaysViolations.length}
          tone={todaysViolations.length === 0 ? "good" : "bad"}
        />
        <StatTile
          label="Executions"
          value={`${session.tradesTaken}/${session.maxTrades}`}
          tone={session.tradesTaken > session.maxTrades ? "bad" : "neutral"}
        />
        <StatTile
          label="Risk status"
          value={propStatus}
          tone={propStatus === "Compliant" ? "good" : propStatus === "At Risk" ? "warn" : "bad"}
        />
        <Card className="col-span-2 sm:col-span-4">
          <SectionTitle right={<span className="num text-[12px]" style={{ color: THEME.textSecondary }}>{checklistPct}%</span>}>
            Pre-trade checklist
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {CHECKLIST_ITEMS.map((item) => {
              const done = !!checklist[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="option flex items-center gap-2.5 px-3 h-9 text-left text-[13px]"
                  data-active={done}
                >
                  <span className="check-box" data-checked={done}>
                    {done ? "✓" : ""}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Rank + close day */}
      <Card className="lg:col-span-5">
        <SectionTitle>Accountability</SectionTitle>
        <div className="flex items-baseline gap-2">
          <span className="num text-[24px] leading-none">#{myRank}</span>
          <span className="num text-[13px]" style={{ color: THEME.textMuted }}>/ {totalRanked}</span>
        </div>
        <p className="text-[12px] mt-2 mb-0" style={{ color: THEME.textMuted }}>
          Ranked by discipline, never by P&L.
        </p>
      </Card>
      <Card className="lg:col-span-7">
        <SectionTitle>End of day</SectionTitle>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] m-0" style={{ color: THEME.textSecondary }}>
            {todaysViolations.length === 0
              ? "Clean sheet today. Close the day to extend your streak."
              : "Violations logged today — closing resets the streak."}
          </p>
          <button
            onClick={closeDayClean}
            className={`btn ${todaysViolations.length === 0 ? "btn-primary" : "btn-secondary"}`}
          >
            {todaysViolations.length === 0 ? "Close day — clean" : "Close & reset streak"}
          </button>
        </div>
      </Card>
    </>
  );
}

function StatTile({ label, value, tone = "neutral" }) {
  const fg = tone === "neutral" ? THEME.text : TONE[tone];
  return (
    <div className="panel px-3 py-2.5 min-w-0">
      <span className="label-caps text-[10px]">{label}</span>
      <p className="num text-[16px] m-0 mt-1 truncate" style={{ color: fg }}>
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
      <Card className="lg:col-span-7">
        <SectionTitle right={<Pill tone={locked ? "good" : "neutral"}>{locked ? `Locked · ${session.lockedAt}` : "Open"}</Pill>}>
          Session lock
        </SectionTitle>

        <label className="label-caps text-[10px]">Session</label>
        <div className="grid grid-cols-2 gap-2 mt-1.5 mb-4">
          {SESSION_TYPES.map((s) => {
            const active = session.type === s.value;
            return (
              <button
                key={s.value}
                onClick={() => update({ type: s.value })}
                disabled={locked}
                className="option px-3 py-2 text-left"
                data-active={active}
              >
                <p className="text-[13px] font-medium m-0">{s.label}</p>
                <p className="num text-[11px] m-0" style={{ color: THEME.textMuted }}>
                  {s.time}
                </p>
              </button>
            );
          })}
        </div>

        <label className="label-caps text-[10px]">Bias</label>
        <div className="grid grid-cols-3 gap-2 mt-1.5 mb-4">
          {BIAS_OPTIONS.map((b) => {
            const active = session.bias === b.value;
            return (
              <button
                key={b.value}
                onClick={() => update({ bias: b.value })}
                disabled={locked}
                className="option px-2 h-9 text-center text-[13px]"
                data-active={active}
              >
                {b.icon} {b.label}
              </button>
            );
          })}
        </div>

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
            className="btn btn-secondary w-full"
            style={{ color: THEME.danger }}
          >
            Unlock session (logs a violation)
          </button>
        ) : (
          <button onClick={lockSession} className="btn btn-primary w-full">
            Lock in session plan
          </button>
        )}
      </Card>

      <Card className="lg:col-span-5 self-start">
        <SectionTitle right={<Pill tone={overtraded ? "bad" : "neutral"}>{overtraded ? "Over limit" : `${sessionMeta?.label}`}</Pill>}>
          Executions
        </SectionTitle>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="num text-[28px] leading-none m-0" style={{ color: overtraded ? THEME.danger : THEME.text }}>
              {session.tradesTaken}
              <span className="text-[15px]" style={{ color: THEME.textMuted }}>
                {" "}
                / {session.maxTrades}
              </span>
            </p>
            <p className="text-[12px] mt-2 mb-0" style={{ color: THEME.textSecondary }}>
              {locked
                ? overtraded
                  ? "You are past your plan. Stop."
                  : "Logged against your locked plan."
                : "Lock the session to start counting."}
            </p>
          </div>
          <button onClick={addTrade} disabled={!locked} className="btn btn-secondary">
            + Execution
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
      <label className="label-caps text-[10px]">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        step={step}
        min={min}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field num mt-1.5 disabled:opacity-60"
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
      <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-4">
        <Card>
          <SectionTitle right={<Pill tone={todaysViolations.length ? "bad" : "good"}>{todaysViolations.length ? "Deviation" : "Clean"}</Pill>}>
            Violations today
          </SectionTitle>
          <div className="flex items-baseline gap-3">
            <span className="num text-[28px] leading-none" style={{ color: todaysViolations.length ? THEME.danger : THEME.text }}>
              {todaysViolations.length}
            </span>
            <span className="num text-[13px]" style={{ color: THEME.textSecondary }}>
              −{penalty} pts discipline
            </span>
          </div>
        </Card>

        <Card>
          <SectionTitle>Log a violation</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {RULEBOOK.map((rule) => {
              const sev = SEVERITY[rule.severity];
              return (
                <button
                  key={rule.id}
                  onClick={() => logViolation(rule)}
                  className="option flex items-center justify-between gap-3 px-3 h-9 text-left text-[13px]"
                >
                  <span className="truncate">{rule.label}</span>
                  <span className="num text-[11px] flex-shrink-0" style={{ color: sev.color }}>
                    −{sev.weight} · {sev.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="lg:col-span-5 self-start">
        <SectionTitle>Today's log</SectionTitle>
        {todaysViolations.length === 0 ? (
          <div className="py-6">
            <p className="text-[13px] font-medium m-0" style={{ color: THEME.success }}>
              No violations logged
            </p>
            <p className="text-[12px] m-0 mt-1" style={{ color: THEME.textMuted }}>
              Keep it at zero.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-soft">
            {todaysViolations.map((v) => {
              const sev = SEVERITY[v.severity];
              return (
                <div key={v.uid} className="flex items-center gap-3 py-2">
                  <span className="num text-[12px] w-11 flex-shrink-0" style={{ color: THEME.textMuted }}>
                    {v.time}
                  </span>
                  <span className="h-2 w-2 rotate-45 flex-shrink-0" style={{ backgroundColor: sev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate m-0">{v.label}</p>
                    <p className="text-[11px] m-0" style={{ color: THEME.textMuted }}>
                      {sev.label} · −{sev.weight}
                    </p>
                  </div>
                  <button onClick={() => removeViolation(v.uid)} className="btn btn-ghost h-7 px-2 text-[12px]">
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
/* Tab: Prop Firm Compliance (Risk)                                            */
/* -------------------------------------------------------------------------- */

function PropFirmTab({ propfirm, setPropfirm, prop }) {
  function set(patch) {
    setPropfirm((p) => ({ ...p, ...patch }));
  }
  const statusTone =
    prop.status === "Compliant" ? "good" : prop.status === "At Risk" ? "warn" : "bad";

  return (
    <>
      <Card className="lg:col-span-7">
        <SectionTitle right={<Pill tone={statusTone}>{prop.status}</Pill>}>Prop firm compliance</SectionTitle>
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
            color={THEME.amber}
            danger={propfirm.peakDrawdownPct > propfirm.maxDrawdownPct}
            suffix="%"
          />
          <Meter
            label="Profit target progress"
            value={Math.max(0, propfirm.totalProfit)}
            max={Math.round(prop.targetCash)}
            color={THEME.textSecondary}
            suffix=""
          />
          <Meter
            label="Trading days"
            value={propfirm.tradingDays}
            max={propfirm.minTradingDays}
            color={THEME.textSecondary}
            suffix=""
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {prop.checks.map((c) => (
            <div key={c.key} className="rounded-[3px] px-2 py-2" style={{ backgroundColor: THEME.elevated }}>
              <p className="label-caps text-[10px] m-0 truncate">{c.label}</p>
              <p className="num text-[13px] m-0 mt-1" style={{ color: c.ok ? THEME.success : THEME.danger }}>
                {c.ok ? "PASS" : "FAIL"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-4">
        <Card>
          <SectionTitle>Challenge rules</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Account size $" value={propfirm.accountSize} step={5000} onChange={(v) => set({ accountSize: v })} />
            <NumberField label="Profit target %" value={propfirm.profitTargetPct} step={0.5} onChange={(v) => set({ profitTargetPct: v })} />
            <NumberField label="Daily loss limit %" value={propfirm.dailyLossLimitPct} step={0.5} onChange={(v) => set({ dailyLossLimitPct: v })} />
            <NumberField label="Max drawdown %" value={propfirm.maxDrawdownPct} step={0.5} onChange={(v) => set({ maxDrawdownPct: v })} />
            <NumberField label="Min trading days" value={propfirm.minTradingDays} onChange={(v) => set({ minTradingDays: v })} />
          </div>
        </Card>

        <Card>
          <SectionTitle>Live figures</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Today's P&L $" value={propfirm.dailyPnL} step={50} min={-1000000} onChange={(v) => set({ dailyPnL: v })} />
            <NumberField label="Total profit $" value={propfirm.totalProfit} step={50} min={-1000000} onChange={(v) => set({ totalProfit: v })} />
            <NumberField label="Peak drawdown %" value={propfirm.peakDrawdownPct} step={0.1} onChange={(v) => set({ peakDrawdownPct: v })} />
            <NumberField label="Trading days done" value={propfirm.tradingDays} onChange={(v) => set({ tradingDays: v })} />
          </div>
        </Card>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab: Accountability Leaderboard                                             */
/* -------------------------------------------------------------------------- */

function LeaderboardTab({ leaderboard, myRank, profile }) {
  const entries = leaderboard.map((e) => ({
    id: e.id,
    name: e.name,
    handle: e.me ? undefined : e.handle,
    discipline: e.score,
    streak: e.streak,
    me: !!e.me,
  }));
  return (
    <>
      <Card className="lg:col-span-8">
        <SectionTitle right={<Pill>Sample peers</Pill>}>Accountability leaderboard</SectionTitle>
        <LeaderboardTable entries={entries} showStreak />
        <p className="text-[12px] m-0 mt-3" style={{ color: THEME.textMuted }}>
          Peer rows are illustrative until the shared leaderboard launches. Execution and
          consistency columns populate as behavioural data is shared.
        </p>
      </Card>
      <Card className="lg:col-span-4 self-start">
        <SectionTitle>Your standing</SectionTitle>
        <div className="flex items-baseline gap-2">
          <span className="num text-[28px] leading-none">#{myRank}</span>
          <span className="num text-[13px]" style={{ color: THEME.textMuted }}>
            / {leaderboard.length}
          </span>
        </div>
        <p className="text-[12px] mt-2 mb-0" style={{ color: THEME.textSecondary }}>
          {profile.streak}-day streak. The board ranks discipline, not profit.
        </p>
      </Card>
    </>
  );
}

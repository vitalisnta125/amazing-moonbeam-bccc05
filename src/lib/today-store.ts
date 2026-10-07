// The live "Today" session — operating rules, the pre-trade check, and each
// execution logged through the day. This is genuinely entered data (not
// mock/sample data); it is kept client-side, the same way the rest of the
// behavioural layer (goals, focus intention) already persists, because there
// is no database table for per-execution intraday events and the task
// explicitly asks to keep the existing schema and server functions untouched.
//
// Sessions are keyed by local calendar date (see local-date.ts) so "today" is
// always the trader's own browser day, not UTC or a hardcoded city.

import { useCallback, useEffect, useState } from "react";
import { localDateISO, minutesBetween } from "./local-date";

const STORAGE_KEY = "execure:today:v1:sessions";

export interface OperatingRules {
  aPlusOnly: boolean;
  maxTrades: number;
  maxRiskR: number;
  maxConsecutiveLosses: number;
}

export const DEFAULT_RULES: OperatingRules = {
  aPlusOnly: true,
  maxTrades: 3,
  maxRiskR: 1,
  maxConsecutiveLosses: 2,
};

export interface PreTradeTicks {
  marketPlan: boolean;
  setupCriteria: boolean;
  riskDefined: boolean;
  mentalState: boolean;
}

const EMPTY_TICKS: PreTradeTicks = {
  marketPlan: false,
  setupCriteria: false,
  riskDefined: false,
  mentalState: false,
};

export type ExecutionOutcome = "win" | "loss" | "breakeven";

export interface Execution {
  id: string;
  at: string; // ISO timestamp
  outcome: ExecutionOutcome;
  riskR: number;
}

export interface DaySession {
  date: string; // YYYY-MM-DD, local
  rules: OperatingRules;
  locked: boolean;
  lockedAt: string | null; // ISO
  check: PreTradeTicks;
  checkCompletedAt: string | null; // ISO, set once every tick is true
  executions: Execution[];
}

function emptySession(date: string, rules: OperatingRules): DaySession {
  return { date, rules, locked: false, lockedAt: null, check: { ...EMPTY_TICKS }, checkCompletedAt: null, executions: [] };
}

export type TodaySessions = Record<string, DaySession>;
type Store = TodaySessions;

function read(): Store {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota or private mode — ignore */
  }
}

export function isCheckComplete(check: PreTradeTicks): boolean {
  return check.marketPlan && check.setupCriteria && check.riskDefined && check.mentalState;
}

export type SessionStatus = "not-ready" | "ready" | "locked";

export function sessionStatus(session: DaySession): SessionStatus {
  if (session.locked) return "locked";
  return isCheckComplete(session.check) ? "ready" : "not-ready";
}

export type BreachKind = "max-trades" | "max-risk" | "consecutive-losses";

export interface Breach {
  id: string;
  at: string;
  kind: BreachKind;
  detail: string;
}

// Breaches are derived, not stored — they always reflect the rules that were
// locked in for that day. A single execution can trigger more than one.
export function computeBreaches(session: DaySession): Breach[] {
  const { rules, executions } = session;
  const breaches: Breach[] = [];
  let consecutiveLosses = 0;

  executions.forEach((e, i) => {
    const seq = i + 1;
    if (seq > rules.maxTrades) {
      breaches.push({
        id: `${e.id}-max-trades`,
        at: e.at,
        kind: "max-trades",
        detail: `Execution #${seq}, max ${rules.maxTrades}`,
      });
    }
    if (e.riskR > rules.maxRiskR) {
      breaches.push({
        id: `${e.id}-max-risk`,
        at: e.at,
        kind: "max-risk",
        detail: `${e.riskR}R risked, max ${rules.maxRiskR}R`,
      });
    }
    if (consecutiveLosses >= rules.maxConsecutiveLosses) {
      breaches.push({
        id: `${e.id}-consecutive-losses`,
        at: e.at,
        kind: "consecutive-losses",
        detail: `Taken after ${consecutiveLosses} consecutive losses`,
      });
    }
    consecutiveLosses = e.outcome === "loss" ? consecutiveLosses + 1 : 0;
  });

  return breaches;
}

export const BREACH_LABEL: Record<BreachKind, string> = {
  "max-trades": "max trades",
  "max-risk": "risk over limit",
  "consecutive-losses": "trading after consecutive losses",
};

// Whether an execution fell inside the locked plan: it didn't exceed the
// trade count or risk limit, and the day's pre-trade check was complete.
export function executionInPlan(session: DaySession, index: number): boolean {
  const e = session.executions[index];
  const checkOk = session.checkCompletedAt != null;
  const countOk = index + 1 <= session.rules.maxTrades;
  const riskOk = e.riskR <= session.rules.maxRiskR;
  return checkOk && countOk && riskOk;
}

// Average minutes from a loss to the next execution across a session.
export function averagePatienceMinutes(session: DaySession): number | null {
  const gaps: number[] = [];
  for (let i = 0; i < session.executions.length - 1; i++) {
    if (session.executions[i].outcome === "loss") {
      gaps.push(minutesBetween(session.executions[i].at, session.executions[i + 1].at));
    }
  }
  return gaps.length ? gaps.reduce((s, g) => s + g, 0) / gaps.length : null;
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export interface TodayStore {
  ready: boolean;
  today: DaySession;
  history: Store; // every stored day, including today, keyed by date
  setRules: (rules: OperatingRules) => void;
  setTick: (key: keyof PreTradeTicks, value: boolean) => void;
  lock: () => void;
  logExecution: (outcome: ExecutionOutcome, riskR: number) => void;
}

// Pulls the most recently used rules so a fresh day starts from where the
// trader left off, rather than silently resetting to the hard-coded defaults.
function latestRules(store: Store): OperatingRules {
  const dates = Object.keys(store).sort().reverse();
  return dates.length ? store[dates[0]].rules : DEFAULT_RULES;
}

export function useTodayStore(): TodayStore {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState(() => localDateISO());

  useEffect(() => {
    setStore(read());
    setDate(localDateISO());
    setReady(true);
    // Keep the local day in sync if the tab stays open across midnight.
    const id = setInterval(() => setDate(localDateISO()), 60000);
    return () => clearInterval(id);
  }, []);

  const today = store[date] ?? emptySession(date, latestRules(store));

  const commit = useCallback(
    (next: DaySession) => {
      setStore((prev) => {
        const merged = { ...prev, [next.date]: next };
        write(merged);
        return merged;
      });
    },
    []
  );

  const setRules = useCallback(
    (rules: OperatingRules) => {
      if (today.locked) return;
      commit({ ...today, rules });
    },
    [today, commit]
  );

  const setTick = useCallback(
    (key: keyof PreTradeTicks, value: boolean) => {
      if (today.locked) return;
      const check = { ...today.check, [key]: value };
      const wasComplete = isCheckComplete(today.check);
      const nowComplete = isCheckComplete(check);
      commit({
        ...today,
        check,
        checkCompletedAt: nowComplete ? today.checkCompletedAt ?? new Date().toISOString() : nowComplete === wasComplete ? today.checkCompletedAt : null,
      });
    },
    [today, commit]
  );

  const lock = useCallback(() => {
    if (today.locked || !isCheckComplete(today.check)) return;
    commit({ ...today, locked: true, lockedAt: new Date().toISOString() });
  }, [today, commit]);

  const logExecution = useCallback(
    (outcome: ExecutionOutcome, riskR: number) => {
      if (!today.locked) return;
      const execution: Execution = {
        id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        at: new Date().toISOString(),
        outcome,
        riskR,
      };
      commit({ ...today, executions: [...today.executions, execution] });
    },
    [today, commit]
  );

  return { ready, today, history: store, setRules, setTick, lock, logExecution };
}

// Recorded days strictly before `before` (default today), most recent first.
// Used for "previous sessions" comparisons — regardless of calendar gaps.
export function priorSessions(store: Store, count: number, before: string = localDateISO()): DaySession[] {
  return Object.values(store)
    .filter((s) => s.date < before)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

// Every stored day, most recent first (today included if present).
export function allSessionsDesc(store: Store): DaySession[] {
  return Object.values(store).sort((a, b) => b.date.localeCompare(a.date));
}

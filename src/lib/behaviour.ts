// Behavioural read-model for Overview and Today. Pure functions (no React, no
// network) that turn stored data — day recaps (DB) and the local Today store
// — into the four tiles, the On Plan / Attention signal, the recent
// behaviour timeline and the performance summary.
//
// Nothing here is invented: every number traces back to something the trader
// recorded. When there is no data the value is null and the UI shows "—".

import { type DayRecap } from "./recap-stats";
import {
  BREACH_LABEL,
  computeBreaches,
  executionInPlan,
  isCheckComplete,
  priorSessions,
  averagePatienceMinutes,
  allSessionsDesc,
  type DaySession,
  type TodaySessions,
  type BreachKind,
} from "./today-store";
import { localDateISO } from "./local-date";
import type { Tone } from "./tone";

/* -------------------------------------------------------------------------- */
/* Tiles                                                                      */
/* -------------------------------------------------------------------------- */

export const TILE_WINDOW = 14;

export interface OverviewTiles {
  discipline: number | null; // % of last 14 recorded sessions graded "full"
  execution: number | null; // % of today's executions inside the locked plan
  ruleAdherence: number | null; // rule checks followed / required across today's executions
  consistency: number | null; // sessions recorded in the last 14 days / 14
}

function pct(n: number, d: number): number | null {
  return d > 0 ? Math.round((n / d) * 100) : null;
}

export function computeTiles(recaps: DayRecap[], today: DaySession): OverviewTiles {
  const recent = [...recaps].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)).slice(0, TILE_WINDOW);
  const discipline = recaps.length ? pct(recent.filter((r) => r.discipline === "full").length, recent.length) : null;

  const last14 = new Set<string>();
  const d = new Date();
  for (let i = 0; i < TILE_WINDOW; i++) {
    last14.add(localDateISO(d));
    d.setDate(d.getDate() - 1);
  }
  const recordedDates = new Set(recaps.map((r) => r.sessionDate));
  const consistency = recaps.length
    ? pct([...last14].filter((d) => recordedDates.has(d)).length, TILE_WINDOW)
    : null;

  const n = today.executions.length;
  let execution: number | null = null;
  let ruleAdherence: number | null = null;
  if (n > 0) {
    let inPlanCount = 0;
    let checksSatisfied = 0;
    const checkOk = isCheckComplete(today.check);
    today.executions.forEach((e, i) => {
      if (executionInPlan(today, i)) inPlanCount++;
      const countOk = i + 1 <= today.rules.maxTrades;
      const riskOk = e.riskR <= today.rules.maxRiskR;
      checksSatisfied += [countOk, riskOk, checkOk].filter(Boolean).length;
    });
    execution = Math.round((inPlanCount / n) * 100);
    ruleAdherence = Math.round((checksSatisfied / (3 * n)) * 100);
  }

  return { discipline, execution, ruleAdherence, consistency };
}

/* -------------------------------------------------------------------------- */
/* Behaviour signal: ON PLAN or ATTENTION                                    */
/* -------------------------------------------------------------------------- */

export type SignalState = "on-plan" | "attention";

export interface BehaviourSignal {
  state: SignalState;
  tone: Tone;
  headline: string;
  lines: string[];
}

export const SIGNAL_LABEL: Record<SignalState, string> = {
  "on-plan": "On Plan",
  attention: "Attention",
};

function kindLabel(kind: BreachKind, rules: DaySession["rules"]): string {
  if (kind === "max-trades") return `max trades (${rules.maxTrades})`;
  if (kind === "max-risk") return `risk over ${rules.maxRiskR}R`;
  return BREACH_LABEL[kind];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function deriveSignal(today: DaySession, history: TodaySessions): BehaviourSignal {
  const breachesToday = computeBreaches(today);
  const kinds = [...new Set(breachesToday.map((b) => b.kind))];

  const prior = priorSessions(history, 3, today.date);
  const priorAsc = [...prior].reverse(); // oldest → newest
  const priorCounts = priorAsc.map((s) => computeBreaches(s).length);
  const risingTrend =
    priorCounts.length === 3 && priorCounts[0] < priorCounts[1] && priorCounts[1] < priorCounts[2];

  const patienceToday = averagePatienceMinutes(today);
  const priorGaps = prior.flatMap((s) => {
    const avg = averagePatienceMinutes(s);
    return avg == null ? [] : [avg];
  });
  const patiencePrior = priorGaps.length ? priorGaps.reduce((a, b) => a + b, 0) / priorGaps.length : null;

  const lines: string[] = [];
  if (patienceToday != null && patiencePrior != null) {
    lines.push(
      `Patience: ${round1(patienceToday)} min after a loss today vs ${round1(patiencePrior)} min average over your last ${prior.length} session${prior.length === 1 ? "" : "s"}.`
    );
  }

  if (breachesToday.length > 0) {
    const labels = kinds.map((k) => kindLabel(k, today.rules));
    lines.unshift(
      `${breachesToday.length} rule${breachesToday.length === 1 ? "" : "s"} broken today: ${labels.join(", ")}.`
    );
    return {
      state: "attention",
      tone: "attention",
      headline: `${breachesToday.length} rule${breachesToday.length === 1 ? "" : "s"} broken today: ${labels.join(", ")}`,
      lines: lines.slice(1),
    };
  }

  if (risingTrend) {
    const headline = `Rule breaches have risen over your last 3 sessions (${priorCounts.join(" → ")}).`;
    return { state: "attention", tone: "attention", headline, lines };
  }

  return {
    state: "on-plan",
    tone: "positive",
    headline: "On plan. No rule breaches today.",
    lines,
  };
}

/* -------------------------------------------------------------------------- */
/* Recent behaviour timeline                                                 */
/* -------------------------------------------------------------------------- */

export type TimelineKind = "session" | "check" | "execution" | "breach";

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  dateLabel: string;
  timeLabel: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  tone: Tone;
}

function sessionEvents(session: DaySession, dateLabel: (iso: string) => string): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  if (session.lockedAt) {
    out.push({
      id: `${session.date}-lock`,
      at: session.lockedAt,
      dateLabel: dateLabel(session.date),
      timeLabel: new Date(session.lockedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      kind: "session",
      title: "Session started",
      detail: `Locked · max ${session.rules.maxTrades} executions, ${session.rules.maxRiskR}R max risk`,
      tone: "neutral",
    });
  }
  if (session.checkCompletedAt) {
    out.push({
      id: `${session.date}-check`,
      at: session.checkCompletedAt,
      dateLabel: dateLabel(session.date),
      timeLabel: new Date(session.checkCompletedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      kind: "check",
      title: "Pre-trade check completed",
      detail: "All checks confirmed",
      tone: "positive",
    });
  }
  session.executions.forEach((e, i) => {
    out.push({
      id: e.id,
      at: e.at,
      dateLabel: dateLabel(session.date),
      timeLabel: new Date(e.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      kind: "execution",
      title: `Trade logged · #${i + 1}`,
      detail: `${e.outcome === "win" ? "Win" : e.outcome === "loss" ? "Loss" : "Break-even"} · ${e.riskR}R risked`,
      tone: "neutral",
    });
  });
  for (const b of computeBreaches(session)) {
    out.push({
      id: b.id,
      at: b.at,
      dateLabel: dateLabel(session.date),
      timeLabel: new Date(b.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      kind: "breach",
      title: "Rule breach",
      detail: `${kindLabel(b.kind, session.rules)} · ${b.detail}`,
      tone: "risk",
    });
  }
  return out;
}

// Chronological (most recent first) events across the most recently active
// days in the local Today store — session started, check completed, each
// trade logged, each auto-detected rule breach.
export function buildTimeline(
  history: TodaySessions,
  dateLabel: (iso: string) => string,
  dayLimit = 5
): TimelineEvent[] {
  const days = allSessionsDesc(history).slice(0, dayLimit);
  const events = days.flatMap((s) => sessionEvents(s, dateLabel));
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

/* -------------------------------------------------------------------------- */
/* Performance — small, secondary                                            */
/* -------------------------------------------------------------------------- */

export interface PerformanceStats {
  trades: number;
  netR: number | null;
  winRate: number | null;
}

export function computePerformance(recaps: DayRecap[]): PerformanceStats {
  const traded = recaps.filter((r) => r.outcome !== "no-trade");
  const withR = traded.filter((r) => r.rMultiple != null);
  const netR = withR.length ? Math.round(withR.reduce((s, r) => s + (r.rMultiple ?? 0), 0) * 100) / 100 : null;
  const wins = traded.filter((r) => r.outcome === "win").length;
  return {
    trades: traded.length,
    netR,
    winRate: traded.length ? Math.round((wins / traded.length) * 100) : null,
  };
}

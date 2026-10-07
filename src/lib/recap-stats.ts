// Derived statistics over a trader's day recaps. Pure functions (no React, no
// network) shared by the dashboard and the history page so the streak, adherence
// and heatmap numbers are computed identically everywhere.

import {
  type RuleState,
  type Outcome,
  type Discipline,
} from "./trade-rules";

export interface DayRecap {
  id?: number;
  sessionDate: string; // YYYY-MM-DD
  rules: RuleState;
  rulesFollowed: number;
  rulesTotal: number;
  outcome: Outcome;
  rMultiple: number | null;
  riskUsed: number | null;
  pair: string;
  notes: string;
  discipline: Discipline;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function sortedDesc(recaps: DayRecap[]): DayRecap[] {
  return [...recaps].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
}

// Consecutive most-recent days graded "full". A patient no-trade day grades full
// (see gradeDiscipline) so waiting for a valid setup extends the streak.
export function currentStreak(recaps: DayRecap[]): number {
  let streak = 0;
  for (const r of sortedDesc(recaps)) {
    if (r.discipline === "full") streak++;
    else break;
  }
  return streak;
}

export function longestStreak(recaps: DayRecap[]): number {
  const asc = [...recaps].sort((a, b) =>
    a.sessionDate.localeCompare(b.sessionDate)
  );
  let max = 0;
  let run = 0;
  for (const r of asc) {
    if (r.discipline === "full") {
      run++;
      max = Math.max(max, run);
    } else {
      run = 0;
    }
  }
  return max;
}

// Average % of entry rules followed across every logged recap.
export function avgAdherence(recaps: DayRecap[]): number {
  if (recaps.length === 0) return 0;
  const sum = recaps.reduce(
    (s, r) => s + (r.rulesTotal ? r.rulesFollowed / r.rulesTotal : 0),
    0
  );
  return Math.round((sum / recaps.length) * 100);
}

export function tradedRecaps(recaps: DayRecap[]): DayRecap[] {
  return recaps.filter((r) => r.outcome !== "no-trade");
}

export function winRate(recaps: DayRecap[]): number {
  const traded = tradedRecaps(recaps);
  if (traded.length === 0) return 0;
  const wins = traded.filter((r) => r.outcome === "win").length;
  return Math.round((wins / traded.length) * 100);
}

export function findByDate(
  recaps: DayRecap[],
  date: string
): DayRecap | undefined {
  return recaps.find((r) => r.sessionDate === date);
}

export interface RecapSummary {
  total: number;
  tradedCount: number;
  greenRate: number;
  currentStreak: number;
  longestStreak: number;
  avgAdherence: number;
  winRate: number;
  today: DayRecap | undefined;
  latest: DayRecap | undefined;
  recent: DayRecap[];
}

export function summarise(recaps: DayRecap[]): RecapSummary {
  const desc = sortedDesc(recaps);
  const greenDays = recaps.filter((r) => r.discipline === "full").length;
  return {
    total: recaps.length,
    tradedCount: tradedRecaps(recaps).length,
    greenRate: recaps.length ? Math.round((greenDays / recaps.length) * 100) : 0,
    currentStreak: currentStreak(recaps),
    longestStreak: longestStreak(recaps),
    avgAdherence: avgAdherence(recaps),
    winRate: winRate(recaps),
    today: findByDate(recaps, todayISO()),
    latest: desc[0],
    recent: desc.slice(0, 8),
  };
}

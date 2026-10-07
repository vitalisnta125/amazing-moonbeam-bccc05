// The trader's pre-trade entry checklist — the rules they commit to confirming
// before every trade. These power both the real-time Pre-Trade Check and the
// backfill Recap page, and are the single source of truth for both. Plain data
// only (no React) so the server functions can import the discipline helper too.

export interface TradeRule {
  id: string;
  label: string;
  short: string;
}

export const TRADE_RULES: TradeRule[] = [
  { id: "candles12", label: "First 12 candles closed", short: "12 candles" },
  { id: "dridr", label: "DR/IDR marked", short: "DR/IDR" },
  { id: "brokeDr", label: "Price broke DR", short: "Broke DR" },
  { id: "htf", label: "HTF high/low confirmed", short: "HTF" },
  { id: "fib", label: "Fib drawn", short: "Fib" },
  { id: "retrace", label: "Price at 70-79% retracement", short: "Retrace" },
  { id: "supplyDemand", label: "Supply/Demand present", short: "S/D" },
  { id: "rejection", label: "Rejection confirmed", short: "Rejection" },
  { id: "tp", label: "TP area checked", short: "TP area" },
  { id: "risk", label: "Risk correct (1% or 0.5%)", short: "Risk" },
];

export const RULES_TOTAL = TRADE_RULES.length;

export type RuleState = Record<string, boolean>;

export type Outcome = "win" | "loss" | "breakeven" | "no-trade";

export type Discipline = "full" | "partial" | "broken" | "none";

// Outcome is financial information, not a behavioural state, so outcomes are
// shown in neutral tones; colour is reserved for execution quality.
export const OUTCOMES: { value: Outcome; label: string; color: string }[] = [
  { value: "win", label: "Win", color: "var(--color-fg)" },
  { value: "loss", label: "Loss", color: "var(--color-fg)" },
  { value: "breakeven", label: "Break-even", color: "var(--color-fg)" },
  { value: "no-trade", label: "No trade", color: "var(--color-fg)" },
];

export function countFollowed(rules: RuleState): number {
  return TRADE_RULES.reduce((n, r) => (rules[r.id] ? n + 1 : n), 0);
}

// Discipline is about following the process, not the P&L. A patient no-trade day
// (no valid setup) is disciplined and counts as a clean/full day. When a trade is
// taken, the grade scales with how many of the entry rules were genuinely met.
export function gradeDiscipline(
  followed: number,
  total: number,
  outcome: Outcome
): Discipline {
  if (outcome === "no-trade") return "full";
  if (followed >= total) return "full";
  if (followed >= Math.ceil(total * 0.7)) return "partial";
  return "broken";
}

export const DISCIPLINE_COLOR: Record<Discipline, string> = {
  full: "var(--color-mint)",
  partial: "var(--color-amber)",
  broken: "var(--color-red)",
  none: "var(--color-panel-2)",
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  full: "Rules Followed",
  partial: "Partial",
  broken: "Broke Protocol",
  none: "No Session",
};

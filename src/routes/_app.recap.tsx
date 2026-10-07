import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useEliteMode } from "../lib/elite-mode-context";
import { useRecaps } from "../lib/recaps-context";
import {
  TRADE_RULES,
  RULES_TOTAL,
  OUTCOMES,
  countFollowed,
  gradeDiscipline,
  DISCIPLINE_COLOR,
  DISCIPLINE_LABEL,
  type RuleState,
  type Outcome,
} from "../lib/trade-rules";
import { findByDate, todayISO, type DayRecap } from "../lib/recap-stats";

export const Route = createFileRoute("/_app/recap")({
  component: RecapPage,
});

const EMPTY_RULES: RuleState = {};

function RecapPage() {
  const { eliteMode } = useEliteMode();
  const { recaps, ready, save } = useRecaps();
  const brand = eliteMode ? "#ff3d00" : "var(--color-brand)";

  const [date, setDate] = useState(todayISO());
  const [rules, setRules] = useState<RuleState>(EMPTY_RULES);
  const [outcome, setOutcome] = useState<Outcome>("no-trade");
  const [rMultiple, setRMultiple] = useState<number | null>(null);
  const [riskUsed, setRiskUsed] = useState<number | null>(null);
  const [pair, setPair] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const existing = useMemo(
    () => findByDate(recaps, date),
    [recaps, date]
  );

  // Whenever the selected date (or the loaded recaps) changes, hydrate the form
  // from any existing entry so backfilling becomes editing rather than guessing.
  useEffect(() => {
    if (existing) {
      setRules(existing.rules ?? {});
      setOutcome(existing.outcome);
      setRMultiple(existing.rMultiple);
      setRiskUsed(existing.riskUsed);
      setPair(existing.pair ?? "");
      setNotes(existing.notes ?? "");
    } else {
      setRules(EMPTY_RULES);
      setOutcome("no-trade");
      setRMultiple(null);
      setRiskUsed(null);
      setPair("");
      setNotes("");
    }
  }, [existing, date]);

  const followed = countFollowed(rules);
  const discipline = gradeDiscipline(followed, RULES_TOTAL, outcome);
  const traded = outcome !== "no-trade";

  function toggleRule(id: string) {
    setRules((r) => ({ ...r, [id]: !r[id] }));
    setJustSaved(false);
  }

  function setAll(value: boolean) {
    const next: RuleState = {};
    for (const r of TRADE_RULES) next[r.id] = value;
    setRules(next);
    setJustSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await save({
        sessionDate: date,
        rules,
        outcome,
        rMultiple: traded ? rMultiple : null,
        riskUsed,
        pair: pair.trim(),
        notes: notes.trim(),
      });
      setJustSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {eliteMode ? "Mission Debrief" : "Trade Recap"}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Log a session — today, or backfill a past day you couldn't record in
          real time. One entry per day; saving again updates it.
        </p>
      </div>

      {/* Date + discipline preview */}
      <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Session Date
            </label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => {
                setDate(e.target.value || todayISO());
                setJustSaved(false);
              }}
              className="px-4 py-2.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none transition-colors"
              style={{ colorScheme: "dark" }}
            />
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
              {existing
                ? "Editing an existing entry for this day."
                : "New entry."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-secondary)] mb-1">
              Discipline
            </p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: DISCIPLINE_COLOR[discipline],
                color: discipline === "partial" ? "#000" : "#fff",
              }}
            >
              {DISCIPLINE_LABEL[discipline]}
            </span>
            <p className="text-sm font-black text-[var(--color-text-primary)] mt-1.5">
              {followed}/{RULES_TOTAL} rules
            </p>
          </div>
        </div>
      </div>

      {/* Outcome */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Outcome
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setOutcome(o.value);
                setJustSaved(false);
              }}
              className="py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border"
              style={{
                backgroundColor:
                  outcome === o.value ? `${o.color}20` : "var(--color-surface-card)",
                borderColor: outcome === o.value ? o.color : "var(--color-border)",
                color: outcome === o.value ? o.color : "var(--color-text-secondary)",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entry checklist — the trader's 10 rules */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Entry Checklist
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAll(true)}
              className="text-[11px] font-semibold bg-transparent border-none cursor-pointer"
              style={{ color: brand }}
            >
              Check all
            </button>
            <button
              onClick={() => setAll(false)}
              className="text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {TRADE_RULES.map((rule) => {
            const checked = !!rules[rule.id];
            return (
              <button
                key={rule.id}
                onClick={() => toggleRule(rule.id)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer border"
                style={{
                  backgroundColor: checked
                    ? eliteMode
                      ? "rgba(255,61,0,0.08)"
                      : "rgba(0,255,136,0.08)"
                    : "var(--color-surface-card)",
                  borderColor: checked ? brand : "var(--color-border)",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[13px] font-black flex-shrink-0"
                  style={{
                    backgroundColor: checked ? brand : "transparent",
                    border: checked ? "none" : "1px solid var(--color-border)",
                    color: eliteMode ? "#fff" : "var(--color-surface)",
                  }}
                >
                  {checked ? "✓" : ""}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: checked
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {rule.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional trade detail — only relevant when a trade was taken */}
      {traded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Result (R multiple)
            </label>
            <input
              type="number"
              step={0.1}
              value={rMultiple ?? ""}
              onChange={(e) => {
                setRMultiple(
                  e.target.value === "" ? null : parseFloat(e.target.value)
                );
                setJustSaved(false);
              }}
              placeholder="e.g. 1.5 or -0.5"
              className="w-full px-4 py-2.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Instrument (optional)
            </label>
            <input
              type="text"
              value={pair}
              onChange={(e) => {
                setPair(e.target.value);
                setJustSaved(false);
              }}
              placeholder="e.g. EUR/USD, NQ, ES"
              className="w-full px-4 py-2.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Risk used */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Risk Used (optional)
        </label>
        <div className="flex gap-2">
          {[0.5, 1].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRiskUsed(riskUsed === r ? null : r);
                setJustSaved(false);
              }}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border"
              style={{
                backgroundColor:
                  riskUsed === r ? brand : "var(--color-surface-card)",
                borderColor: riskUsed === r ? brand : "var(--color-border)",
                color:
                  riskUsed === r
                    ? eliteMode
                      ? "#fff"
                      : "var(--color-surface)"
                    : "var(--color-text-secondary)",
              }}
            >
              {r}%
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setJustSaved(false);
          }}
          rows={3}
          placeholder="What happened, what you saw, how you executed..."
          className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none transition-colors resize-y"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-base disabled:opacity-50"
        style={{
          backgroundColor: brand,
          color: eliteMode ? "#fff" : "var(--color-surface)",
        }}
      >
        {saving
          ? "Saving…"
          : justSaved
            ? "Saved ✓"
            : existing
              ? "Update Recap"
              : "Save Recap"}
      </button>

      {/* Recent recaps — tap to load into the form for editing */}
      <RecentRecaps
        recaps={recaps}
        ready={ready}
        selectedDate={date}
        onPick={setDate}
      />
    </div>
  );
}

function RecentRecaps({
  recaps,
  ready,
  selectedDate,
  onPick,
}: {
  recaps: DayRecap[];
  ready: boolean;
  selectedDate: string;
  onPick: (date: string) => void;
}) {
  if (!ready) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] mt-8 text-center">
        Loading your recaps…
      </p>
    );
  }
  if (recaps.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] mt-8 text-center">
        No recaps yet. Your saved sessions will appear here and feed your
        dashboard and streak.
      </p>
    );
  }
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Recent Recaps</h2>
      <div className="space-y-2">
        {recaps.slice(0, 30).map((r) => {
          const selected = r.sessionDate === selectedDate;
          const outcome = OUTCOMES.find((o) => o.value === r.outcome);
          return (
            <button
              key={r.sessionDate}
              onClick={() => onPick(r.sessionDate)}
              className="w-full flex items-center justify-between gap-3 rounded-lg p-4 text-left transition-all cursor-pointer border"
              style={{
                backgroundColor: "var(--color-surface-card)",
                borderColor: selected ? "var(--color-brand)" : "var(--color-border)",
              }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {r.sessionDate}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {r.rulesFollowed}/{r.rulesTotal} rules
                  {outcome ? ` · ${outcome.label}` : ""}
                  {r.rMultiple != null ? ` · ${r.rMultiple > 0 ? "+" : ""}${r.rMultiple}R` : ""}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{
                  backgroundColor: DISCIPLINE_COLOR[r.discipline],
                  color: r.discipline === "partial" ? "#000" : "#fff",
                }}
              >
                {DISCIPLINE_LABEL[r.discipline]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

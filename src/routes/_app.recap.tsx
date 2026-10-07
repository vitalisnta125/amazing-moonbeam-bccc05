import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRecaps } from "../lib/recaps-context";
import {
  TRADE_RULES,
  RULES_TOTAL,
  OUTCOMES,
  countFollowed,
  gradeDiscipline,
  DISCIPLINE_LABEL,
  type RuleState,
  type Outcome,
} from "../lib/trade-rules";
import { findByDate, todayISO, type DayRecap } from "../lib/recap-stats";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";
import { Tag } from "../components/ui/Tag";
import type { Tone } from "../lib/tone";

const DISCIPLINE_TONE: Record<string, Tone> = {
  full: "positive",
  partial: "attention",
  broken: "risk",
  none: "neutral",
};

export const Route = createFileRoute("/_app/recap")({
  component: RecapPage,
});

const EMPTY_RULES: RuleState = {};

function RecapPage() {
  const { recaps, ready, save } = useRecaps();

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
    <Page>
      <PageHeader
        title="Trades"
        description="Record a session — today, or backfill a past day. One entry per day; saving again updates it."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-8 flex flex-col gap-3 lg:gap-4">
          {/* Date + discipline preview */}
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label className="label-caps block mb-2">Session date</label>
                <input
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => {
                    setDate(e.target.value || todayISO());
                    setJustSaved(false);
                  }}
                  className="field num w-auto"
                />
                <p className="text-[11px] text-fg-3 m-0 mt-1.5">
                  {existing ? "Editing an existing entry for this day." : "New entry."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="label-caps m-0 text-[10px]">Execution</p>
                  <p className="num text-[18px] leading-none text-fg m-0 mt-1.5">
                    {followed}/{RULES_TOTAL}
                  </p>
                </div>
                <Tag tone={DISCIPLINE_TONE[discipline]} dot>
                  {DISCIPLINE_LABEL[discipline]}
                </Tag>
              </div>
            </div>
          </Panel>

          {/* Entry checklist — the trader's 10 rules */}
          <Panel
            label="Entry checklist"
            right={
              <>
                <button onClick={() => setAll(true)} className="btn btn-ghost h-6 px-2 text-[12px]">
                  Check all
                </button>
                <button onClick={() => setAll(false)} className="btn btn-ghost h-6 px-2 text-[12px]">
                  Clear
                </button>
              </>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {TRADE_RULES.map((rule) => {
                const checked = !!rules[rule.id];
                return (
                  <button
                    key={rule.id}
                    onClick={() => toggleRule(rule.id)}
                    className="option flex items-center gap-3 px-3 h-9 text-left text-[13px]"
                    data-active={checked}
                    aria-pressed={checked}
                  >
                    <span className="check-box" data-checked={checked}>
                      {checked ? "✓" : ""}
                    </span>
                    <span className="truncate">{rule.label}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Outcome — recorded, but secondary to execution */}
          <Panel label="Outcome" meta="Secondary to execution">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setOutcome(o.value);
                    setJustSaved(false);
                  }}
                  className="option h-9 text-[13px]"
                  data-active={outcome === o.value}
                  aria-pressed={outcome === o.value}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {traded && (
                <div>
                  <label className="label-caps block mb-2">Result (R multiple)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={rMultiple ?? ""}
                    onChange={(e) => {
                      setRMultiple(e.target.value === "" ? null : parseFloat(e.target.value));
                      setJustSaved(false);
                    }}
                    placeholder="e.g. 1.5 or -0.5"
                    className="field num"
                  />
                </div>
              )}
              {traded && (
                <div>
                  <label className="label-caps block mb-2">Instrument (optional)</label>
                  <input
                    type="text"
                    value={pair}
                    onChange={(e) => {
                      setPair(e.target.value);
                      setJustSaved(false);
                    }}
                    placeholder="e.g. EUR/USD, NQ, ES"
                    className="field"
                  />
                </div>
              )}
              <div>
                <label className="label-caps block mb-2">Risk used (optional)</label>
                <div className="flex gap-1.5">
                  {[0.5, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRiskUsed(riskUsed === r ? null : r);
                        setJustSaved(false);
                      }}
                      className="option num h-[34px] px-4 text-[13px]"
                      data-active={riskUsed === r}
                      aria-pressed={riskUsed === r}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {/* Notes */}
          <Panel label="Notes">
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setJustSaved(false);
              }}
              rows={3}
              placeholder="What happened, what you saw, how you executed..."
              className="field resize-y"
            />
            <div className="flex justify-end mt-3">
              <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg">
                {saving ? "Saving…" : justSaved ? "Saved ✓" : existing ? "Update recap" : "Save recap"}
              </button>
            </div>
          </Panel>
        </div>

        {/* Recent recaps — tap to load into the form for editing */}
        <div className="lg:col-span-4">
          <RecentRecaps recaps={recaps} ready={ready} selectedDate={date} onPick={setDate} />
        </div>
      </div>
    </Page>
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
  return (
    <Panel label="Recent recaps" meta={ready && recaps.length ? `${Math.min(30, recaps.length)} shown` : undefined}>
      {!ready ? (
        <p className="text-[13px] text-fg-3 m-0">Loading your recaps…</p>
      ) : recaps.length === 0 ? (
        <p className="text-[13px] text-fg-3 m-0">
          No recaps yet. Your saved sessions will appear here and feed your Overview and streak.
        </p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-px -mx-2">
          {recaps.slice(0, 30).map((r) => {
            const selected = r.sessionDate === selectedDate;
            const outcome = OUTCOMES.find((o) => o.value === r.outcome);
            return (
              <li key={r.sessionDate}>
                <button
                  onClick={() => onPick(r.sessionDate)}
                  className={`w-full flex items-center justify-between gap-3 rounded-[4px] px-2 py-2 text-left cursor-pointer border-none transition-colors ${selected ? "bg-panel-2" : "bg-transparent hover:bg-panel-2"}`}
                >
                  <div className="min-w-0">
                    <p className="num text-[13px] text-fg m-0">{r.sessionDate}</p>
                    <p className="text-[12px] text-fg-3 m-0">
                      <span className="num">
                        {r.rulesFollowed}/{r.rulesTotal}
                      </span>{" "}
                      rules
                      {outcome ? ` · ${outcome.label}` : ""}
                      {r.rMultiple != null && (
                        <span className="num"> · {`${r.rMultiple > 0 ? "+" : ""}${r.rMultiple}R`}</span>
                      )}
                    </p>
                  </div>
                  <Tag tone={DISCIPLINE_TONE[r.discipline] ?? "neutral"}>{DISCIPLINE_LABEL[r.discipline]}</Tag>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useEliteMode } from "../lib/elite-mode-context";
import { useRecaps } from "../lib/recaps-context";
import { TRADE_RULES, RULES_TOTAL, type RuleState } from "../lib/trade-rules";
import { findByDate, todayISO } from "../lib/recap-stats";

export const Route = createFileRoute("/_app/check")({
  component: PreTradeCheckPage,
});

function PreTradeCheckPage() {
  const { eliteMode } = useEliteMode();
  const { recaps, save } = useRecaps();
  const [rules, setRules] = useState<RuleState>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const followed = TRADE_RULES.reduce((n, r) => (rules[r.id] ? n + 1 : n), 0);
  const score = Math.round((followed / RULES_TOTAL) * 100);
  const valid = followed === RULES_TOTAL;

  const scoreColor = valid
    ? "var(--color-success)"
    : followed >= Math.ceil(RULES_TOTAL * 0.7)
      ? "var(--color-streak-amber)"
      : followed > 0
        ? "var(--color-danger)"
        : "var(--color-text-secondary)";

  function toggle(id: string) {
    setRules((r) => ({ ...r, [id]: !r[id] }));
  }

  // Record the confirmed rules onto today's recap. Any outcome already logged for
  // today is preserved (a later result update in Recap regrades the day).
  async function handleSubmit() {
    setSaving(true);
    try {
      const today = todayISO();
      const existing = findByDate(recaps, today);
      await save({
        sessionDate: today,
        rules,
        outcome: existing?.outcome ?? "no-trade",
        rMultiple: existing?.rMultiple ?? null,
        riskUsed: existing?.riskUsed ?? null,
        pair: existing?.pair ?? "",
        notes: existing?.notes ?? "",
      });
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <h1 className="text-2xl font-bold mb-6">{eliteMode ? "Systems Diagnostic" : "Pre-Trade Check"}</h1>
        <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="text-6xl font-black mb-2" style={{ color: scoreColor }}>
            {followed}/{RULES_TOTAL}
          </div>
          <p className="text-[var(--color-text-secondary)] mb-4">Confirmations met</p>
          {valid ? (
            <div className="inline-block px-4 py-2 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] font-semibold text-sm">
              {eliteMode ? "Valid setup — cleared for engagement" : "Valid setup — every confirmation is present"}
            </div>
          ) : (
            <div className="inline-block px-4 py-2 rounded-lg bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-semibold text-sm">
              {eliteMode ? "Setup incomplete — stand down" : "Setup incomplete — this is a no-trade"}
            </div>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-4">
            Saved to today's recap. Add your result in the Recap page once the
            session closes.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link
              to="/recap"
              className="px-5 py-2.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-lg font-semibold text-sm hover:bg-[var(--color-brand-dark)] transition-colors no-underline"
            >
              Log Result →
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setRules({});
              }}
              className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold text-sm hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent"
            >
              {eliteMode ? "Run Again" : "Redo Check"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{eliteMode ? "Systems Diagnostic" : "Pre-Trade Check"}</h1>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Confirm every entry rule before you take the trade. All ten must be true
        for a valid setup.
      </p>

      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6 text-center">
        <div className="text-5xl font-black mb-1" style={{ color: scoreColor }}>
          {followed}/{RULES_TOTAL}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Confirmations met
        </p>
        <div className="mt-3 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${score}%`, backgroundColor: scoreColor }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {TRADE_RULES.map((rule) => {
          const checked = !!rules[rule.id];
          return (
            <button
              key={rule.id}
              onClick={() => toggle(rule.id)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all cursor-pointer border"
              style={{
                backgroundColor: checked
                  ? eliteMode
                    ? "rgba(255,61,0,0.08)"
                    : "rgba(0,255,136,0.08)"
                  : "var(--color-surface-card)",
                borderColor: checked
                  ? eliteMode
                    ? "#ff3d00"
                    : "var(--color-brand)"
                  : "var(--color-border)",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-[13px] font-black flex-shrink-0"
                style={{
                  backgroundColor: checked
                    ? eliteMode
                      ? "#ff3d00"
                      : "var(--color-brand)"
                    : "transparent",
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

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-xl font-semibold hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50 cursor-pointer border-none text-base"
      >
        {saving
          ? "Saving…"
          : `${eliteMode ? "Execute Diagnostic" : "Save Check"} (${followed}/${RULES_TOTAL})`}
      </button>
    </div>
  );
}

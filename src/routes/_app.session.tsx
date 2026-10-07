import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useEliteMode } from "../lib/elite-mode-context";
import { useSessionPlan } from "../lib/session-plan-context";

export const Route = createFileRoute("/_app/session")({
  component: SessionPlanPage,
});

const SESSION_TYPES = [
  { value: "london", label: "London", time: "08:00 - 12:00 GMT" },
  { value: "newyork", label: "New York", time: "13:00 - 17:00 GMT" },
  { value: "asian", label: "Asian", time: "00:00 - 06:00 GMT" },
  { value: "overlap", label: "London/NY Overlap", time: "13:00 - 16:00 GMT" },
];

const BIAS_OPTIONS = [
  { value: "bullish", label: "Bullish", icon: "▲", color: "var(--color-success)" },
  { value: "bearish", label: "Bearish", icon: "▼", color: "var(--color-danger)" },
  { value: "neutral", label: "Neutral", icon: "◆", color: "var(--color-streak-amber)" },
];

function SessionPlanPage() {
  const [sessionType, setSessionType] = useState("london");
  const [bias, setBias] = useState("neutral");
  const [maxTrades, setMaxTrades] = useState(3);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [notes, setNotes] = useState("");
  const { eliteMode } = useEliteMode();
  const { lockedPlan, lockPlan, unlockPlan } = useSessionPlan();

  const biasOpt = BIAS_OPTIONS.find((b) => b.value === bias);
  const sessOpt = SESSION_TYPES.find((s) => s.value === sessionType);

  const handleLock = () => {
    lockPlan({
      sessionType,
      sessionLabel: sessOpt?.label ?? sessionType,
      sessionTime: sessOpt?.time ?? "",
      bias,
      biasLabel: biasOpt?.label ?? bias,
      biasIcon: biasOpt?.icon ?? "",
      biasColor: biasOpt?.color ?? "",
      maxTrades,
      riskPerTrade,
      notes,
    });
  };

  const handleEdit = () => {
    if (lockedPlan) {
      setSessionType(lockedPlan.sessionType);
      setBias(lockedPlan.bias);
      setMaxTrades(lockedPlan.maxTrades);
      setRiskPerTrade(lockedPlan.riskPerTrade);
      setNotes(lockedPlan.notes);
    }
    unlockPlan();
  };

  if (lockedPlan) {
    const lBias = BIAS_OPTIONS.find((b) => b.value === lockedPlan.bias);
    const lSess = SESSION_TYPES.find((s) => s.value === lockedPlan.sessionType);
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <h1 className="text-2xl font-bold mb-6">{eliteMode ? "Mission Parameters" : "Session Plan"}</h1>
        <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
            <span className="text-sm font-semibold text-[var(--color-success)]">{eliteMode ? "PARAMETERS LOCKED" : "PLAN LOCKED"}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Session</p>
              <p className="font-semibold">{lSess?.label}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{lSess?.time}</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Bias</p>
              <p className="font-semibold" style={{ color: lBias?.color }}>
                {lBias?.icon} {lBias?.label}
              </p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Max Trades</p>
              <p className="text-2xl font-black">{lockedPlan.maxTrades}</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Risk Per Trade</p>
              <p className="text-2xl font-black">{lockedPlan.riskPerTrade}%</p>
            </div>
          </div>

          {lockedPlan.notes && (
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 mb-4">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm">{lockedPlan.notes}</p>
            </div>
          )}

          <div className="bg-[var(--color-brand)]/5 border border-[var(--color-brand)]/20 rounded-lg p-4 text-center mb-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {eliteMode
                ? "Parameters locked. Any deviation is a breach of protocol."
                : "Your plan is locked. Anything outside these rules breaks your identity."}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              to="/journal"
              className="px-5 py-2.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-lg font-semibold text-sm hover:bg-[var(--color-brand-dark)] transition-colors no-underline"
            >
              Go to Journal →
            </Link>
            <button
              onClick={handleEdit}
              className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold text-sm hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent"
            >
              Edit Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">{eliteMode ? "Mission Configuration" : "Session Plan Builder"}</h1>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6">
        {eliteMode
          ? "Define engagement parameters. Once confirmed, deviation is not an option."
          : "Set your rules before you trade. Once submitted, your plan is locked and visible all session."}
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Trading Session
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SESSION_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSessionType(s.value)}
                className="p-4 rounded-xl text-left transition-all cursor-pointer border"
                style={{
                  backgroundColor:
                    sessionType === s.value ? "var(--color-brand)" : "var(--color-surface-card)",
                  borderColor:
                    sessionType === s.value ? "var(--color-brand)" : "var(--color-border)",
                  color: sessionType === s.value ? "var(--color-surface)" : "var(--color-text-primary)",
                }}
              >
                <p className="font-semibold text-sm">{s.label}</p>
                <p className="text-xs mt-0.5" style={{ opacity: sessionType === s.value ? 0.8 : 0.5 }}>
                  {s.time}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Market Bias
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BIAS_OPTIONS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBias(b.value)}
                className="p-4 rounded-xl text-center transition-all cursor-pointer border"
                style={{
                  backgroundColor: bias === b.value ? `${b.color}15` : "var(--color-surface-card)",
                  borderColor: bias === b.value ? b.color : "var(--color-border)",
                  color: bias === b.value ? b.color : "var(--color-text-primary)",
                }}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="font-semibold text-sm">{b.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Max Trades
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMaxTrades(Math.max(1, maxTrades - 1))}
                className="w-10 h-10 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer flex items-center justify-center text-lg font-bold"
              >
                -
              </button>
              <span className="text-3xl font-black w-12 text-center">{maxTrades}</span>
              <button
                onClick={() => setMaxTrades(Math.min(10, maxTrades + 1))}
                className="w-10 h-10 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer flex items-center justify-center text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={riskPerTrade}
              onChange={(e) =>
                setRiskPerTrade(Math.max(0.1, Math.min(5, parseFloat(e.target.value) || 0)))
              }
              step={0.25}
              min={0.1}
              max={5}
              className="w-full px-4 py-2.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-center text-xl font-bold focus:outline-none focus:border-[var(--color-brand)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Session Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-y"
            placeholder="Key levels to watch, reminders, setup ideas..."
          />
        </div>

        <button
          onClick={handleLock}
          className="w-full py-3.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-xl font-semibold hover:bg-[var(--color-brand-dark)] transition-colors cursor-pointer border-none text-base"
        >
          Lock {eliteMode ? "Parameters" : "Session Plan"}
        </button>
      </div>
    </div>
  );
}

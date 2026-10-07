import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useEliteMode } from "../lib/elite-mode-context";

export const Route = createFileRoute("/_app/journal")({
  component: JournalPage,
});

const EMOTION_LABELS = [
  { value: 1, label: "Terrible", emoji: "😤" },
  { value: 2, label: "Frustrated", emoji: "😠" },
  { value: 3, label: "Uneasy", emoji: "😟" },
  { value: 4, label: "Okay", emoji: "😐" },
  { value: 5, label: "Calm", emoji: "😊" },
  { value: 6, label: "Focused", emoji: "🎯" },
  { value: 7, label: "Confident", emoji: "💪" },
];

const DEMO_ENTRIES = [
  {
    id: 1,
    sessionDate: "2024-11-19",
    emotionalRating: 6,
    wentWell: "Stuck to my plan, took profit at target. Waited for confirmation before entering.",
    toImprove: "Could have sized up on the second trade — conviction was there but hesitated.",
  },
  {
    id: 2,
    sessionDate: "2024-11-18",
    emotionalRating: 5,
    wentWell: "Followed all rules. Closed at max trades limit.",
    toImprove: "Moved stop loss once — need to trust the original placement.",
  },
  {
    id: 3,
    sessionDate: "2024-11-15",
    emotionalRating: 3,
    wentWell: "Recognised I was emotional and stopped trading early.",
    toImprove: "Should not have opened the third trade. Revenge trading tendency surfaced.",
  },
];

function JournalPage() {
  const [wentWell, setWentWell] = useState("");
  const [toImprove, setToImprove] = useState("");
  const [emotionalRating, setEmotionalRating] = useState(4);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const { eliteMode } = useEliteMode();

  if (submitted) {
    const emo = EMOTION_LABELS.find((e) => e.value === emotionalRating);
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <h1 className="text-2xl font-bold mb-6">{eliteMode ? "Debrief Log" : "Daily Journal"}</h1>
        <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
            <span className="text-sm font-semibold text-[var(--color-success)]">{eliteMode ? "DEBRIEF RECORDED" : "LOGGED FOR TODAY"}</span>
          </div>
          <div className="text-center mb-6">
            <span className="text-4xl">{emo?.emoji}</span>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{emo?.label}</p>
          </div>
          <div className="space-y-4">
            {wentWell && (
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <p className="text-xs text-[var(--color-success)] uppercase tracking-wider font-semibold mb-1">What went well</p>
                <p className="text-sm">{wentWell}</p>
              </div>
            )}
            {toImprove && (
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <p className="text-xs text-[var(--color-streak-amber)] uppercase tracking-wider font-semibold mb-1">What to improve</p>
                <p className="text-sm">{toImprove}</p>
              </div>
            )}
            {additionalNotes && (
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mb-1">Notes</p>
                <p className="text-sm">{additionalNotes}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setWentWell("");
              setToImprove("");
              setAdditionalNotes("");
              setEmotionalRating(4);
            }}
            className="mt-4 w-full py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-sm hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent"
          >
            Write another entry
          </button>
        </div>

        <div>
          <button
            onClick={() => setShowPast(!showPast)}
            className="text-sm text-[var(--color-brand)] bg-transparent border-none cursor-pointer mb-4"
          >
            {showPast ? "Hide past entries" : `View past entries (${DEMO_ENTRIES.length})`}
          </button>
          {showPast && (
            <div className="space-y-3">
              {DEMO_ENTRIES.map((e) => {
                const em = EMOTION_LABELS.find((l) => l.value === e.emotionalRating);
                return (
                  <div key={e.id} className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{e.sessionDate}</span>
                      <span>{em?.emoji} {em?.label}</span>
                    </div>
                    {e.wentWell && (
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        <span className="text-[var(--color-success)]">+</span> {e.wentWell}
                      </p>
                    )}
                    {e.toImprove && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        <span className="text-[var(--color-streak-amber)]">△</span> {e.toImprove}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">
      <h1 className="text-2xl font-bold mb-2">{eliteMode ? "Post-Mission Debrief" : "Daily Journal"}</h1>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6">
        {eliteMode
          ? "Debrief your session. What worked, what didn't, what changes."
          : "Post-session, not post-trade. Quick debrief — under 3 minutes."}
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            How are you feeling?
          </label>
          <div className="flex gap-2 flex-wrap">
            {EMOTION_LABELS.map((e) => (
              <button
                key={e.value}
                onClick={() => setEmotionalRating(e.value)}
                className="flex flex-col items-center px-3 py-2 rounded-xl transition-all cursor-pointer border"
                style={{
                  backgroundColor:
                    emotionalRating === e.value ? "var(--color-brand)" : "var(--color-surface-card)",
                  borderColor:
                    emotionalRating === e.value ? "var(--color-brand)" : "var(--color-border)",
                  color: emotionalRating === e.value ? "var(--color-surface)" : "var(--color-text-primary)",
                }}
              >
                <span className="text-xl">{e.emoji}</span>
                <span className="text-[10px] mt-0.5 font-medium">{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            What went well?
          </label>
          <textarea
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-y"
            placeholder="I stuck to my max trades, took profit at my target..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            What to improve?
          </label>
          <textarea
            value={toImprove}
            onChange={(e) => setToImprove(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-y"
            placeholder="Moved my stop loss, entered too early..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            Anything else? (Optional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-y"
            placeholder="Market context, personal observations..."
          />
        </div>

        <button
          onClick={() => setSubmitted(true)}
          disabled={!wentWell.trim() && !toImprove.trim()}
          className="w-full py-3.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-xl font-semibold hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-40 cursor-pointer border-none text-base"
        >
          {eliteMode ? "Log Debrief" : "Save Journal Entry"}
        </button>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";
import { Tag } from "../components/ui/Tag";

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

// Example debriefs shown as a reference format. Journal entries are not yet
// persisted, so these are labelled as examples in the UI.
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

function EntryBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="py-2.5 border-b border-line-soft last:border-b-0">
      <p className="label-caps m-0 mb-1" style={{ color }}>
        {label}
      </p>
      <p className="text-[13px] text-fg m-0 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function PastEntries() {
  return (
    <Panel label="Past entries" right={<Tag>Examples</Tag>}>
      <ul className="m-0 p-0 list-none divide-y divide-line-soft">
        {DEMO_ENTRIES.map((e) => {
          const em = EMOTION_LABELS.find((l) => l.value === e.emotionalRating);
          return (
            <li key={e.id} className="py-2.5 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <span className="num text-[12px] text-fg-2">{e.sessionDate}</span>
                <span className="text-[11px] text-fg-3">
                  <span className="num">{e.emotionalRating}/7</span> · {em?.label}
                </span>
              </div>
              {e.wentWell && (
                <p className="text-[12px] text-fg-2 m-0">
                  <span className="text-mint">+</span> {e.wentWell}
                </p>
              )}
              {e.toImprove && (
                <p className="text-[12px] text-fg-2 m-0 mt-1">
                  <span className="text-amber">△</span> {e.toImprove}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function JournalPage() {
  const [wentWell, setWentWell] = useState("");
  const [toImprove, setToImprove] = useState("");
  const [emotionalRating, setEmotionalRating] = useState(4);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emo = EMOTION_LABELS.find((e) => e.value === emotionalRating);

  return (
    <Page>
      <PageHeader
        title="Daily Journal"
        description="Post-session, not post-trade. Quick debrief — under 3 minutes."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-8">
          {submitted ? (
            <Panel
              label="Debrief"
              right={
                <Tag tone="positive" dot>
                  Logged for today
                </Tag>
              }
              className="fade-in"
            >
              <p className="text-[13px] text-fg-2 m-0 mb-1">
                State: <span className="text-fg">{emo?.label}</span>{" "}
                <span className="num text-fg-3">{emotionalRating}/7</span>
              </p>
              {wentWell && <EntryBlock label="What went well" text={wentWell} color="var(--color-mint)" />}
              {toImprove && <EntryBlock label="What to improve" text={toImprove} color="var(--color-amber)" />}
              {additionalNotes && <EntryBlock label="Notes" text={additionalNotes} color="var(--color-fg-2)" />}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setWentWell("");
                  setToImprove("");
                  setAdditionalNotes("");
                  setEmotionalRating(4);
                }}
                className="btn btn-secondary mt-3"
              >
                Write another entry
              </button>
            </Panel>
          ) : (
            <Panel label="Debrief">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label-caps block mb-2">Emotional state</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {EMOTION_LABELS.map((e) => (
                      <button
                        key={e.value}
                        onClick={() => setEmotionalRating(e.value)}
                        className="option flex flex-col items-center justify-center py-2"
                        data-active={emotionalRating === e.value}
                        aria-pressed={emotionalRating === e.value}
                      >
                        <span className="num text-[14px]">{e.value}</span>
                        <span className="text-[11px] mt-0.5">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-caps block mb-2">What went well?</label>
                    <textarea
                      value={wentWell}
                      onChange={(e) => setWentWell(e.target.value)}
                      rows={4}
                      className="field resize-y"
                      placeholder="I stuck to my max trades, took profit at my target..."
                    />
                  </div>
                  <div>
                    <label className="label-caps block mb-2">What to improve?</label>
                    <textarea
                      value={toImprove}
                      onChange={(e) => setToImprove(e.target.value)}
                      rows={4}
                      className="field resize-y"
                      placeholder="Moved my stop loss, entered too early..."
                    />
                  </div>
                </div>

                <div>
                  <label className="label-caps block mb-2">Anything else? (optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={2}
                    className="field resize-y"
                    placeholder="Market context, personal observations..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={!wentWell.trim() && !toImprove.trim()}
                    className="btn btn-primary btn-lg"
                  >
                    Save journal entry
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </div>

        <div className="lg:col-span-4">
          <PastEntries />
        </div>
      </div>
    </Page>
  );
}

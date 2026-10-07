import type { TimelineEvent, TimelineKind } from "../../lib/behaviour";
import { TONE_COLOR } from "../../lib/tone";
import { Panel } from "../ui/Panel";

function Marker({ kind, color }: { kind: TimelineKind; color: string }) {
  if (kind === "breach")
    return <span className="w-2 h-2 rotate-45 flex-shrink-0" style={{ backgroundColor: color }} />;
  if (kind === "session")
    return <span className="w-2 h-2 rounded-[1px] border flex-shrink-0" style={{ borderColor: color }} />;
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />;
}

function Row({ e, showDate }: { e: TimelineEvent; showDate: boolean }) {
  const color = TONE_COLOR[e.tone];
  return (
    <li
      className="grid grid-cols-[88px_12px_1fr] items-start gap-x-2.5 py-2"
      style={e.kind === "breach" ? { backgroundColor: "color-mix(in srgb, var(--color-red) 5%, transparent)" } : undefined}
    >
      <span className="num text-[12px] text-fg-3 pt-px">
        {showDate ? `${e.dateLabel} ${e.timeLabel}` : e.timeLabel}
      </span>
      <span className="flex justify-center pt-[5px]">
        <Marker kind={e.kind} color={color} />
      </span>
      <span className="min-w-0">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg">{e.title}</span>
        <span className="block text-[13px] truncate" style={{ color: e.tone === "neutral" ? "var(--color-fg-2)" : color }}>
          {e.detail}
        </span>
      </span>
    </li>
  );
}

// Recent behaviour timeline: session started, pre-trade check completed,
// each trade logged, each auto-detected rule breach — across the most
// recently active days.
export function BehaviourTimeline({ events }: { events: TimelineEvent[] }) {
  const today = new Date().toDateString();
  return (
    <Panel label="Recent behaviour" className="h-full">
      {events.length === 0 ? (
        <p className="text-[13px] text-fg-3 m-0">
          Nothing recorded yet. Lock today's plan and complete your pre-trade check to begin.
        </p>
      ) : (
        <ul className="m-0 p-0 list-none divide-y divide-line-soft">
          {events.map((e) => (
            <Row key={e.id} e={e} showDate={new Date(e.at).toDateString() !== today} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

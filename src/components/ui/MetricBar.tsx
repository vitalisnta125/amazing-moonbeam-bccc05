import { TONE_COLOR, scoreTone, type Tone } from "../../lib/tone";

// Horizontal score bar: label · bar · value. The preferred way to display a
// behavioural score — compact and scannable, never a giant gauge.
export function MetricBar({
  label,
  value,
  max = 100,
  tone,
  hint,
  display,
}: {
  label: string;
  value: number | null;
  max?: number;
  tone?: Tone;
  hint?: string;
  display?: string;
}) {
  const t = tone ?? scoreTone(value == null ? null : (value / max) * 100);
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="grid grid-cols-[96px_1fr_36px] items-center gap-3" title={hint}>
      <span className="label-caps truncate">{label}</span>
      <div className="h-1.5 rounded-[2px] bg-panel-2 overflow-hidden">
        <div
          className="h-full rounded-[2px]"
          style={{
            width: `${pct}%`,
            backgroundColor: TONE_COLOR[t],
            transition: "width 400ms ease",
          }}
        />
      </div>
      <span className="num text-[13px] text-right text-fg">
        {display ?? (value == null ? "—" : Math.round(value))}
      </span>
    </div>
  );
}

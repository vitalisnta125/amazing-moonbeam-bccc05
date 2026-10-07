import type { ReactNode } from "react";
import { TONE_COLOR, toneTint, type Tone } from "../../lib/tone";

// Compact status tag. Uppercase, tinted by semantic tone.
export function Tag({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-[18px] px-1.5 rounded-[3px] text-[10px] font-medium uppercase tracking-[0.08em] whitespace-nowrap"
      style={{
        color: tone === "neutral" ? "var(--color-fg-2)" : TONE_COLOR[tone],
        backgroundColor: tone === "neutral" ? "var(--color-panel-2)" : toneTint(tone, 0.1),
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: TONE_COLOR[tone] }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusDot({ tone, size = 8 }: { tone: Tone; size?: number }) {
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: TONE_COLOR[tone] }}
    />
  );
}

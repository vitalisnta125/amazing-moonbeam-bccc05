import { SIGNAL_LABEL, type BehaviourSignal as Signal } from "../../lib/behaviour";
import { TONE_COLOR, toneTint } from "../../lib/tone";
import { SectionHeader } from "../ui/Panel";

// Behaviour signal: On Plan or Attention. Violet marks it as EXECURE's own
// read of the day; the state itself is coloured by meaning (mint = on plan,
// amber = attention). All text is templated directly from the numbers — no
// generated copy.
export function BehaviourSignal({ signal }: { signal: Signal }) {
  const color = TONE_COLOR[signal.tone];
  return (
    <section className="panel relative flex flex-col min-w-0 h-full overflow-hidden" aria-live="polite">
      <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: color }} />
      <div className="px-4 pt-3.5 pb-2.5">
        <SectionHeader
          label={
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: "var(--color-violet)" }} />
              Behaviour signal
            </span>
          }
          accent="var(--color-violet)"
        />
      </div>
      <div className="px-4 pb-4 flex-1 flex flex-col gap-2.5">
        <span
          className="inline-flex items-center gap-2 h-6 px-2 rounded-[3px] text-[12px] font-semibold uppercase tracking-[0.12em] w-fit"
          style={{ color, backgroundColor: toneTint(signal.tone, 0.1) }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {SIGNAL_LABEL[signal.state]}
        </span>
        <p className="text-[15px] leading-6 font-medium text-fg m-0">{signal.headline}</p>
        {signal.lines.length > 0 && (
          <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
            {signal.lines.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[13px] text-fg-2">
                <span className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0 bg-violet" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

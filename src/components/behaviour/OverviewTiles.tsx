import type { OverviewTiles as Tiles } from "../../lib/behaviour";
import { scoreTone, TONE_COLOR } from "../../lib/tone";

const TILES: { key: keyof Tiles; label: string; hint: string }[] = [
  { key: "discipline", label: "Discipline", hint: "% of your last 14 recorded sessions graded fully disciplined" },
  { key: "execution", label: "Execution", hint: "% of today's trades inside your locked plan" },
  { key: "ruleAdherence", label: "Rule adherence", hint: "Rule checks followed vs required across today's trades" },
  { key: "consistency", label: "Consistency", hint: "Sessions recorded in the last 14 days, out of 14" },
];

function Tile({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  const tone = scoreTone(value);
  return (
    <div className="panel px-4 py-3.5 min-w-0" title={hint}>
      <p className="label-caps m-0">{label}</p>
      <p
        className="num text-[26px] leading-none m-0 mt-2.5"
        style={{ color: value == null ? "var(--color-fg-3)" : TONE_COLOR[tone] }}
      >
        {value == null ? "—" : `${value}%`}
      </p>
    </div>
  );
}

// The four Overview tiles. Every value is computed from stored data; "—"
// means there isn't enough of it yet, never a placeholder number.
export function OverviewTiles({ tiles }: { tiles: Tiles }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {TILES.map((t) => (
        <Tile key={t.key} label={t.label} value={tiles[t.key]} hint={t.hint} />
      ))}
    </div>
  );
}

import { scoreTone, TONE_COLOR } from "../../lib/tone";

// Behavioural leaderboard row. Ranking is by discipline, never by P&L. The
// optional columns let the table accept richer behavioural data later without
// changing its shape.
export interface LeaderboardEntry {
  id: string;
  name: string;
  handle?: string;
  discipline: number | null;
  execution?: number | null;
  consistency?: number | null;
  streak?: number;
  me?: boolean;
}

function Score({ value }: { value: number | null | undefined }) {
  return (
    <span
      className="num text-[13px] text-right"
      style={{ color: value == null ? "var(--color-fg-3)" : value >= 80 ? "var(--color-fg)" : TONE_COLOR[scoreTone(value)] }}
    >
      {value == null ? "—" : Math.round(value)}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  showStreak = false,
}: {
  entries: LeaderboardEntry[];
  showStreak?: boolean;
}) {
  const cols = showStreak
    ? "grid-cols-[28px_minmax(0,1fr)_repeat(4,52px)]"
    : "grid-cols-[28px_minmax(0,1fr)_repeat(3,52px)]";
  return (
    <div className="min-w-0 overflow-x-auto">
      <div className={`grid ${cols} gap-x-2 px-2 pb-2 border-b border-line min-w-[320px]`}>
        <span className="label-caps text-[10px]">Rank</span>
        <span className="label-caps text-[10px]">Trader</span>
        <span className="label-caps text-[10px] text-right">Disc.</span>
        <span className="label-caps text-[10px] text-right">Exec.</span>
        <span className="label-caps text-[10px] text-right">Cons.</span>
        {showStreak && <span className="label-caps text-[10px] text-right">Streak</span>}
      </div>
      <ul className="m-0 p-0 list-none min-w-[320px]">
        {entries.map((e, i) => (
          <li
            key={e.id}
            className={`grid ${cols} gap-x-2 items-center px-2 py-2 border-b border-line-soft last:border-b-0`}
            style={e.me ? { backgroundColor: "var(--color-panel-2)" } : undefined}
          >
            <span className="num text-[12px] text-fg-3">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 truncate text-[13px] text-fg">
              {e.name}
              {e.me && e.name !== "You" && <span className="text-fg-3"> · you</span>}
              {e.handle && <span className="text-[11px] text-fg-3 ml-1.5">{e.handle}</span>}
            </span>
            <Score value={e.discipline} />
            <Score value={e.execution} />
            <Score value={e.consistency} />
            {showStreak && (
              <span className="num text-[13px] text-right text-fg-2">{e.streak != null ? `${e.streak}d` : "—"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

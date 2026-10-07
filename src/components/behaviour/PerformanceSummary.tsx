import type { PerformanceStats } from "../../lib/behaviour";
import { Panel } from "../ui/Panel";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-fg-3 m-0">{label}</p>
      <p className="num text-[16px] text-fg-2 m-0 mt-1">{value}</p>
    </div>
  );
}

const fmtR = (v: number | null) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}R`);

// Deliberately small and placed low: outcome is secondary to execution
// quality on this page.
export function PerformanceSummary({ stats }: { stats: PerformanceStats }) {
  return (
    <Panel label="Performance" meta="Outcome · secondary">
      <div className="flex items-start gap-8">
        <Stat label="Trades" value={String(stats.trades)} />
        <Stat label="Net R" value={fmtR(stats.netR)} />
        <Stat label="Win rate" value={stats.winRate == null ? "—" : `${stats.winRate}%`} />
      </div>
    </Panel>
  );
}

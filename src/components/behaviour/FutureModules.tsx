import { Brain, Dna, FileChartColumn } from "lucide-react";
import { TILE_WINDOW } from "../../lib/behaviour";
import { Panel } from "../ui/Panel";
import { Tag } from "../ui/Tag";

const MODULES = [
  { icon: Brain, name: "AI Coach", text: "Behavioural pattern detection and coaching." },
  { icon: Dna, name: "Trading DNA", text: "Your longitudinal behavioural profile." },
  { icon: FileChartColumn, name: "Reports", text: "Weekly and monthly behaviour reviews." },
];

// Reserved space for EXECURE intelligence. These modules are not built yet —
// unlinked from the nav for this MVP, but kept rather than deleted. The panel
// states plainly that they're in development and shows how much behavioural
// history exists.
export function FutureModules({ sessions }: { sessions: number }) {
  const progress = Math.min(sessions, TILE_WINDOW);
  return (
    <Panel label="EXECURE intelligence" accent="var(--color-violet)" right={<Tag tone="insight">In development</Tag>} className="h-full">
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {MODULES.map(({ icon: Icon, name, text }) => (
          <li key={name} className="flex items-start gap-2.5">
            <Icon size={14} strokeWidth={1.6} className="text-fg-3 mt-0.5 flex-shrink-0" />
            <span className="min-w-0">
              <span className="block text-[13px] text-fg-2">{name}</span>
              <span className="block text-[12px] text-fg-3">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-fg-3">Behavioural history</span>
          <span className="num text-[11px] text-fg-2">
            {progress}/{TILE_WINDOW} sessions
          </span>
        </div>
        <div className="h-1 rounded-[2px] bg-panel-2 overflow-hidden">
          <div className="h-full bg-violet" style={{ width: `${(progress / TILE_WINDOW) * 100}%` }} />
        </div>
      </div>
    </Panel>
  );
}

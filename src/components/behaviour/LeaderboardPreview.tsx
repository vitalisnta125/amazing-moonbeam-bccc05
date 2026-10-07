import { Link } from "@tanstack/react-router";
import { Panel } from "../ui/Panel";
import { Tag } from "../ui/Tag";
import { LeaderboardTable, type LeaderboardEntry } from "./LeaderboardTable";

// Dashboard preview of the behavioural leaderboard. Until shared peer data
// exists it shows only the trader's own row — never fabricated rankings.
export function LeaderboardPreview({ self, peers = [] }: { self: LeaderboardEntry; peers?: LeaderboardEntry[] }) {
  const entries = [...peers, self].sort((a, b) => (b.discipline ?? -1) - (a.discipline ?? -1));
  return (
    <Panel
      label="Leaderboard"
      meta="Ranked by discipline"
      right={peers.length === 0 ? <Tag>Peers soon</Tag> : undefined}
      className="h-full"
    >
      <LeaderboardTable entries={entries} />
      <p className="text-[12px] text-fg-3 m-0 mt-3">
        {peers.length === 0
          ? "Peer ranking opens with the shared leaderboard. "
          : ""}
        <Link to="/os" search={{ tab: "leaderboard" }} className="text-fg-2 hover:text-fg">
          Accountability board →
        </Link>
      </p>
    </Panel>
  );
}

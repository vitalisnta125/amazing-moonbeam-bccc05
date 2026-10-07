import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useRecaps } from "../lib/recaps-context";
import { useTodayStore } from "../lib/today-store";
import { computeTiles, deriveSignal, buildTimeline, computePerformance } from "../lib/behaviour";
import { formatShortDate } from "../lib/local-date";
import { Page, PageHeader } from "../components/ui/Page";
import { OverviewTiles } from "../components/behaviour/OverviewTiles";
import { BehaviourSignal } from "../components/behaviour/BehaviourSignal";
import { BehaviourTimeline } from "../components/behaviour/BehaviourTimeline";
import { PerformanceSummary } from "../components/behaviour/PerformanceSummary";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { recaps } = useRecaps();
  const { today, history, ready } = useTodayStore();

  const model = useMemo(() => {
    const tiles = computeTiles(recaps, today);
    const signal = deriveSignal(today, history);
    const events = buildTimeline(history, formatShortDate);
    const performance = computePerformance(recaps);
    return { tiles, signal, events, performance };
  }, [recaps, today, history]);

  if (!ready) return null;

  return (
    <Page>
      <PageHeader title="Overview" description="How well are you executing? Behaviour first — outcome last." />

      <div className="mb-3 lg:mb-4">
        <OverviewTiles tiles={model.tiles} />
      </div>

      <div className="mb-3 lg:mb-4">
        <BehaviourSignal signal={model.signal} />
      </div>

      <div className="mb-3 lg:mb-4">
        <BehaviourTimeline events={model.events} />
      </div>

      <PerformanceSummary stats={model.performance} />
    </Page>
  );
}

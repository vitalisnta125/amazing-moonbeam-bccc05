import { createFileRoute, Link } from "@tanstack/react-router";
import { useRecaps } from "../lib/recaps-context";
import { DISCIPLINE_COLOR, DISCIPLINE_LABEL, type Discipline } from "../lib/trade-rules";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";
import { Tag } from "../components/ui/Tag";
import type { Tone } from "../lib/tone";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

const DISCIPLINE_TONE: Record<string, Tone> = {
  full: "positive",
  partial: "attention",
  broken: "risk",
  none: "neutral",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-4 py-3">
      <p className="label-caps m-0 text-[10px]">{label}</p>
      <p className="num text-[22px] leading-none text-fg m-0 mt-2">{value}</p>
    </div>
  );
}

function StreakHeatmap({ sessions }: { sessions: { date: string; status: string }[] }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);

  const sessionMap = new Map(sessions.map((s) => [s.date, s.status]));

  const weeks: { date: Date; status: string }[][] = [];
  let currentWeek: { date: Date; status: string }[] = [];

  const d = new Date(startDate);
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);

  while (d <= today) {
    const dateStr = d.toISOString().split("T")[0];
    const status = sessionMap.get(dateStr) || "none";
    currentWeek.push({ date: new Date(d), status });
    if (d.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    d.setDate(d.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const currentStreak = (() => {
    let streak = 0;
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const s of sorted) {
      if (s.status === "full") streak++;
      else break;
    }
    return streak;
  })();

  const longestStreak = (() => {
    let max = 0;
    let current = 0;
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (const s of sorted) {
      if (s.status === "full") {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }
    return max;
  })();

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <Stat label="Current streak" value={currentStreak} />
        <Stat label="Longest streak" value={longestStreak} />
        <Stat label="Total sessions" value={sessions.length} />
      </div>

      <Panel label="Last 90 days" meta="Each cell is one day">
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-[3px] min-w-fit">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date.toISOString().split("T")[0]}: ${DISCIPLINE_LABEL[day.status as Discipline] ?? day.status}`}
                    className="w-[13px] h-[13px] rounded-[2px]"
                    style={{
                      backgroundColor: DISCIPLINE_COLOR[day.status as Discipline] ?? DISCIPLINE_COLOR.none,
                      opacity: day.date > today ? 0.2 : 1,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
          {(["full", "partial", "broken", "none"] as Discipline[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: DISCIPLINE_COLOR[status] }} />
              <span className="text-[12px] text-fg-2">{DISCIPLINE_LABEL[status]}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function HistoryPage() {
  const { recaps, ready } = useRecaps();

  // The heatmap and streak math run off discipline grades, which already use the
  // same vocabulary (full / partial / broken / none) as the heatmap colour map.
  const sessions = recaps.map((r) => ({
    date: r.sessionDate,
    status: r.discipline,
  }));

  return (
    <Page>
      <PageHeader
        title="Discipline"
        description="Your trading discipline over time. A patient no-trade day counts as a clean day."
        actions={
          <Link to="/recap" className="btn btn-primary">
            Log / recap
          </Link>
        }
      />

      {!ready ? (
        <Panel>
          <p className="text-[13px] text-fg-3 m-0">Loading your history…</p>
        </Panel>
      ) : sessions.length === 0 ? (
        <Panel>
          <p className="text-[13px] text-fg-2 m-0">No sessions recorded yet.</p>
          <p className="text-[12px] text-fg-3 m-0 mt-1 mb-4">
            Record today's session — or backfill past days — and your streak will build here.
          </p>
          <Link to="/recap" className="btn btn-secondary">
            Add your first recap →
          </Link>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          <div className="lg:col-span-8">
            <StreakHeatmap sessions={sessions} />
          </div>

          <Panel label="Recent sessions" meta={`${Math.min(20, sessions.length)} of ${sessions.length}`} className="lg:col-span-4">
            <ul className="m-0 p-0 list-none divide-y divide-line-soft">
              {sessions.slice(0, 20).map((log, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="num text-[13px] text-fg-2">{log.date}</span>
                  <Tag tone={DISCIPLINE_TONE[log.status] ?? "neutral"}>
                    {DISCIPLINE_LABEL[log.status as keyof typeof DISCIPLINE_LABEL] ?? log.status}
                  </Tag>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </Page>
  );
}

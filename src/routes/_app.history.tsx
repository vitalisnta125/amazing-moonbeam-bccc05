import { createFileRoute, Link } from "@tanstack/react-router";
import { useEliteMode } from "../lib/elite-mode-context";
import { useRecaps } from "../lib/recaps-context";
import { DISCIPLINE_LABEL } from "../lib/trade-rules";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

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

  const colorMap: Record<string, string> = {
    full: "var(--color-streak-green)",
    partial: "var(--color-streak-amber)",
    broken: "var(--color-streak-grey)",
    none: "var(--color-surface-elevated)",
  };

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
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-[var(--color-streak-green)]">{currentStreak}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Current Streak</p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 text-center">
          <p className="text-3xl font-black text-[var(--color-brand)]">{longestStreak}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Longest Streak</p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 text-center">
          <p className="text-3xl font-black">{sessions.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Total Sessions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date.toISOString().split("T")[0]}: ${day.status}`}
                  className="w-[14px] h-[14px] rounded-[3px] transition-colors"
                  style={{
                    backgroundColor: colorMap[day.status],
                    opacity: day.date > today ? 0.2 : 1,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 justify-center">
        {[
          { label: "Rules followed", color: "var(--color-streak-green)" },
          { label: "Partial", color: "var(--color-streak-amber)" },
          { label: "Broke protocol", color: "var(--color-streak-grey)" },
          { label: "No session", color: "var(--color-surface-elevated)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-[var(--color-text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryPage() {
  const { recaps, ready } = useRecaps();
  const { eliteMode } = useEliteMode();

  // The heatmap and streak math run off discipline grades, which already use the
  // same vocabulary (full / partial / broken / none) as the heatmap colour map.
  const sessions = recaps.map((r) => ({
    date: r.sessionDate,
    status: r.discipline,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{eliteMode ? "Operational Record" : "Discipline Streak"}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {eliteMode ? "Mission compliance across all engagements" : "Your trading discipline over time"}
          </p>
        </div>
        <Link
          to="/recap"
          className="px-5 py-2.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-lg font-semibold hover:bg-[var(--color-brand-dark)] transition-colors cursor-pointer border-none text-sm no-underline"
        >
          {eliteMode ? "Log Mission" : "Log / Recap"}
        </Link>
      </div>

      {!ready ? (
        <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Loading your history…</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-10 text-center">
          <div className="text-3xl mb-3 opacity-30">📈</div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">No sessions recorded yet.</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-5">
            Record today's session — or backfill past days — and your streak will build here.
          </p>
          <Link
            to="/recap"
            className="inline-block px-5 py-2.5 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-lg font-semibold text-sm no-underline"
          >
            Add your first recap →
          </Link>
        </div>
      ) : (
        <>
          <div className="elite-card bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
            <StreakHeatmap sessions={sessions} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
            <div className="space-y-2">
              {sessions.slice(0, 20).map((log, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-lg p-4 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{log.date}</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor:
                        log.status === "full"
                          ? "var(--color-streak-green)"
                          : log.status === "partial"
                            ? "var(--color-streak-amber)"
                            : "var(--color-streak-grey)",
                      color: log.status === "partial" ? "#000" : "#fff",
                    }}
                  >
                    {DISCIPLINE_LABEL[log.status as keyof typeof DISCIPLINE_LABEL] ?? log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

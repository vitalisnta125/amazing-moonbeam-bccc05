import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { allSessionsDesc, computeBreaches, BREACH_LABEL, useTodayStore } from "../lib/today-store";
import { formatShortDate } from "../lib/local-date";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";
import { Tag } from "../components/ui/Tag";

export const Route = createFileRoute("/_app/rules")({
  component: RulesPage,
});

function RulesPage() {
  const { ready, today, history } = useTodayStore();

  const breachLog = useMemo(() => {
    return allSessionsDesc(history)
      .flatMap((s) => computeBreaches(s).map((b) => ({ ...b, date: s.date, rules: s.rules })))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 50);
  }, [history]);

  if (!ready) return null;

  return (
    <Page>
      <PageHeader
        title="Rules"
        description="Your operating rules and every automatically detected breach. Edit today's rules from the Today page."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <Panel
          label="Today's operating rules"
          right={<Tag tone={today.locked ? "positive" : "neutral"}>{today.locked ? "Locked" : "Not locked yet"}</Tag>}
          className="lg:col-span-4 self-start"
        >
          <ul className="m-0 p-0 list-none divide-y divide-line-soft">
            <li className="flex items-center justify-between py-2 first:pt-0">
              <span className="text-[13px] text-fg-2">A+ setups only</span>
              <span className="text-[13px] text-fg">{today.rules.aPlusOnly ? "Yes" : "No"}</span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[13px] text-fg-2">Maximum executions</span>
              <span className="num text-[13px] text-fg">{today.rules.maxTrades}</span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[13px] text-fg-2">Maximum risk per trade</span>
              <span className="num text-[13px] text-fg">{today.rules.maxRiskR}R</span>
            </li>
            <li className="flex items-center justify-between py-2 last:pb-0">
              <span className="text-[13px] text-fg-2">Stop after consecutive losses</span>
              <span className="num text-[13px] text-fg">{today.rules.maxConsecutiveLosses}</span>
            </li>
          </ul>
        </Panel>

        <Panel label="Breach log" meta="Auto-detected — nothing is logged manually" className="lg:col-span-8">
          {breachLog.length === 0 ? (
            <p className="text-[13px] text-fg-3 m-0">No rule breaches recorded.</p>
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-line-soft">
              {breachLog.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-2">
                  <span className="num text-[12px] text-fg-3 w-20 flex-shrink-0">{formatShortDate(b.date)}</span>
                  <span className="w-2 h-2 rotate-45 flex-shrink-0 bg-red" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-fg m-0">{BREACH_LABEL[b.kind]}</p>
                    <p className="text-[11px] text-fg-3 m-0">{b.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </Page>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { TradingViewWidget } from "../components/TradingViewWidget";
import {
  useTodayStore,
  type ExecutionOutcome,
  type PreTradeTicks,
  computeBreaches,
  executionInPlan,
  BREACH_LABEL,
} from "../lib/today-store";
import { usePersistentState } from "../lib/use-persistent-state";
import { formatFullDate } from "../lib/local-date";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";
import { Tag } from "../components/ui/Tag";
import type { Tone } from "../lib/tone";

export const Route = createFileRoute("/_app/today")({
  component: TodayPage,
});

const STATUS_COPY: Record<string, { label: string; tone: Tone }> = {
  "not-ready": { label: "Not Ready", tone: "neutral" },
  ready: { label: "Ready", tone: "positive" },
  locked: { label: "Locked", tone: "positive" },
};

const CHECK_ITEMS: { key: keyof PreTradeTicks; label: string; hint: string }[] = [
  { key: "marketPlan", label: "Market plan", hint: "I know today's bias and the key levels I'm watching." },
  { key: "setupCriteria", label: "Setup criteria", hint: "My entry criteria for this session are defined." },
  { key: "riskDefined", label: "Risk defined", hint: "My risk per trade and daily limit are set." },
  { key: "mentalState", label: "Mental state", hint: "I'm calm, rested and ready to trade." },
];

const OUTCOMES: { value: ExecutionOutcome; label: string }[] = [
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
  { value: "breakeven", label: "Break-even" },
];

function RulesEditor({
  rules,
  locked,
  onChange,
}: {
  rules: { aPlusOnly: boolean; maxTrades: number; maxRiskR: number; maxConsecutiveLosses: number };
  locked: boolean;
  onChange: (next: typeof rules) => void;
}) {
  return (
    <Panel label="Operating rules" meta={locked ? "Locked for today" : "Editable until you lock"}>
      <ul className="m-0 p-0 list-none divide-y divide-line-soft">
        <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
          <span className="text-[13px] text-fg">A+ setups only</span>
          <button
            role="switch"
            aria-checked={rules.aPlusOnly}
            disabled={locked}
            onClick={() => onChange({ ...rules, aPlusOnly: !rules.aPlusOnly })}
            className="relative flex-shrink-0 w-8 h-[18px] rounded-full border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: rules.aPlusOnly ? "var(--color-mint)" : "var(--color-line)" }}
          >
            <span
              className="absolute top-[3px] w-3 h-3 rounded-full bg-bg transition-all"
              style={{ left: rules.aPlusOnly ? 17 : 3 }}
            />
          </button>
        </li>
        <li className="flex items-center justify-between gap-3 py-2.5">
          <span className="text-[13px] text-fg">Maximum executions</span>
          <input
            type="number"
            min={1}
            max={20}
            value={rules.maxTrades}
            disabled={locked}
            onChange={(e) => onChange({ ...rules, maxTrades: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="field num w-16 text-right disabled:opacity-60"
          />
        </li>
        <li className="flex items-center justify-between gap-3 py-2.5">
          <span className="text-[13px] text-fg">Maximum risk per trade</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={rules.maxRiskR}
              disabled={locked}
              onChange={(e) => onChange({ ...rules, maxRiskR: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
              className="field num w-16 text-right disabled:opacity-60"
            />
            <span className="num text-[12px] text-fg-3">R</span>
          </div>
        </li>
        <li className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
          <span className="text-[13px] text-fg">Stop after consecutive losses</span>
          <input
            type="number"
            min={1}
            max={10}
            value={rules.maxConsecutiveLosses}
            disabled={locked}
            onChange={(e) => onChange({ ...rules, maxConsecutiveLosses: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="field num w-16 text-right disabled:opacity-60"
          />
        </li>
      </ul>
    </Panel>
  );
}

function PreTradeCheck({
  check,
  locked,
  onToggle,
}: {
  check: PreTradeTicks;
  locked: boolean;
  onToggle: (key: keyof PreTradeTicks) => void;
}) {
  const done = CHECK_ITEMS.filter((i) => check[i.key]).length;
  return (
    <Panel label="Pre-trade check" meta={`${done}/${CHECK_ITEMS.length} done`}>
      <div className="flex flex-col gap-1.5">
        {CHECK_ITEMS.map((item) => {
          const checked = check[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              disabled={locked}
              className="option flex items-center gap-3 px-3 h-11 text-left disabled:cursor-not-allowed"
              data-active={checked}
              aria-pressed={checked}
            >
              <span className="check-box flex-shrink-0" data-checked={checked}>
                {checked ? "✓" : ""}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-fg">{item.label}</span>
                <span className="block text-[11px] text-fg-3 truncate">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function LogExecution({
  locked,
  onLog,
}: {
  locked: boolean;
  onLog: (outcome: ExecutionOutcome, riskR: number) => void;
}) {
  const [outcome, setOutcome] = useState<ExecutionOutcome>("win");
  const [riskR, setRiskR] = useState("1");

  function submit() {
    const r = parseFloat(riskR);
    if (!Number.isFinite(r) || r <= 0) return;
    onLog(outcome, r);
  }

  if (!locked) {
    return (
      <p className="text-[13px] text-fg-3 m-0">Lock your session to start logging executions.</p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex gap-1.5">
        {OUTCOMES.map((o) => (
          <button
            key={o.value}
            onClick={() => setOutcome(o.value)}
            className="option h-9 px-3 text-[13px]"
            data-active={outcome === o.value}
            aria-pressed={outcome === o.value}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div>
        <input
          type="number"
          step={0.1}
          min={0.1}
          value={riskR}
          onChange={(e) => setRiskR(e.target.value)}
          className="field num w-20"
          aria-label="Risk taken, in R"
        />
      </div>
      <button onClick={submit} className="btn btn-primary">
        Log trade
      </button>
    </div>
  );
}

function TodayPage() {
  const { ready, today, lock, setRules, setTick, logExecution } = useTodayStore();
  const [showChart, setShowChart] = usePersistentState("today-show-chart", false);

  const status = today.locked ? "locked" : Object.values(today.check).every(Boolean) ? "ready" : "not-ready";
  const statusCopy = STATUS_COPY[status];
  const checkDone = Object.values(today.check).filter(Boolean).length;
  const breaches = useMemo(() => computeBreaches(today), [today]);

  if (!ready) return null;

  return (
    <Page>
      <PageHeader
        title="Today"
        description={formatFullDate()}
        actions={
          <>
            <Tag tone={statusCopy.tone} dot>
              {statusCopy.label}
            </Tag>
            {status === "ready" && (
              <button onClick={lock} className="btn btn-primary">
                <Lock size={14} strokeWidth={1.8} />
                Lock session
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-4">
          <RulesEditor rules={today.rules} locked={today.locked} onChange={setRules} />
          <PreTradeCheck check={today.check} locked={today.locked} onToggle={(key) => setTick(key, !today.check[key])} />

          <Panel
            label="Today's executions"
            meta={`${today.executions.length}/${today.rules.maxTrades}`}
            right={breaches.length > 0 ? <Tag tone="risk">{breaches.length} breach{breaches.length === 1 ? "" : "es"}</Tag> : undefined}
          >
            <LogExecution locked={today.locked} onLog={logExecution} />
            {today.executions.length > 0 && (
              <ul className="m-0 p-0 list-none mt-3 divide-y divide-line-soft">
                {today.executions.map((e, i) => {
                  const inPlan = executionInPlan(today, i);
                  return (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="num text-[12px] text-fg-3 w-12">
                        {new Date(e.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[13px] text-fg flex-1">
                        #{i + 1} · {e.outcome === "win" ? "Win" : e.outcome === "loss" ? "Loss" : "Break-even"}
                      </span>
                      <span className="num text-[12px] text-fg-2">{e.riskR}R</span>
                      <Tag tone={inPlan ? "positive" : "risk"}>{inPlan ? "In plan" : "Outside plan"}</Tag>
                    </li>
                  );
                })}
              </ul>
            )}
            {breaches.length > 0 && (
              <ul className="m-0 p-0 list-none mt-2 flex flex-col gap-1">
                {breaches.map((b) => (
                  <li key={b.id} className="text-[12px] text-red">
                    {BREACH_LABEL[b.kind]} — {b.detail}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-4">
          <Panel label="Session score">
            <p className="num text-[28px] leading-none text-fg m-0">
              {checkDone}/{CHECK_ITEMS.length}
            </p>
            <p className="text-[12px] text-fg-3 m-0 mt-2">
              {status === "not-ready" && "Complete every check to become ready."}
              {status === "ready" && "Ready. Lock your session to begin logging executions."}
              {status === "locked" && today.lockedAt && (
                <>Locked at {new Date(today.lockedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}.</>
              )}
            </p>
          </Panel>

          <Panel
            label="Chart"
            right={
              status !== "not-ready" ? (
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="btn btn-ghost h-6 px-2 text-[12px]"
                  aria-pressed={showChart}
                >
                  {showChart ? "Hide" : "Show"}
                </button>
              ) : undefined
            }
            flush
            bodyClassName={status === "not-ready" || !showChart ? "px-4 pb-4 pt-2" : ""}
          >
            {status === "not-ready" ? (
              <p className="text-[13px] text-fg-3 m-0 px-4 pb-4 pt-1">
                Hidden until you're ready. Finish your pre-trade check first.
              </p>
            ) : showChart ? (
              <div className="h-[380px] border-t border-line">
                <TradingViewWidget />
              </div>
            ) : (
              <p className="text-[13px] text-fg-3 m-0">Chart hidden. Use Show to view live candles.</p>
            )}
          </Panel>
        </div>
      </div>
    </Page>
  );
}

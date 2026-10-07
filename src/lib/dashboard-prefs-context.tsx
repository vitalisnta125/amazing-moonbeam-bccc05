import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "./use-persistent-state";

// Each widget the trader can stack on their command center. The dashboard owns
// the actual rendering; this registry just defines identity, labels and the
// default order so the customize panel and the persisted prefs stay in sync.
export interface WidgetMeta {
  id: string;
  label: string;
  description: string;
}

export const DASHBOARD_WIDGETS: WidgetMeta[] = [
  { id: "focus", label: "Focus & Intention", description: "Your one-line intention for the session." },
  { id: "readiness", label: "Pre-Trade Readiness", description: "Entry-rule confirmations from your latest check." },
  { id: "streak", label: "Discipline Streak", description: "Consecutive days following your rules." },
  { id: "plan", label: "Today's Session Plan", description: "Your locked session parameters." },
  { id: "goals", label: "Goals & Intentions", description: "Editable trading goals for the day or week." },
  { id: "behaviour", label: "Behaviour Replay", description: "Rule adherence, discipline rate and win rate." },
  { id: "timeline", label: "Recent Sessions", description: "Your most recent recorded recaps." },
  { id: "coverage", label: "Progress Coverage", description: "Sessions recorded and clean-day rate." },
  { id: "rulebreaks", label: "Rule Break Counter", description: "Rules missed on today's trade — keep it at zero." },
  { id: "coach", label: "AI Coach Insights", description: "Personalised behavioural nudges." },
  { id: "chart", label: "Live Chart (TradingView)", description: "Live candles. Hidden by default to reduce impulse." },
];

// The chart is intentionally a special case: it is governed by `showChart`
// rather than the generic hidden list, so we can frame it as a deliberate
// Focus Mode choice rather than just another widget toggle.
const CHART_ID = "chart";
const DEFAULT_ORDER = DASHBOARD_WIDGETS.map((w) => w.id);

export interface DashboardPrefs {
  order: string[];
  hidden: string[];
  showChart: boolean;
}

const DEFAULT_PREFS: DashboardPrefs = {
  order: DEFAULT_ORDER,
  hidden: [],
  showChart: false, // behaviour-first: live candles are off until the trader opts in
};

interface DashboardPrefsContextValue {
  order: string[];
  hidden: string[];
  showChart: boolean;
  isVisible: (id: string) => boolean;
  toggleWidget: (id: string) => void;
  moveWidget: (id: string, dir: -1 | 1) => void;
  setShowChart: (value: boolean) => void;
  reset: () => void;
}

const DashboardPrefsContext = createContext<DashboardPrefsContextValue | null>(null);

export function DashboardPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = usePersistentState<DashboardPrefs>(
    "dashboard-prefs",
    DEFAULT_PREFS
  );

  // Reconcile persisted prefs with the current widget registry so newly shipped
  // widgets appear (appended) and removed ones drop out without a data migration.
  const order = useMemo(() => {
    const known = new Set(DEFAULT_ORDER);
    const kept = prefs.order.filter((id) => known.has(id));
    const missing = DEFAULT_ORDER.filter((id) => !kept.includes(id));
    return [...kept, ...missing];
  }, [prefs.order]);

  const value: DashboardPrefsContextValue = {
    order,
    hidden: prefs.hidden,
    showChart: prefs.showChart,
    isVisible: (id) =>
      id === CHART_ID ? prefs.showChart : !prefs.hidden.includes(id),
    toggleWidget: (id) => {
      if (id === CHART_ID) {
        setPrefs((p) => ({ ...p, showChart: !p.showChart }));
        return;
      }
      setPrefs((p) => ({
        ...p,
        hidden: p.hidden.includes(id)
          ? p.hidden.filter((x) => x !== id)
          : [...p.hidden, id],
      }));
    },
    moveWidget: (id, dir) => {
      setPrefs((p) => {
        const list = order.slice();
        const from = list.indexOf(id);
        const to = from + dir;
        if (from < 0 || to < 0 || to >= list.length) return p;
        [list[from], list[to]] = [list[to], list[from]];
        return { ...p, order: list };
      });
    },
    setShowChart: (v) => setPrefs((p) => ({ ...p, showChart: v })),
    reset: () => setPrefs(DEFAULT_PREFS),
  };

  return (
    <DashboardPrefsContext.Provider value={value}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}

export function useDashboardPrefs() {
  const ctx = useContext(DashboardPrefsContext);
  if (!ctx)
    throw new Error("useDashboardPrefs must be used within a DashboardPrefsProvider");
  return ctx;
}

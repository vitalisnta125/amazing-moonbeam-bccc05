import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getDayRecaps, saveDayRecap } from "../server/trading.functions";
import { type DayRecap } from "./recap-stats";
import {
  type RuleState,
  type Outcome,
  countFollowed,
  gradeDiscipline,
  RULES_TOTAL,
} from "./trade-rules";

export interface RecapInput {
  sessionDate: string;
  rules: RuleState;
  outcome: Outcome;
  rMultiple: number | null;
  riskUsed: number | null;
  pair: string;
  notes: string;
}

interface RecapsContextValue {
  recaps: DayRecap[];
  loading: boolean;
  ready: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (input: RecapInput) => Promise<void>;
}

const RecapsContext = createContext<RecapsContextValue | null>(null);

// Normalise a raw server row into the client DayRecap shape.
function normalise(row: any): DayRecap {
  const rules: RuleState =
    row.rules && typeof row.rules === "object" ? row.rules : {};
  return {
    id: row.id,
    sessionDate: row.sessionDate,
    rules,
    rulesFollowed: row.rulesFollowed ?? countFollowed(rules),
    rulesTotal: row.rulesTotal ?? RULES_TOTAL,
    outcome: (row.outcome ?? "no-trade") as Outcome,
    rMultiple: row.rMultiple ?? null,
    riskUsed: row.riskUsed ?? null,
    pair: row.pair ?? "",
    notes: row.notes ?? "",
    discipline: row.discipline ?? "none",
  };
}

export function RecapsProvider({ children }: { children: ReactNode }) {
  const [recaps, setRecaps] = useState<DayRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getDayRecaps();
      setRecaps((rows as any[]).map(normalise));
    } catch (e) {
      // Auth not ready, offline, or a transient failure — degrade to empty so the
      // UI shows its (honest) empty states rather than crashing.
      setError(e instanceof Error ? e.message : "Failed to load recaps");
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  // Load once the client has mounted (auth is client-side in this app).
  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (input: RecapInput) => {
    // Optimistically reflect the save so the dashboard/history update instantly.
    const followed = countFollowed(input.rules);
    const optimistic: DayRecap = {
      sessionDate: input.sessionDate,
      rules: input.rules,
      rulesFollowed: followed,
      rulesTotal: RULES_TOTAL,
      outcome: input.outcome,
      rMultiple: input.rMultiple,
      riskUsed: input.riskUsed,
      pair: input.pair,
      notes: input.notes,
      discipline: gradeDiscipline(followed, RULES_TOTAL, input.outcome),
    };
    setRecaps((prev) => {
      const without = prev.filter(
        (r) => r.sessionDate !== input.sessionDate
      );
      return [optimistic, ...without].sort((a, b) =>
        b.sessionDate.localeCompare(a.sessionDate)
      );
    });

    const saved = await saveDayRecap({ data: input });
    const normalised = normalise({ ...saved, rules: input.rules });
    setRecaps((prev) => {
      const without = prev.filter(
        (r) => r.sessionDate !== normalised.sessionDate
      );
      return [normalised, ...without].sort((a, b) =>
        b.sessionDate.localeCompare(a.sessionDate)
      );
    });
  }, []);

  return (
    <RecapsContext.Provider
      value={{ recaps, loading, ready, error, reload, save }}
    >
      {children}
    </RecapsContext.Provider>
  );
}

export function useRecaps() {
  const ctx = useContext(RecapsContext);
  if (!ctx) throw new Error("useRecaps must be used within a RecapsProvider");
  return ctx;
}

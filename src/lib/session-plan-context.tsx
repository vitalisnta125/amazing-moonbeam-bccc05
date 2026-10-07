import { createContext, useContext, useState, type ReactNode } from "react";

export interface SessionPlan {
  sessionType: string;
  sessionLabel: string;
  sessionTime: string;
  bias: string;
  biasLabel: string;
  biasIcon: string;
  biasColor: string;
  maxTrades: number;
  riskPerTrade: number;
  notes: string;
}

interface SessionPlanContextValue {
  lockedPlan: SessionPlan | null;
  lockPlan: (plan: SessionPlan) => void;
  unlockPlan: () => void;
}

const SessionPlanContext = createContext<SessionPlanContextValue>({
  lockedPlan: null,
  lockPlan: () => {},
  unlockPlan: () => {},
});

export function SessionPlanProvider({ children }: { children: ReactNode }) {
  const [lockedPlan, setLockedPlan] = useState<SessionPlan | null>(null);

  return (
    <SessionPlanContext.Provider
      value={{
        lockedPlan,
        lockPlan: (plan) => setLockedPlan(plan),
        unlockPlan: () => setLockedPlan(null),
      }}
    >
      {children}
    </SessionPlanContext.Provider>
  );
}

export function useSessionPlan() {
  return useContext(SessionPlanContext);
}

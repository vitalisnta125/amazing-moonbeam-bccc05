import { createContext, useContext, useState, type ReactNode } from "react";

interface EliteModeContextValue {
  eliteMode: boolean;
  setEliteMode: (value: boolean) => void;
  toggleEliteMode: () => void;
}

const EliteModeContext = createContext<EliteModeContextValue>({
  eliteMode: false,
  setEliteMode: () => {},
  toggleEliteMode: () => {},
});

export function EliteModeProvider({ children }: { children: ReactNode }) {
  const [eliteMode, setEliteMode] = useState(false);

  return (
    <EliteModeContext.Provider
      value={{
        eliteMode,
        setEliteMode,
        toggleEliteMode: () => setEliteMode((prev) => !prev),
      }}
    >
      {children}
    </EliteModeContext.Provider>
  );
}

export function useEliteMode() {
  return useContext(EliteModeContext);
}

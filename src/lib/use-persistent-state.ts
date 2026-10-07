import { useEffect, useState } from "react";

// Shared, SSR-safe localStorage hook. TanStack Start renders on the server first,
// so we start from `initialValue` (matching server output) and only read from
// localStorage on the client after mount — avoiding any hydration mismatch flash.
const STORAGE_PREFIX = "execure:ui:v1:";

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* corrupt or unavailable storage — keep defaults */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota or private-mode — ignore */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

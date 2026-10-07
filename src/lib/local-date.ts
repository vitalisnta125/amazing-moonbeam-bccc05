// Date/time helpers that always use the browser's own local timezone — never
// a hardcoded city or UTC. `Date`'s plain getters (getFullYear/getMonth/getDate/
// getHours…) are already local to the browser; the one trap is `toISOString()`,
// which is UTC and can silently shift "today" across a day boundary. Every
// date-key in the app should come from `localDateISO`, not `toISOString()`.

export function localDateISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// "07 OCT" style compact date, from either a Date or a YYYY-MM-DD local key.
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }).toUpperCase();
}

// "Tuesday, 7 October" style full date for page headers.
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

// Minutes between two ISO timestamps.
export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.max(0, (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000);
}

// The last `count` local calendar date keys, most recent first, including today.
export function lastDays(count: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(from);
  for (let i = 0; i < count; i++) {
    out.push(localDateISO(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

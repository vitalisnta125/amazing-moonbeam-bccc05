// Semantic tones. Every status colour in the product goes through this map so a
// colour always means the same thing: mint = healthy execution, violet =
// behavioural intelligence, amber = attention, red = violation / risk.
export type Tone = "positive" | "insight" | "attention" | "risk" | "neutral";

export const TONE_COLOR: Record<Tone, string> = {
  positive: "var(--color-mint)",
  insight: "var(--color-violet)",
  attention: "var(--color-amber)",
  risk: "var(--color-red)",
  neutral: "var(--color-fg-2)",
};

// Map a 0–100 behavioural score to a tone. Scores are about process, so the
// thresholds are deliberately strict.
export function scoreTone(score: number | null | undefined): Tone {
  if (score == null) return "neutral";
  if (score >= 80) return "positive";
  if (score >= 60) return "attention";
  return "risk";
}

// Translucent background for a tone, for tags and highlighted rows.
export function toneTint(tone: Tone, alpha = 0.1): string {
  return `color-mix(in srgb, ${TONE_COLOR[tone]} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Controlled personalization layer for "People Like Me".
 *
 * Matches fictional scenario themes against themes the member has already
 * chosen to explore. It never produces a clinical or psychological similarity
 * score, never infers a diagnosis or emotional state, and never reveals the
 * source of any personal information back to the member.
 */

export type PermittedSignal = {
  /** Free-text label the member chose or a neutral topic they already read. */
  label: string;
  /** Confirmed = stated by the member. Observed = behavioural, kept separate. */
  kind: "confirmed" | "observed";
};

export type ThemeMatch = {
  sharedThemes: string[];
  recommendationReason: string;
  /** True only when at least one shared theme comes from confirmed input. */
  fromConfirmedInput: boolean;
};

const STOP_WORDS = new Set(["the", "a", "an", "of", "and", "to", "in", "for", "with", "your"]);

export function normalizeTheme(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .join(" ")
    .trim();
}

function tokens(value: string): string[] {
  return normalizeTheme(value).split(" ").filter(Boolean);
}

function overlaps(themeA: string, themeB: string): boolean {
  const a = normalizeTheme(themeA);
  const b = normalizeTheme(themeB);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const setB = new Set(tokens(b));
  return tokens(a).some((t) => setB.has(t));
}

export const NEUTRAL_REASON =
  "This fictional scenario explores some themes you have previously chosen to explore.";

/**
 * Returns the overlapping themes between a fictional scenario and the
 * information the member has permitted to be used for personalization.
 */
export function matchScenarioThemes(
  scenarioThemes: string[],
  signals: PermittedSignal[],
): ThemeMatch | null {
  const shared: string[] = [];
  let fromConfirmedInput = false;

  for (const theme of scenarioThemes) {
    const hit = signals.find((s) => overlaps(theme, s.label));
    if (!hit) continue;
    if (!shared.includes(theme)) shared.push(theme);
    if (hit.kind === "confirmed") fromConfirmedInput = true;
  }

  if (shared.length === 0) return null;

  return {
    sharedThemes: shared.slice(0, 4),
    recommendationReason: NEUTRAL_REASON,
    fromConfirmedInput,
  };
}

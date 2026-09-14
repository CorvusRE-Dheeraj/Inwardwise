// The Self-Calm session: four prayers, in a fixed order, repeated as many
// times as the person chooses. Each prayer is spoken, then held in silence
// for a minute while they picture the situation and feel it.

export type CalmStepKey = "thank" | "forgive" | "sorry" | "love";

export type CalmStep = {
  key: CalmStepKey;
  /** Spoken opening of the line. */
  stem: string;
  /** Shown as the heading of the step. */
  title: string;
};

/** The order is fixed: gratitude, forgiveness, apology, then love. */
export const CALM_STEPS: CalmStep[] = [
  { key: "thank", stem: "Thank you for", title: "Thank you" },
  { key: "forgive", stem: "Please forgive me for", title: "Please forgive me" },
  { key: "sorry", stem: "I am sorry for", title: "I am sorry" },
  { key: "love", stem: "I love myself", title: "I love myself" },
];

/** Closing invitation spoken after every line. */
export const IMAGINE_LINE = "Imagine the situation, and feel it.";

/** Silence held after each line. */
export const PAUSE_SECONDS = 60;

/** How many times the four-prayer sequence can be repeated in one sitting. */
export const REPEAT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Used when the person has not finished their InwardWise Self: the prayers
 * become open questions they answer inwardly, with nothing drawn from them.
 */
export const GENERIC_STEP_TEXT: Record<CalmStepKey, string> = {
  thank: "Thank you for something you received from someone, or from nature.",
  forgive: "Please forgive me for something I did, or did not do.",
  sorry:
    "I am sorry for something I did, did not do, misunderstood, or messed up.",
  love:
    "I love myself, despite the mistakes, the shortcomings and the misunderstandings I have caused.",
};

export type CalmRound = Record<CalmStepKey, string>;

/** The generic sequence, identical in every repetition. */
export function genericRound(): CalmRound {
  return { ...GENERIC_STEP_TEXT };
}

/** One spoken line: the prayer, then the invitation to feel it. */
export function spokenLine(text: string): string {
  const body = text.trim().replace(/\s+/g, " ");
  const punctuated = /[.!?]$/.test(body) ? body : `${body}.`;
  return `${punctuated} ${IMAGINE_LINE}`;
}

export function parseCalmRounds(raw: string): CalmRound[] {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
      rounds?: Array<Partial<Record<CalmStepKey, unknown>>>;
    };
    const rounds: CalmRound[] = [];
    for (const r of parsed.rounds ?? []) {
      const round = {} as CalmRound;
      let ok = true;
      for (const step of CALM_STEPS) {
        const value = r?.[step.key];
        if (typeof value !== "string" || value.trim().length === 0) {
          ok = false;
          break;
        }
        round[step.key] = value.trim();
      }
      if (ok) rounds.push(round);
    }
    return rounds;
  } catch {
    return [];
  }
}

// Shared, React-free configuration for the My Journey feature (Phase 1: READ).

export type JourneyItemState =
  | "QUEUED"
  | "SENT"
  | "AWAITING_RESPONSE"
  | "READ_CONFIRMED"
  | "QUESTION"
  | "NOT_NOW"
  | "SKIPPED"
  | "PAUSED"
  | "COMPLETED";

export const ACTIVE_STATES: JourneyItemState[] = [
  "QUEUED",
  "SENT",
  "AWAITING_RESPONSE",
  "QUESTION",
  "NOT_NOW",
  "PAUSED",
];

/** Signal kinds. Explicit facts, observations and AI guesses stay separate. */
export type SignalType =
  | "EXPLICIT_FACT"
  | "BEHAVIORAL_OBSERVATION"
  | "PREFERENCE"
  | "PATTERN"
  | "AI_HYPOTHESIS";

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "every_few_days", label: "Every few days" },
  { value: "weekly", label: "Weekly" },
  { value: "paused", label: "Paused" },
] as const;

/** Reminders are finite by design. */
export const MAX_REMINDERS = 2;

export const REMINDER_AFTER_HOURS = 48;

export const NEUTRAL_FALLBACK = {
  title: "Choose a topic to explore",
  body:
    "Nothing is confidently matched to you yet, so nothing is being pushed at you. Pick a topic and the journey starts from there.",
};

export interface JourneySectionRef {
  id: string;
  book_id: string;
  chapter_id: string;
  number: number;
  title: string;
  content: string;
  estimated_minutes: number;
  topic: string | null;
  theme: string | null;
  tags: string[];
  sequence: number;
  source_locator: string | null;
}

export interface Recommendation {
  section: JourneySectionRef;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  confidence: number;
  reasonCodes: string[];
  /** Short, neutral, never exposes private detail. */
  relevanceNote: string;
}

/** Natural language that means "I have read this". */
const DONE_PATTERNS = [
  /^done\b/,
  /^finished\b/,
  /^next\b/,
  /^continue\b/,
  /\bi (have )?read it\b/,
  /\bread it\b/,
  /\bcompleted\b/,
  /\bfinished reading\b/,
];

export function isCompletionPhrase(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t.length > 60) return false;
  return DONE_PATTERNS.some((p) => p.test(t));
}

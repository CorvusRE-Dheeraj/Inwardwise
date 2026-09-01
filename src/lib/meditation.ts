// The four-prayer meditation process, connected to the five avatar factors.
// Theory is internal — only the practice itself is shown to the user.

export type PrayerSet = {
  n: number;
  key: "sorry" | "forgive" | "thank" | "love";
  title: string;
  stem: string;
  /** Short line shown to the practitioner while this set is running. */
  invitation: string;
  /** Internal guidance for generating the person's own lines. */
  guidance: string;
  /** Factor numbers this set draws from, in order. */
  dimensions: number[];
  /** Extra openings before the factor-drawn lines. */
  openings?: string[];
};

export const PRAYER_SETS: PrayerSet[] = [
  {
    n: 1,
    key: "sorry",
    title: "I am sorry",
    stem: "I am sorry for",
    invitation:
      "Acknowledge, without defending yourself, what you did not see or could not hold.",
    guidance:
      "Each line names something the person did not recognise, suppressed, or let their destructive pattern do. Grounded, humble, never self-flagellating.",
    dimensions: [1, 2, 3, 4, 5],
    openings: [
      "Anything regarding your parents you are sorry for?",
      "Anything related to those close to you that you are sorry for not stepping up on?",
    ],
  },
  {
    n: 2,
    key: "forgive",
    title: "Please forgive me",
    stem: "Please forgive me for",
    invitation:
      "This one goes deeper than sorry. Ask yourself for release from what wounded you.",
    guidance:
      "Each line asks forgiveness of oneself for something deep — the suppressed inner child, the destructive act, the wound carried too long. Forgiveness of self, leading to closure.",
    dimensions: [1, 2, 3, 4, 5],
  },
  {
    n: 3,
    key: "thank",
    title: "Thank you",
    stem: "Thank you for",
    invitation: "Credit what went your way that you quietly took for granted.",
    guidance:
      "Each line gives credit to something that went their way, a talent, a person, an experience — gratitude they rarely voice. Fresh each day, never repeated.",
    dimensions: [3, 4, 5, 1, 2],
  },
  {
    n: 4,
    key: "love",
    title: "I love you",
    stem: "I love you for",
    invitation:
      "Say it to yourself — for the good, and despite the rest. Stay with it.",
    guidance:
      "Each line is self-love: 'I love you for x' for the good, and 'I love you despite x' for the hurt. Tender, direct, in the second person to oneself.",
    dimensions: [1, 2, 3, 4, 5],
  },
];

export type PrayerLine = { set: PrayerSet["key"]; text: string };

export const MEDITATION_LINES_PER_SET = 5;

/** Session lengths offered on the dashboard, in minutes. */
export const SESSION_MINUTE_OPTIONS = [5, 10, 15, 20, 30, 45] as const;

/** Seconds a single line is held before the next one, including the spoken words. */
export const SECONDS_PER_LINE = 25;

/**
 * The session is divided into four equal quarters — one per prayer — so the
 * number of lines in each set follows the time the person scheduled.
 */
export function linesPerSetFor(minutes: number): number {
  const perQuarter = (Math.max(1, minutes) * 60) / 4;
  return Math.min(15, Math.max(3, Math.round(perQuarter / SECONDS_PER_LINE)));
}

/** How long each line is held on screen for a given session length. */
export function dwellSecondsFor(minutes: number): number {
  const perQuarter = (Math.max(1, minutes) * 60) / 4;
  return Math.max(8, Math.round(perQuarter / linesPerSetFor(minutes)));
}

/**
 * Caller ID shown to the user when the voice-guided meditation call arrives.
 * Update this to the phone number attached to your Vapi phoneNumberId.
 */
export const VAPI_FROM_NUMBER = "+1 (555) 000-0000";

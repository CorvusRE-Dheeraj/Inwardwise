/**
 * Emotional/story states a fictional People Like Me character can be shown in.
 *
 * These are narrative presentation states only. They are never a medical or
 * psychological assessment of a character or of a member.
 */
export const CHARACTER_STATES = [
  "neutral",
  "thoughtful",
  "concerned",
  "uncertain",
  "hopeful",
  "relieved",
  "reflective",
] as const;

export type CharacterState = (typeof CHARACTER_STATES)[number];

export function isCharacterState(value: string | null | undefined): value is CharacterState {
  return !!value && (CHARACTER_STATES as readonly string[]).includes(value);
}

export function toCharacterState(value: string | null | undefined): CharacterState {
  return isCharacterState(value) ? value : "neutral";
}

export type StateMotion = {
  /** Human label used for accessible descriptions. */
  label: string;
  /** Idle drift, kept deliberately small and slow. */
  y: number[];
  rotate: number[];
  scale: number[];
  /** Seconds for one full idle cycle. */
  duration: number;
  /** Resting offset applied before the idle loop. */
  rest: { y: number; rotate: number; opacity: number };
  /** Seconds between blinks. */
  blinkEvery: number;
};

/**
 * Subtle, respectful motion only. No exaggerated cartoon expressions.
 */
export const STATE_MOTION: Record<CharacterState, StateMotion> = {
  neutral: {
    label: "at ease",
    y: [0, -2.5, 0],
    rotate: [0, 0, 0],
    scale: [1, 1.008, 1],
    duration: 5.5,
    rest: { y: 0, rotate: 0, opacity: 1 },
    blinkEvery: 5,
  },
  thoughtful: {
    label: "thinking something over",
    y: [0, -1.5, 0],
    rotate: [0, -1.6, 0],
    scale: [1, 1.005, 1],
    duration: 8,
    rest: { y: 0, rotate: -1, opacity: 1 },
    blinkEvery: 7,
  },
  concerned: {
    label: "holding something heavy",
    y: [0, 1.5, 0],
    rotate: [0, 0.6, 0],
    scale: [1, 1.003, 1],
    duration: 9.5,
    rest: { y: 2, rotate: 1, opacity: 0.97 },
    blinkEvery: 8,
  },
  uncertain: {
    label: "unsure which way to go",
    y: [0, -1, 0],
    rotate: [-1.2, 1.2, -1.2],
    scale: [1, 1.004, 1],
    duration: 7,
    rest: { y: 1, rotate: 0, opacity: 0.99 },
    blinkEvery: 4.5,
  },
  hopeful: {
    label: "a little more open",
    y: [0, -4, 0],
    rotate: [0, 0.4, 0],
    scale: [1, 1.012, 1],
    duration: 5,
    rest: { y: -2, rotate: 0, opacity: 1 },
    blinkEvery: 6,
  },
  relieved: {
    label: "settled and relaxed",
    y: [0, -2, 0],
    rotate: [0, -0.4, 0],
    scale: [1, 1.006, 1],
    duration: 6.5,
    rest: { y: -1, rotate: 0, opacity: 1 },
    blinkEvery: 6.5,
  },
  reflective: {
    label: "quietly looking back",
    y: [0, -1.2, 0],
    rotate: [0, -2.2, 0],
    scale: [1, 1.004, 1],
    duration: 9,
    rest: { y: 0, rotate: -1.6, opacity: 0.98 },
    blinkEvery: 7.5,
  },
};

/** Soft background wash per environment, used behind the character. */
export const ENVIRONMENT_WASH: Record<string, string> = {
  bedroom: "linear-gradient(160deg, rgba(90,110,190,0.14), rgba(20,23,26,0.04))",
  kitchen: "linear-gradient(160deg, rgba(200,160,90,0.16), rgba(20,23,26,0.04))",
  office: "linear-gradient(160deg, rgba(90,140,160,0.14), rgba(20,23,26,0.05))",
  outdoors: "linear-gradient(160deg, rgba(110,170,120,0.16), rgba(20,23,26,0.04))",
  street: "linear-gradient(160deg, rgba(120,120,140,0.16), rgba(20,23,26,0.05))",
  hospital: "linear-gradient(160deg, rgba(150,175,195,0.16), rgba(20,23,26,0.04))",
  evening: "linear-gradient(160deg, rgba(70,70,120,0.18), rgba(20,23,26,0.06))",
};

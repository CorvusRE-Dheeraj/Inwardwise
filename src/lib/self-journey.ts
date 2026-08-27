/**
 * Presentation-only mapping for the Self Journey.
 *
 * These labels exist purely for the user interface. They map onto the existing
 * five internal factors (1..5) without changing any underlying methodology,
 * questions, prompts, storage, or AI behaviour. Never surface internal factor
 * names or categories in the UI — use these neutral stage labels instead.
 */
export type JourneyStage = {
  /** Internal factor number this stage presents. */
  n: number;
  label: string;
  blurb: string;
  /** Short orientation line shown at the start of the stage. */
  orientation: string;
  /** Optional "Why are we asking this?" explanation. */
  why: string;
  /** Subtle milestone shown once the stage is finished. */
  milestone: string;
};

export const SELF_JOURNEY: JourneyStage[] = [
  {
    n: 1,
    label: "Getting Started",
    blurb: "We'll begin by getting to know you.",
    orientation: "Let's start with where your story begins.",
    why: "Your answers help us build a richer and more personalised understanding of you.",
    milestone: "We've started building your story.",
  },
  {
    n: 2,
    label: "Exploring",
    blurb: "We'll explore some of the experiences and patterns that have shaped you.",
    orientation: "We're going a little deeper now to understand you better.",
    why: "This helps us understand how different experiences may connect.",
    milestone: "We're developing a clearer picture of you.",
  },
  {
    n: 3,
    label: "Understanding",
    blurb: "We'll look more deeply at what makes you unique.",
    orientation: "Let's explore another part of your story.",
    why: "This helps distinguish what you enjoy from what you naturally do well.",
    milestone: "We're beginning to connect what you've shared.",
  },
  {
    n: 4,
    label: "Connecting",
    blurb: "We'll connect different parts of your story.",
    orientation: "We're connecting some of the things you've shared.",
    why: "This helps identify patterns that may become useful in understanding you.",
    milestone: "Your Self profile is taking shape.",
  },
  {
    n: 5,
    label: "Bringing It Together",
    blurb: "We'll bring what we've discovered together into your Avatar.",
    orientation: "You're getting close. Let's bring everything together.",
    why: "This brings the different parts of what you've shared into one picture.",
    milestone: "Your Self Journey is complete.",
  },
];

export const TOTAL_JOURNEY_STAGES = SELF_JOURNEY.length;

export function getStage(n: number): JourneyStage | undefined {
  return SELF_JOURNEY.find((s) => s.n === n);
}

export function stageIndex(n: number): number {
  return Math.max(0, SELF_JOURNEY.findIndex((s) => s.n === n));
}

/** Generic, user-facing description of what the Avatar is accumulating. */
export const AVATAR_BUILD_ITEMS = [
  "Experiences",
  "Patterns",
  "Strengths",
  "Connections",
  "More to discover",
];

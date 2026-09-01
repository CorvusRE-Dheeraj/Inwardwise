// UX copy for the Decision Journey. Presentation only: it does not touch the
// decision logic, the stage detection, the questions or the AI prompts.
import { STAGES } from "@/lib/ooi-stages";

export interface JourneyStage {
  n: number;
  /** Plain-language title shown to the person. */
  label: string;
  /** One short sentence explaining what happens here. */
  blurb: string;
  /** Optional "Why are we asking this?" note — only on key transitions. */
  why?: string;
  /** Optional milestone shown once this stage is complete. */
  milestone?: string;
}

export const JOURNEY: JourneyStage[] = [
  {
    n: 1,
    label: "Understand Your Situation",
    blurb: "Start by describing what is happening.",
    milestone: "We've clarified the situation.",
  },
  {
    n: 2,
    label: "Clarify Your Objective",
    blurb: "Understand what outcome you actually want.",
    why: "This helps distinguish the immediate problem from the outcome you actually want.",
    milestone: "Your objective is becoming clearer.",
  },
  {
    n: 3,
    label: "Explore Solutions",
    blurb: "Consider the possible ways forward.",
    why: "Exploring multiple possibilities helps prevent us from jumping to the first solution that comes to mind.",
    milestone: "You're ready to look at what could get in the way.",
  },
  {
    n: 4,
    label: "Identify Your Constraints",
    blurb: "Identify the concerns, limitations and realities that matter.",
    why: "Understanding your constraints helps us avoid options that may not realistically work for you.",
    milestone: "We've identified the key constraints.",
  },
  {
    n: 5,
    label: "Refine Your Objective",
    blurb: "Your objective is reconsidered in light of everything you have shared.",
    milestone: "Your objective has been refined.",
  },
  {
    n: 6,
    label: "Review the Objective",
    blurb: "Observe the objective being rewritten and redefined after filtering through everything.",
    why: "Seeing the objective restated helps you check whether it still reflects what you want.",
    milestone: "The refined objective is confirmed.",
  },
  {
    n: 7,
    label: "Break It Into Parts",
    blurb: "The objective is divided into smaller sub-objectives you can actually answer.",
    milestone: "Now let's bring everything together.",
  },

  {
    n: 8,
    label: "Make Your Decision",
    blurb: "Bring everything together and make a decision you can own.",
  },
];

export const TOTAL_STAGES = JOURNEY.length;

export function journeyStage(n: number): JourneyStage {
  return JOURNEY.find((s) => s.n === n) ?? JOURNEY[0]!;
}

/** Internal stage name, kept available for transcripts and tooltips. */
export function internalStageName(n: number): string {
  return STAGES.find((s) => s.n === n)?.name ?? "";
}

export function journeyPercent(current: number): number {
  return Math.min(100, Math.round(((current - 1) / TOTAL_STAGES) * 100));
}

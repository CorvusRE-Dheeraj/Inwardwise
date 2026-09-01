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
  /** Short badge describing what this stage focuses on. */
  focus: string;
  /** Warm, descriptive encouragement shown on the intro and beside questions. */
  encouragement: string;
  /** Small supportive reminders shown in the right-hand column. */
  tips: string[];
};

export const SELF_JOURNEY: JourneyStage[] = [
  {
    n: 1,
    label: "Getting Started",
    blurb: "We'll begin by getting to know you.",
    orientation: "Let's start with where your story begins.",
    why: "Your answers help us build a richer and more personalised understanding of you.",
    milestone: "We've started building your story.",
    focus: "This section is about childhood — ages 5 to 15",
    encouragement:
      "Going through this for the first time can feel like a lot, but answering these questions will only make things clearer. You may even connect parts of your story that you have never put together before.",
    tips: [
      "Think back to ages 5 to 15 — home, school, friends, the ordinary days.",
      "Small memories matter as much as big ones.",
      "Write in your own words. Half-formed thoughts are welcome.",
    ],
  },
  {
    n: 2,
    label: "Exploring",
    blurb: "We'll explore some of the experiences and patterns that have shaped you.",
    orientation: "We're going a little deeper now to understand you better.",
    why: "This helps us understand how different experiences may connect.",
    milestone: "We're developing a clearer picture of you.",
    focus: "This section is about the experiences that shaped you",
    encouragement:
      "You've already made a start, and that is the hardest part. Here we look at the moments that left a mark — good and difficult alike. Nothing here is judged; it is simply understood.",
    tips: [
      "Recall a moment that changed how you saw yourself.",
      "It's fine to share only what you're comfortable sharing.",
      "Notice repeats — the same situation showing up more than once.",
    ],
  },
  {
    n: 3,
    label: "Understanding",
    blurb: "We'll look more deeply at what makes you unique.",
    orientation: "Let's explore another part of your story.",
    why: "This helps distinguish what you enjoy from what you naturally do well.",
    milestone: "We're beginning to connect what you've shared.",
    focus: "This section is about what you enjoy and what you do well",
    encouragement:
      "You're over halfway into the conversation. This part often surprises people: what we love and what we're good at are not always the same thing, and seeing the difference clearly is genuinely useful.",
    tips: [
      "Think of a task where time disappears for you.",
      "Consider what others come to you for.",
      "Being unsure is an answer too — say so and keep going.",
    ],
  },
  {
    n: 4,
    label: "Connecting",
    blurb: "We'll connect different parts of your story.",
    orientation: "We're connecting some of the things you've shared.",
    why: "This helps identify patterns that may become useful in understanding you.",
    milestone: "Your Self profile is taking shape.",
    focus: "This section is about the threads running through your story",
    encouragement:
      "The picture is filling in. Here we draw lines between what you've already shared, so the separate pieces start to look like one story rather than many.",
    tips: [
      "Look for the thread that links your answers so far.",
      "Contradictions are normal — include them.",
      "You can pause and return; everything is saved.",
    ],
  },
  {
    n: 5,
    label: "Bringing It Together",
    blurb: "We'll bring what we've discovered together into your Avatar.",
    orientation: "You're getting close. Let's bring everything together.",
    why: "This brings the different parts of what you've shared into one picture.",
    milestone: "Your Self Journey is complete.",
    focus: "This is the final section — bringing it all together",
    encouragement:
      "You're at the last stage. What you write here ties the whole conversation together, and afterwards you'll be able to sit with your InwardWise Self and talk things through.",
    tips: [
      "Speak as you would to someone who knows you well.",
      "Say what matters most to you now, not what sounds impressive.",
      "One honest line is worth more than a page of polish.",
    ],
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

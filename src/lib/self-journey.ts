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
    n: 5,
    label: "Getting Started",
    blurb: "We'll begin with the experiences that have shaped you.",
    orientation: "Let's start with your story — the moments that made you.",
    why: "Your experiences are the foundation. Everything else we explore connects back to them.",
    milestone: "We've started building your story.",
    focus: "This section is about your unique life experiences",
    encouragement:
      "Going through this for the first time can feel like a lot, but answering these questions will only make things clearer. You may even connect parts of your story that you have never put together before.",
    tips: [
      "Recall a few moments that changed how you saw yourself.",
      "They don't need to be sorted into good or bad — tell them as they were.",
      "Write in your own words. Half-formed thoughts are welcome.",
    ],
  },
  {
    n: 4,
    label: "Exploring",
    blurb: "We'll explore how you meet the world outside yourself.",
    orientation: "Now let's look at how you connect with the world around you.",
    why: "Your interests show how you reach beyond yourself — they quietly shape what you know and who you meet.",
    milestone: "A clearer picture of your days is forming.",
    focus: "This section is about your interests and connections",
    encouragement:
      "These are the things you return to without being asked — sometimes alone, sometimes with others. Both matter, and both say something true about you.",
    tips: [
      "Think of what you do when time is entirely yours.",
      "Include the shared things: clubs, teams, gatherings.",
      "Being unsure is an answer too — say so and keep going.",
    ],
  },
  {
    n: 3,
    label: "Understanding",
    blurb: "We'll look at what you do well — and what comes effortlessly.",
    orientation: "Let's explore what you're good at.",
    why: "This helps distinguish what you enjoy from what you naturally do well.",
    milestone: "We're beginning to connect what you've shared.",
    focus: "This section is about your skills and talents",
    encouragement:
      "You're over halfway into the conversation. This part often surprises people: what we love and what we're good at are not always the same thing, and seeing the difference clearly is genuinely useful.",
    tips: [
      "Think of a task where time disappears for you.",
      "Consider what others come to you for.",
      "Being unsure is an answer too — say so and keep going.",
    ],
  },
  {
    n: 2,
    label: "Reflecting",
    blurb: "We'll reflect on the habits and patterns that have pulled you off course.",
    orientation: "This next part is private — seen only by you.",
    why: "Recognising the patterns that hold you back is what makes the picture honest and complete.",
    milestone: "Your Self profile is nearly complete.",
    focus: "This section is private — the habits you keep to yourself",
    encouragement:
      "Nobody sees this but you. It is encrypted with your PIN, and no one else can read it. Naming these patterns is not about judgement — it is what makes your Self accurate and complete.",
    tips: [
      "Write without judgement — extremes count too.",
      "Include how often these patterns have had you.",
      "You can pause and return; everything is saved.",
    ],
  },
  {
    n: 1,
    label: "Bringing It Together",
    blurb: "Finally, we'll return to where your story begins.",
    orientation: "You're nearly there. Let's return to where your story begins.",
    why: "Your early years hold the roots of everything you've shared — this is where the picture completes itself.",
    milestone: "Your Self Journey is complete.",
    focus: "This is the final section — your early years, ages 5 to 15",
    encouragement:
      "You're at the last stage. What you write here ties the whole conversation together, and afterwards you'll be able to sit with your InwardWise Self and talk things through.",
    tips: [
      "Think back to ages 5 to 15 — home, school, friends, the ordinary days.",
      "Small memories matter as much as big ones.",
      "Speak as you would to someone who knows you well.",
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

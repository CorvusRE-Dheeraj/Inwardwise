/**
 * Authored personality definitions for the fictional characters Alex and Mary.
 * These are illustrative only: they never describe a real member and are never
 * generated from anyone's private Self record.
 */

export type TraitLevel = "Low" | "Medium" | "High";

export type Personality = {
  /** Myers-Briggs type, e.g. "ISTJ". */
  type: string;
  typeWords: string;
  typeNote: string;
  /** Short one-line summary shown under the name. */
  summary: string;
  /** How they behave, in plain sentences. */
  traits: string[];
  house: { name: string; traits: string[] };
  background: string[];
  music: string;
  major: string;
  politics: string;
  ocean: { label: string; level: TraitLevel; note: string }[];
};

export const PERSONALITIES: Record<string, Personality> = {
  alex: {
    type: "INTP",
    typeWords: "Introverted · Intuitive · Thinking · Perceiving",
    typeNote: "A reflective, idea-driven type: curious, independent and slow to act without a deadline.",
    summary:
      "A quiet, deeply curious thinker who writes and reflects his way to insight, and needs a deadline to act.",
    traits: [
      "Withdraws from noise and crowds, and keeps a small circle of trusted people.",
      "Writes and self-reflects to find hidden patterns, then builds tools and ideas from them.",
      "Integrates widely across science, philosophy and psychology, but procrastinates on physical or open-ended tasks.",
    ],
    house: {
      name: "Ravenclaw",
      traits: [
        "Curiosity, originality and truth seeking.",
        "Values understanding over status, money or power.",
        "Thinks first and acts once the pattern is clear.",
      ],
    },
    background: [
      "Read widely as a child and ran his own chemistry, physics and astronomy experiments.",
      "Educated in engineering up to a PhD, with exposure to both eastern and western cultures.",
    ],
    music: "Wide-ranging, across three languages and both eastern and western traditions",
    major: "Engineering, with self-taught interests in astronomy, medicine, physics and psychology",
    politics: "Sceptical of money, status and concentrated power",
    ocean: [
      { label: "Openness", level: "High", note: "Endlessly curious and experimental." },
      { label: "Conscientiousness", level: "Medium", note: "Disciplined in thought, procrastinates on action." },
      { label: "Extraversion", level: "Low", note: "Needs long stretches of quiet." },
      { label: "Agreeableness", level: "Medium", note: "Kind to a few, distant from the crowd." },
      { label: "Neuroticism", level: "Medium", note: "Wary of conflict and pretence." },
    ],
  },
  mary: {
    type: "ISFJ",
    typeWords: "Introverted · Sensing · Feeling · Judging",
    typeNote: "About 19.4% of the US female population fall into this type.",
    summary:
      "Loyal and reliable, and more likely to take the work on herself than hand it to anyone else.",
    traits: [
      "Loyal and reliable.",
      "Has a hard time delegating, and tends to take on the work herself.",
      "Works best in smaller groups, stays organised and works hard.",
    ],
    house: {
      name: "Ravenclaw",
      traits: [
        "Wit, wisdom, creativity and intellect.",
        "Cherishes learning and curiosity.",
        "Comfortable with independent or unconventional thought.",
      ],
    },
    background: [
      "Grew up middle class between 2000 and 2005.",
      "Raised at the breakthrough of modern technology.",
    ],
    music: "Olivia Rodrigo, Noah Kahan, SZA, Lana Del Rey, Ariana Grande, Billie Eilish",
    major: "Psychology",
    politics: "Leftist",
    ocean: [
      { label: "Openness", level: "High", note: "Creative and curious." },
      { label: "Conscientiousness", level: "High", note: "Highly organised and disciplined." },
      { label: "Extraversion", level: "Low", note: "Keeps to herself when possible." },
      { label: "Agreeableness", level: "High", note: "A people pleaser." },
      { label: "Neuroticism", level: "Low", note: "Mild mannered." },
    ],
  },
};

export function personalityFor(slug: string): Personality | null {
  return PERSONALITIES[slug] ?? null;
}

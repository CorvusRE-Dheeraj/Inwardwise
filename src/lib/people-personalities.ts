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
    type: "ISTJ",
    typeWords: "Introverted · Sensing · Thinking · Judging",
    typeNote: "About 14% of the US male population fall into this type.",
    summary:
      "Reliable, consistent and at his best in an organised environment with clear rules.",
    traits: [
      "Reliable and consistent, and responds well to organised environments.",
      "Works best when rules are enforced, and takes responsibility easily.",
      "Analytical, and a stickler for the rules and the details.",
    ],
    house: {
      name: "Slytherin",
      traits: [
        "Ambition, cunning, resourcefulness and determination.",
        "Values strategic thinking, leadership and self-preservation.",
        "Calculates outcomes rather than acting on impulse.",
      ],
    },
    background: [
      "Grew up middle class between 2000 and 2005.",
      "Raised at the breakthrough of modern technology.",
    ],
    music: "Drake, Travis Scott, Post Malone, Bad Bunny, The Weeknd, Tyler the Creator",
    major: "Business and economics",
    politics: "Moderately conservative",
    ocean: [
      { label: "Openness", level: "Low", note: "Prefers safe routines." },
      { label: "Conscientiousness", level: "High", note: "Highly organised and disciplined." },
      { label: "Extraversion", level: "Low", note: "Keeps to himself when possible." },
      { label: "Agreeableness", level: "Low", note: "Very competitive." },
      { label: "Neuroticism", level: "Medium", note: "Feels pressure, rarely shows it." },
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

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
    type: "ISTP",
    typeWords: "Introverted · Sensing · Thinking · Perceiving",
    typeNote: "A physical, practical type: learns by doing, keeps feelings private and acts fast under pressure.",
    summary:
      "A driven young athlete who trains his way through everything, hides how smart he is, and lets anger speak for the feelings he was never allowed to show.",
    traits: [
      "Works through problems with the body first — drills, conditioning, the gym — rather than by talking.",
      "Grasps math, chemistry and physics quickly, but keeps it quiet so his friends will not call him a nerd.",
      "Under stress he either blows up or shuts down, then escapes into games, music or a drive to reset.",
    ],
    house: {
      name: "Gryffindor",
      traits: [
        "Courage, competitiveness and loyalty to his group.",
        "Values earning respect through effort on the field.",
        "Acts first, reflects afterwards.",
      ],
    },
    background: [
      "Grew up in a home where his parents fought until his mother left, and where boys don't cry.",
      "Starting linebacker as a sophomore and school shot put record holder, chasing a football scholarship to UCSB.",
    ],
    music: "Loud rap and rock through headphones, mostly to drown out the noise in his head",
    major: "Aiming at college on a football scholarship, with real strength in math and chemistry",
    politics: "Not interested; loyalty is to his team and his people, not to sides",
    ocean: [
      { label: "Openness", level: "Medium", note: "Curious about science, but shuts it down around his friends." },
      { label: "Conscientiousness", level: "High", note: "Relentless in training and practice." },
      { label: "Extraversion", level: "Medium", note: "Always with the boys, rarely open with them." },
      { label: "Agreeableness", level: "Low", note: "Anger comes out sideways; he pulls away instead of talking." },
      { label: "Neuroticism", level: "High", note: "Stress builds fast into tension, blowing up or shutting down." },
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

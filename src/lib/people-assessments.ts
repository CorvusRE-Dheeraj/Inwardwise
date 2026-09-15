import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { personalityFor } from "@/lib/people-personalities";

export type DemonstrationCharacterId = "alex" | "mary";

export type DemonstrationProfile = {
  id: DemonstrationCharacterId;
  name: string;
  avatarKey: string;
  situation: string;
  motivations: string[];
  concerns: string[];
  strengths: string[];
  weaknesses: string[];
  decisionStyle: string;
  answers: Record<string, string>;
  factorResults: Record<number, string>;
};

export const DEMONSTRATION_CHARACTERS: Record<DemonstrationCharacterId, DemonstrationProfile> = {
  alex: {
    id: "alex",
    name: "Alex",
    avatarKey: "alex",
    situation: "A structured, ambitious professional weighing an opportunity that does not fit his long-term plan.",
    motivations: ["Achievement", "Independence", "A clear path forward"],
    concerns: ["Making an avoidable mistake", "Losing control", "Being seen as unsuccessful"],
    strengths: ["Discipline", "Analysis", "Strategic follow-through"],
    weaknesses: ["Rigidity", "Difficulty asking for help", "Hiding uncertainty behind plans"],
    decisionStyle: "Analytical and risk-sensitive. Alex gathers facts, builds rules and prefers a defensible plan before acting.",
    answers: {
      d1_q1: "I feared failing in public and being the child who did not know the answer. I also feared sudden changes at home because I could not prepare for them.",
      d1_q2: "I prepared excessively, stayed quiet until I was certain and avoided activities where talent mattered more than practice. If I could not control the outcome, I often said I was not interested.",
      d1_q3: "I hid how badly I wanted approval. I acted self-sufficient because needing reassurance felt weak and gave other people power over me.",
      d1_q4: "Adults called me stubborn and controlling. Charitably, I was creating order when uncertainty felt unsafe, and protecting myself from being caught unprepared.",
      d1_q5: "I was proud of being dependable, improving my grades through discipline and becoming the person teachers trusted to finish difficult work.",
      d2_q1: "I over-plan, delay choices until I can defend every detail and become dismissive when other people work less carefully. Under pressure I isolate, compete and use productivity to avoid admitting I am uncertain.",
      d3_q1: "My skills are financial analysis, project planning and turning a large target into measurable steps. They developed through study, repetition and reviewing every mistake until I understood it.",
      d3_q2: "My talent is seeing the structure of a problem quickly. People ask me to organise unclear situations because I can identify dependencies and make a workable sequence.",
      d4_q1: "I follow markets, build spreadsheets, exercise to a plan and listen to music alone. These activities let me engage with the world without surrendering control of my time.",
      d4_q2: "I prefer small professional groups, competitive sports and focused conversations with one or two people. I rarely enjoy gatherings without a purpose.",
      d5_q1: "Moving schools taught me to rely on preparation. Earning my place in a competitive course rewarded discipline. A failed group project taught me that doing everything myself can also create failure.",
      d5_q2: "The pattern is that I turn uncertainty into systems. That has made me capable, but my next growth comes from keeping structure without treating every surprise or other person as a threat to it.",
    },
    factorResults: {
      1: "Alex’s shadow is a fear of visible failure and dependence. It produces discipline, but also makes uncertainty feel like exposure.",
      2: "His recurring enemy is over-control: planning becomes delay, self-reliance becomes isolation and precision can become dismissiveness.",
      3: "His strongest assets are analytical structure, financial reasoning and disciplined execution. His natural talent is organising ambiguity.",
      4: "He connects through purposeful, structured activities and small groups rather than open-ended social settings.",
      5: "His life pattern is turning uncertainty into systems. Growth means using structure as support without making it a defence against change.",
    },
  },
  mary: {
    id: "mary",
    name: "Mary",
    avatarKey: "merry",
    situation: "A loyal, thoughtful professional who has quietly taken on other people’s work and is struggling to hand any of it back.",
    motivations: ["Helping people", "Harmony", "Being dependable"],
    concerns: ["Letting someone down", "Creating conflict", "Appearing selfish"],
    strengths: ["Empathy", "Reliability", "Attentive care"],
    weaknesses: ["Over-responsibility", "Weak boundaries", "Quiet withdrawal when overwhelmed"],
    decisionStyle: "People-aware and conscientious. Mary first considers who may be hurt, then works hard to make the choice safe for everyone.",
    answers: {
      d1_q1: "I feared people being upset with me, especially adults I loved. I worried that a mistake or disagreement could change how they felt about me.",
      d1_q2: "I became helpful, anticipated what people needed and apologised quickly. I often agreed before checking what I wanted because harmony felt safer than saying no.",
      d1_q3: "I hid resentment and tiredness. I felt ashamed whenever caring for someone became a burden, because I believed a good person should want to help without limits.",
      d1_q4: "Adults called me too sensitive and sometimes sulky. Charitably, I withdrew because I did not yet know how to express a need without fearing that it would disappoint someone.",
      d1_q5: "I was proud that people trusted me, that I noticed who was left out and that I could make a worried person feel calmer and less alone.",
      d2_q1: "I say yes too quickly, take responsibility for feelings that are not mine and redo work rather than risk an uncomfortable conversation. When overwhelmed, I go quiet, procrastinate on my own needs and hope someone notices.",
      d3_q1: "My skills are listening, writing with care, organising small teams and noticing emotional details. They grew through psychology study, helping friends and repeatedly taking responsibility in group work.",
      d3_q2: "My talent is making people feel understood. I notice what is unspoken and can create enough safety for someone to say what they actually mean.",
      d4_q1: "I read psychology and fiction, keep notes, listen closely to music and take quiet walks. These help me process feelings and stay curious about other lives.",
      d4_q2: "I like small reading groups, volunteering and spending time with one close friend. I connect best when people are doing something meaningful together.",
      d5_q1: "Supporting a struggling friend taught me the value of listening. Studying psychology gave language to what I noticed. Burning out after carrying a team project showed me that care without boundaries harms everyone.",
      d5_q2: "The pattern is that I create safety for other people, sometimes by disappearing from my own life. My direction is to keep the care while learning that a clear boundary can also be loving.",
    },
    factorResults: {
      1: "Mary’s shadow is a fear that needs or disagreement will cost her connection. It creates sensitivity, but can hide resentment and exhaustion.",
      2: "Her recurring enemy is over-responsibility: helping becomes automatic agreement, then overwhelm, withdrawal and neglected needs.",
      3: "Her strongest assets are attentive listening, thoughtful communication and small-team care. Her natural talent is making people feel understood.",
      4: "She connects through reflective solo interests and intimate, meaningful groups rather than broad social activity.",
      5: "Her life pattern is creating safety for others. Growth means preserving that care while treating boundaries as an expression of care too.",
    },
  },
};

export const DEMONSTRATION_CHARACTER_IDS = Object.keys(
  DEMONSTRATION_CHARACTERS,
) as DemonstrationCharacterId[];

export function assessmentFor(id: DemonstrationCharacterId): DemonstrationProfile {
  return DEMONSTRATION_CHARACTERS[id];
}

export function validateDemonstrationAnswers(): string[] {
  const questionKeys = AVATAR_DIMENSIONS.flatMap((dimension) =>
    dimension.questions.map((question) => question.key),
  );
  return DEMONSTRATION_CHARACTER_IDS.flatMap((id) => {
    const character = DEMONSTRATION_CHARACTERS[id];
    return questionKeys
      .filter((key) => !character.answers[key]?.trim())
      .map((key) => `${character.name} is missing ${key}`);
  });
}

export function demonstrationType(id: DemonstrationCharacterId): string {
  return personalityFor(id)?.type ?? "Illustrative profile";
}
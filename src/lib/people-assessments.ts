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
    situation:
      "A reflective, highly curious thinker who reads and writes his way to clarity, and who stalls when action is physical, new and has no outside deadline.",
    motivations: ["Understanding how things really work", "Quiet time to reflect", "Creating something original"],
    concerns: ["Being drawn into conflict", "Social pretence and status games", "Losing his thinking time"],
    strengths: ["Writing to think", "Self-reflection", "Connecting ideas across many fields"],
    weaknesses: ["Procrastination", "Thinking so long that action never starts", "Withdrawing from groups"],
    decisionStyle:
      "Reflective and integrative. Alex writes, reads and reasons across fields until the pattern is clear, then needs an external deadline to move.",
    answers: {
      d1_q1: "I was afraid of walking through the neighbourhood, because rowdy kids used to tease me or try to get into fights with me.",
      d1_q2: "I went out less, spent more time in the library or at home, and socialised only with a few select people.",
      d1_q3: "I felt society is built on false pretences kept up for show, and that there is an over-emphasis on money and that power is very corrupting. I kept that view hidden because it set me apart.",
      d1_q4: "People called me aloof. Cast differently, staying apart was how I minimised the harmful influence of the crowd, of the authority controlling me and of the bullies who harassed me.",
      d1_q5: "I was proud of reading widely and of my own experiments in chemistry, physics and astronomy. Truth seeking, rather than fitting in, was what I was good at.",
      d2_q1: "My main vice is procrastination. I am not a high-energy person and I have a strong need to think, and if I think too long I never get up and finish the thing. Physical work meets the most resistance. When the task is physical, new, uncertain and has no external deadline, it is almost certain to be put off.",
      d3_q1: "Writing is one skill. I started writing to clarify my mind, detect hidden patterns and meanings, and then build tools and processes from them; writing lets me extract the essence out of actions, mistakes and decisions. Self-reflection is another skill: I need quiet time to sit back and reflect, and I cannot interact with people all day. Creative cooking is a third: I believe making vegetarian food taste good takes more creativity than cooking meat, and that fermentation is good for the gut, so I experiment from scratch and blend the Indian food I grew up with into novel recipes.",
      d3_q2: "My greatest talent is creative and inductive thinking: connecting information at a high level so I can integrate wide fields of knowledge and develop insights.",
      d4_q1: "I listen to music of many genres in three languages, from both eastern and western cultures, and can sit alone with it for hours. I am scientifically curious across astronomy, medicine, physics, psychology and the human body, and watch undramatised documentaries; my engineering education up to a PhD trained me to stay curious and creative. I also do garden farming, using novel methods to grow healthy vegetarian food.",
      d4_q2: "Very little. I do not attend group events; I used to go to conferences and have stopped. Blogging has been my one attempt to turn a solo interest into something shared.",
      d5_q1: "Earning a PhD is a genuinely unusual experience that few people have. The ability to stay curious, integrate things at a high level and keep creativity at the centre may all be effects of it.",
      d5_q2: "The pattern is that I withdraw from noise and turn what I observe into understanding. It has made me original, and the next step is letting that understanding reach other people and become action.",
    },
    factorResults: {
      1: "Alex’s shadow began with the fear of being teased or dragged into fights. He withdrew into books and a small circle, and came to see society as built on pretence, money and corrupting power.",
      2: "His recurring enemy is procrastination. Long thinking replaces starting, and physical, new, uncertain work with no deadline is the most likely to be avoided.",
      3: "His strongest assets are writing to think, self-reflection and creative cooking. His natural talent is creative, inductive thinking that integrates wide fields into insight.",
      4: "He connects mostly on his own: music across cultures and languages, scientific curiosity and documentaries, and garden farming. Group life is thin, with blogging as his one bridge outward.",
      5: "His life pattern runs through the PhD experience: stay curious, integrate at a high level, create. Growth means turning that understanding into shared work and action.",
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
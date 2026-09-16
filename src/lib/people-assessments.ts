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
      "A driven young athlete chasing a football scholarship, carrying anger he was never allowed to express, and hiding how smart he is so he can stay one of the boys.",
    motivations: ["A football scholarship to UCSB", "Making his dad proud", "Belonging with his friends"],
    concerns: ["Becoming his dad", "Being seen as a nerd", "Losing his place with the boys"],
    strengths: ["Athletic discipline", "Natural aptitude for math, chemistry and physics", "One honest relationship where he can talk"],
    weaknesses: ["Anger that comes out sideways", "Shutting down instead of talking", "Hiding his abilities out of fear of ridicule"],
    decisionStyle:
      "Reactive under stress. Alex either blows up or shuts down, then escapes into games or the gym to reset before he can think clearly.",
    answers: {
      d1_q1: "Growing up I liked sports — I was a linebacker in the fall and threw shot put in the spring — and hanging out with my boys playing COD. I handled problems by shutting down and saying I was fine even when I wasn't, and when I couldn't solve one I'd get angry. I wasn't taught to talk about my emotions; my dad always said boys don't cry, so anger became the one emotion I was allowed to express.",
      d1_q2: "When something hard came at me I shut down or became angry — quiet and reserved. My girl tells me I'm \"avoidant\" and \"closed off\". Mostly I'd steer clear and avoid the situation entirely.",
      d1_q3: "I'm actually pretty smart, but nobody gives me credit for anything. I barely study and keep it on the down-low so no one gives me crap — my friends would call me a nerd and I'd be left out of team stuff. My girl is the only one who knows; we talk about the real stuff.",
      d1_q4: "Adults would have called it my anger issues. Looking back, that anger was protecting me from showing my emotions — because boys don't cry.",
      d1_q5: "I became the starting linebacker as a sophomore, the first since my dad to do that, and I won the science fair before I moved back to my dad's hometown after my parents' divorce. What felt good was someone telling me I did a good job — making my dad proud.",
      d2_q1: "My anger, lack of communication and emotional immaturity pull me off course pretty often, especially when I'm stressed — which is pretty often. It feels crappy, and my girl gets mad at me.",
      d3_q1: "I play football and I hold the shot put record at my school. I'm also pretty good at math and chemistry. For all of it, I just practiced — drills mostly, conditioning to get stronger, lifting in the gym most days.",
      d3_q2: "Math and chemistry come easily, and I'm decent at physics — it just clicks. I'm taking organic chemistry and Sn2 reactions make complete sense to me while everyone else struggles, so sometimes I help my boys with it. I'd explore it more just for fun, but my friends would call me a nerd or a dork, so I shut it down. I'm excited for college so I can be more myself.",
      d4_q1: "Mostly video games — first-person shooters. They're fast-paced and keep my mind off stuff; you're constantly moving and reacting, and when you win or make a good play it feels good. Plus I'm actually good at it.",
      d4_q2: "Usually hanging out playing COD or LoL, throwing back a few drinks, hitting the gym together or working on footwork drills for football. We don't really do the deep talking thing — we just game, watch sports and chill. I mostly talk about the real stuff with my girl.",
      d5_q1: "My parents' divorce shaped me. My mom and dad always fought — my dad would yell and my mom just had to take it, until she left the papers and left. My biggest fear is becoming my dad, and I think I already am him: I get angry quickly too, and then I yell or shut down. Either way with my girl I lose — if I snap we end up in a huge argument, and if I pull away she says I'm avoiding her.",
      d5_q2: "The pattern running through everything is that stress sucks and I hate feeling backed into a corner. Whether I'm blowing up or shutting down, it's me dealing with stuff piling up at once — chest tight, head racing, an overload of noise. So I bounce: loud music and a drive, the gym, or locking my door and playing COD for hours until I reset. Then I calm down and everything's fine.",
    },
    factorResults: {
      1: "Alex’s shadow grew from a home where boys don’t cry. Anger became the only permitted emotion and a wall against everything else, while being smart had to stay hidden to keep his place with the boys.",
      2: "His recurring enemy is anger with no outlet: stress builds until he blows up or shuts down, and avoidance strains the relationship that matters most to him.",
      3: "His strongest assets are disciplined athletic work and a quick natural grasp of math, chemistry and physics — a mind he only uses freely when no one is watching.",
      4: "He connects through games, the gym and shared sport rather than deep talk, keeping one honest channel — his girlfriend — for the real stuff.",
      5: "His life pattern runs through his parents’ divorce: a fear of becoming his dad, the same quick anger, and an escape-and-reset routine that works short-term but keeps the cycle going.",
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
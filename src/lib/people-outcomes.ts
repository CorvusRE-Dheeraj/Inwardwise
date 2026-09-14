/**
 * How results look for the fictional characters once their Self build is
 * complete. This is authored, illustrative content only: it is never generated
 * from a real member and never touches anyone's private Self record.
 */

export type OutcomeBlock = {
  /** Product word shown after the character's name, e.g. "Decision". */
  product: "Decision" | "Self Aware" | "Connect";
  /** What the character brought in. */
  situation: string;
  /** What the Self build knows about them that shapes the answer. */
  selfInsight: string;
  /** What InwardWise said back. */
  response: string[];
};

export type CharacterOutcomes = {
  intro: string;
  blocks: OutcomeBlock[];
};

export const CHARACTER_OUTCOMES: Record<string, CharacterOutcomes> = {
  mary: {
    intro:
      "Mary finished her Self build first, so her results are shaped by what she already knows about herself.",
    blocks: [
      {
        product: "Decision",
        situation:
          "A relationship has ended and Mary is deciding whether to move city for a fresh start.",
        selfInsight:
          "Her Self build shows she makes large outward changes when she is hurt, and later misses the people she left.",
        response: [
          "Are you moving toward something, or away from a feeling? Both are valid, but they need different plans.",
          "Before the city question, one smaller question: what would this week look like if you were not alone in it?",
          "If the answer to that changes how the move feels, the move was never the real decision.",
        ],
      },
      {
        product: "Self Aware",
        situation: "Mary says she feels lonely and flat, with no clear reason.",
        selfInsight:
          "Her pattern is withdrawal: when a relationship breaks or she feels hurt, she goes quiet and stops replying.",
        response: [
          "You tend to go quiet when you are hurt. Quiet feels safe, and it also keeps the loneliness in place.",
          "This is not a flaw. It is a habit that once protected you.",
          "The smallest move against it is answering one message today, not fixing your whole life.",
        ],
      },
      {
        product: "Connect",
        situation: "Mary agrees she does not want to sit in it alone tonight.",
        selfInsight:
          "She responds better to doing something beside a friend than to talking about how she feels.",
        response: [
          "Reach out to one friend, the one who does not ask heavy questions.",
          "Would you like a couple of ideas for what to do together? Watching a film side by side counts.",
          "If a film suits tonight, try something warm rather than sad, and let the evening be ordinary.",
        ],
      },
    ],
  },
  alex: {
    intro:
      "Alex has also completed his Self build, so his results follow his own pattern, not Mary's.",
    blocks: [
      {
        product: "Decision",
        situation:
          "Alex is choosing between a promotion with longer hours and staying where he is.",
        selfInsight:
          "His Self build shows he says yes quickly to anything that looks like proof he is doing well.",
        response: [
          "You are not weighing two jobs. You are weighing how much proof you need this year.",
          "If the title were removed and only the hours remained, would you still want it?",
          "Answer that first, then the promotion becomes a simple yes or no.",
        ],
      },
      {
        product: "Self Aware",
        situation: "Alex says he is tired all the time but cannot slow down.",
        selfInsight:
          "His pattern is overcommitment: he fills empty time because stillness feels like falling behind.",
        response: [
          "You fill time rather than rest in it. Being busy is how you keep worry quiet.",
          "The tiredness is not weakness. It is the cost of a strategy that works.",
          "Protect one hour this week with nothing in it, and notice what shows up.",
        ],
      },
      {
        product: "Connect",
        situation: "Alex admits he has not spoken to anyone outside work in weeks.",
        selfInsight:
          "He keeps friendships alive through shared activity rather than long conversations.",
        response: [
          "Join one thing that already has a time and a place, so you do not have to organise it.",
          "A weekly walk, a class, a game. Something that repeats without effort.",
          "Would you like a few options near you that meet at the same time each week?",
        ],
      },
    ],
  },
};

export function outcomesFor(slug: string): CharacterOutcomes | null {
  return CHARACTER_OUTCOMES[slug] ?? null;
}

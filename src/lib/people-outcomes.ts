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
      "Mary is an ISFJ: loyal, organised, curious, and a people pleaser. Her results are shaped by that pattern, not by anyone else's.",
    blocks: [
      {
        product: "Decision",
        situation:
          "Mary is deciding whether to keep leading a project nobody else volunteered for.",
        selfInsight:
          "Her Self build shows she says yes to protect other people from discomfort, then absorbs the cost quietly.",
        response: [
          "You are not deciding whether the project matters. You are deciding whether anyone is allowed to disappoint you.",
          "Before the yes, one smaller question: which single piece could someone else carry badly and it would still be fine?",
          "If handing that one piece over feels unbearable, the workload was never the real question.",
        ],
      },
      {
        product: "Self Aware",
        situation: "Mary says she is tired and cannot remember the last thing she read for herself.",
        selfInsight:
          "Her pattern is over-responsibility: high conscientiousness plus high agreeableness means she takes the work instead of delegating it.",
        response: [
          "You take the work on yourself because handing it over feels like letting people down.",
          "This is not a flaw. It is loyalty aimed outward, with nothing left pointed at you.",
          "The smallest move against it is asking for one thing today, not redesigning your whole role.",
        ],
      },
      {
        product: "Connect",
        situation: "Mary keeps drafting replies to friends and not sending them.",
        selfInsight:
          "She is introverted and does better in small groups, and better still doing something beside one person than talking about feelings.",
        response: [
          "One friend, in a small setting, is enough. Not a group, and not a heavy conversation.",
          "Send the reply you already wrote. It does not need improving.",
          "Then do something ordinary together, a film or a walk, and let the evening ask nothing of you.",
        ],
      },
    ],
  },
  alex: {
    intro:
      "Alex is an ISTJ: disciplined, analytical, competitive and strategic. His results follow that pattern, not Mary's.",
    blocks: [
      {
        product: "Decision",
        situation:
          "Alex is weighing an offer that pays more but breaks the plan he has been following for years.",
        selfInsight:
          "His Self build shows he treats the plan as the rule, and calculates outcomes rather than admitting he wants something.",
        response: [
          "You are not comparing two offers. You are deciding whether your own plan is allowed to be wrong.",
          "If nobody ever learned which one you took, would the numbers still be tied?",
          "Answer that, and the spreadsheet stops being the place you hide.",
        ],
      },
      {
        product: "Self Aware",
        situation: "Alex says the uncertainty is worse than either outcome.",
        selfInsight:
          "His pattern is control: low openness and high discipline mean he would rather decide early than sit in an unorganised state.",
        response: [
          "You are not impatient. You are uncomfortable with the one thing you cannot put in order.",
          "Deciding fast would end the discomfort, and it would also end the thinking.",
          "Give the question one more day on purpose, and treat waiting as part of the plan.",
        ],
      },
      {
        product: "Connect",
        situation: "Alex has not told a single person about the offer.",
        selfInsight:
          "He is introverted and competitive, so asking for input feels like handing someone else the decision.",
        response: [
          "Tell one person, and set the terms: you want their reading, not their verdict.",
          "Pick someone who will not try to win the conversation.",
          "You keep ownership either way. That is the point of saying it out loud.",
        ],
      },
    ],
  },
};

export function outcomesFor(slug: string): CharacterOutcomes | null {
  return CHARACTER_OUTCOMES[slug] ?? null;
}

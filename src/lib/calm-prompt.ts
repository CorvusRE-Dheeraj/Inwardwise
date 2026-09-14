import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import type { AvatarAnswers } from "@/lib/avatar-prompt";

function answersBlock(answers: AvatarAnswers): string {
  return AVATAR_DIMENSIONS.map((d) => {
    const qa = d.questions
      .map((q) => {
        const a = (answers[q.key] ?? "").trim();
        return a ? `Q: ${q.prompt}\nA: ${a}` : null;
      })
      .filter(Boolean)
      .join("\n\n");
    return qa ? `FACTOR ${d.n}\n${qa}` : `FACTOR ${d.n} — (not answered)`;
  }).join("\n\n---\n\n");
}

/**
 * Builds the prompt for a Self-Calm session drawn from the person's own five
 * factors: one round per repetition, four prayers per round, always in the
 * order gratitude, forgiveness, apology, love.
 */
export function buildCalmRoundsPrompt(
  answers: AvatarAnswers,
  rounds: number,
  name?: string,
): string {
  const seed = Math.random().toString(36).slice(2, 10);

  return `You are preparing a private Self-Calm session for ${name || "this person"}.

The practice has four prayers, always in this order: "Thank you for", "Please forgive me for", "I am sorry for", "I love myself". Each one is completed with something true about this person, taken only from the answers they wrote themselves below.

=== THEIR OWN ANSWERS ===

${answersBlock(answers)}

=== END ===

Write ${rounds} rounds. Each round has one line for each of the four prayers:
- "thank": something positive from any of the five factors — a gift, a talent, a person, an experience they rarely credit.
- "forgive": something negative from any of the five factors they need release from — a wound carried too long, something suppressed.
- "sorry": something negative from any of the five factors they did, did not do, misunderstood, or let a destructive pattern do.
- "love": self-love drawn from anything positive or negative — "I love myself for …" or "I love myself despite …".

RULES
- Begin each line with that prayer's exact opening words.
- Ground every line in their own words above. Never invent events. If a factor is unanswered, draw from those that are.
- One sentence per line, spoken comfortably in a single breath, 8 to 26 words.
- Plain, warm and specific. No therapy jargon, no headings, no numbering.
- Every round must draw from different factors and different material, so no two rounds feel alike. Variation seed: ${seed}.
- Do not add the phrase "Imagine the situation" — that is spoken separately.
- If they wrote almost nothing, write gentle universal lines that still fit the openings.

Respond with JSON only, no prose and no code fences:
{"rounds":[{"thank":"Thank you for …","forgive":"Please forgive me for …","sorry":"I am sorry for …","love":"I love myself …"}]}
Include exactly ${rounds} rounds.`;
}

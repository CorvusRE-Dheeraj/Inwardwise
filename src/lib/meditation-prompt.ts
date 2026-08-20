import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { MEDITATION_LINES_PER_SET, PRAYER_SETS, type PrayerLine } from "@/lib/meditation";

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
 * Builds the prompt that turns a person's own factor answers into their
 * four sets of prayer lines for tonight's meditation.
 *
 * `linesPerSet` follows the session length they scheduled — the session is
 * split into four equal quarters, one per prayer.
 */
export function buildMeditationPrompt(
  answers: AvatarAnswers,
  name?: string,
  linesPerSet: number = MEDITATION_LINES_PER_SET,
  minutes?: number,
): string {
  const sets = PRAYER_SETS.map(
    (s) =>
      `SET ${s.n} · key "${s.key}" · stem "${s.stem} …"\nDraw from factors ${s.dimensions.join(", ")} in that order.\n${s.guidance}${
        s.openings ? `\nBegin this set with lines that answer: ${s.openings.join(" / ")}` : ""
      }`,
  ).join("\n\n");

  const seed = Math.random().toString(36).slice(2, 10);

  return `You are preparing tonight's private meditation for ${name || "this person"}.

The practice is a modified Ho'oponopono: four prayers — "I am sorry", "Please forgive me", "Thank you", "I love you" — each completed with something true about this person, taken from the answers they wrote themselves below.

=== THEIR OWN ANSWERS ===

${answersBlock(answers)}

=== END ===

${minutes ? `This is a ${minutes}-minute session, divided into four equal quarters — one per prayer.\n\n` : ""}Write ${linesPerSet} lines for each of the four sets.

${sets}

RULES
- Every line must begin with that set's exact stem (set 4 may also use "I love you despite").
- Every line must be grounded in their own words above. Never invent events. If a factor is unanswered, draw from the ones that are.
- One sentence per line, spoken aloud comfortably in a single breath, 8–28 words.
- Speak to them in the second person where natural; keep it plain, warm and specific. No therapy jargon, no headings, no numbering.
- Within each set, vary and shuffle which factor each line draws from so the session is never predictable. The four sets themselves stay in order.
- These lines must be new: never repeat a phrasing they are likely to have heard in an earlier session. Session variation seed: ${seed}.
- If they wrote almost nothing, write gentle universal lines that still fit the stems.

Respond with JSON only, no prose and no code fences:
{"lines":[{"set":"sorry","text":"I am sorry for …"}, …]}
Include all four sets in order: sorry, forgive, thank, love.`;
}

export function parseMeditationLines(raw: string): PrayerLine[] {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { lines?: PrayerLine[] };
    const valid = (parsed.lines ?? []).filter(
      (l) =>
        l &&
        typeof l.text === "string" &&
        l.text.trim().length > 0 &&
        PRAYER_SETS.some((s) => s.key === l.set),
    );
    return valid.map((l) => ({ set: l.set, text: l.text.trim() }));
  } catch {
    return [];
  }
}

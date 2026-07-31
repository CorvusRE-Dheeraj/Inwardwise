import { AVATAR_DIMENSIONS } from "@/lib/avatar-dimensions";
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
    return qa ? `DIMENSION ${d.n} — ${d.italic}\n${qa}` : `DIMENSION ${d.n} — (not answered)`;
  }).join("\n\n---\n\n");
}

/**
 * Builds the prompt that turns a person's own dimension answers into their
 * four sets of prayer lines for tonight's meditation.
 */
export function buildMeditationPrompt(answers: AvatarAnswers, name?: string): string {
  const sets = PRAYER_SETS.map(
    (s) =>
      `SET ${s.n} · key "${s.key}" · stem "${s.stem} …"\nDraw from dimensions ${s.dimensions.join(", ")} in that order.\n${s.guidance}${
        s.openings ? `\nBegin this set with lines that answer: ${s.openings.join(" / ")}` : ""
      }`,
  ).join("\n\n");

  return `You are preparing tonight's private meditation for ${name || "this person"}.

The practice is a modified Ho'oponopono: four prayers — "I am sorry", "Please forgive me", "Thank you", "I love you" — each completed with something true about this person, taken from the answers they wrote themselves below.

=== THEIR OWN ANSWERS ===

${answersBlock(answers)}

=== END ===

Write ${MEDITATION_LINES_PER_SET} lines for each of the four sets.

${sets}

RULES
- Every line must begin with that set's exact stem (set 4 may also use "I love you despite").
- Every line must be grounded in their own words above. Never invent events. If a dimension is unanswered, draw from the ones that are.
- One sentence per line, spoken aloud comfortably in a single breath, 8–28 words.
- Speak to them in the second person where natural; keep it plain, warm and specific. No therapy jargon, no headings, no numbering.
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

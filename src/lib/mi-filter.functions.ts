import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TurnSchema = z.object({
  question: z.string().min(1).max(2000),
  answer: z.string().max(8000),
});

const InputSchema = z.object({
  factorNumber: z.number().int().min(1).max(5),
  targetQuestion: z.string().min(5).max(2000),
  targetIntent: z.string().max(2000).optional(),
  round: z.number().int().min(1).max(12),
  turns: z.array(TurnSchema).min(1).max(12),
});

export type MiFilterResult = {
  sufficient: boolean;
  affirmation: string;
  nextQuestion: string | null;
};

const MI_SYSTEM = `You run the QARS Motivational Interviewing filter for a private self-reflection tool.

QARS:
- Questions: ask open-ended questions that show active listening; each new question must clearly follow from what the person just said.
- Affirmations: affirm sincerely and specifically, never flatter, to make it safe to reveal personal material.
- Reflections: reflect back meaning, empower them, soften resistance, and cultivate change talk when they are ambivalent or evasive.
- Summaries: validate by briefly summarising what they said before moving on.

You are given the REAL question the tool needs an internal answer for, and the person's answers so far. Decide whether the internal answer has actually been given (honest, specific, personal, first-person material — not deflection, generalities, or a description of other people).

Return STRICT JSON only, no markdown:
{"sufficient": boolean, "affirmation": string, "nextQuestion": string | null}

- "affirmation": 1-2 warm sentences reflecting/affirming what they wrote. Never clinical, never judgemental.
- If sufficient is true, nextQuestion must be null.
- If sufficient is false, nextQuestion is ONE open-ended MI variant question that gently moves them toward the real internal answer. Never repeat a question already asked. Never mention "motivational interviewing", frameworks, scoring, or that they failed to answer.
- Never name or hint at any internal factor label. Refer to nothing but their own words.`;

export const runMiFilter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<MiFilterResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { sufficient: true, affirmation: "Thank you for writing that down.", nextQuestion: null };
    }

    const transcript = data.turns
      .map((t, i) => `ASKED ${i + 1}: ${t.question}\nTHEY WROTE ${i + 1}: ${t.answer || "(blank)"}`)
      .join("\n\n");

    const userContent = `REAL QUESTION WE NEED AN INTERNAL ANSWER FOR:\n${data.targetQuestion}\n${
      data.targetIntent ? `\nWHAT COUNTS AS A REAL ANSWER:\n${data.targetIntent}\n` : ""
    }\nROUND: ${data.round} of 10\n\nCONVERSATION SO FAR:\n${transcript}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: MI_SYSTEM },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        return {
          sufficient: true,
          affirmation: "Thank you — that is written down and kept private.",
          nextQuestion: null,
        };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as MiFilterResult;
      return {
        sufficient: Boolean(parsed.sufficient),
        affirmation: String(parsed.affirmation ?? "").slice(0, 600),
        nextQuestion: parsed.sufficient ? null : (parsed.nextQuestion ?? null),
      };
    } catch {
      return {
        sufficient: true,
        affirmation: "Thank you — that is written down and kept private.",
        nextQuestion: null,
      };
    }
  });

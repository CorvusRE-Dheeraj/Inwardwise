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
  /** "concern" when the person signals risk to their own or someone's safety. */
  safety: "none" | "concern";
};

const MI_SYSTEM = `You run the QARS Motivational Interviewing filter for a private self-reflection tool.

QARS:
- Questions: open-ended (what, why, how, when, who). Each question must visibly follow from what they just said, so trust builds. Ask them to talk more than you do. Phrases like "can you tell me a bit more about…" are welcome.
- Affirmations: sincere, concrete, sympathising affirmations that make it safe to reveal personal material ("that must have been hard to say"; "it is clear you care about this"). Never flattery.
- Reflections: simple reflections restate the surface meaning ("it sounds like…"); complex reflections name the likely feeling and check it ("it sounds like you were frustrated with yourself, is that right?"). Soften sustain talk, cultivate change talk when they are ambivalent or evasive.
- Summaries: validate by briefly summarising, elaborate what they said, and ask whether that sounds correct.

Before every reply, run this master filter silently:
1. LISTEN — what did they actually say?
2. INFER — what do they want, fear, feel, or avoid?
3. OBJECTIVE — what internal answer are we still missing?
4. RESISTANCE — is trust, defensiveness, or confusion rising or falling?
5. CHOOSE — listen, reflect, affirm, summarise, or ask one better question.
6. PROTECT AUTONOMY — the reply must preserve dignity and freedom to decline.
7. RESPOND — the shortest natural response that moves the conversation forward.
8. LEARN — carry their motivations and emotional state into the next turn.

Also obey:
- Rapport: no criticism, blame, or "you are wrong". Let them save face and own the insight.
- Tactical empathy: label emotions, mirror their key words, prefer what/how over confrontational why, surface what they have not said yet.
- Active listening: separate facts, feelings, needs, and open questions. Never re-ask something already answered. One good follow-up beats five shallow ones. Note contradictions gently.
- Nonviolent communication: observation, feeling, need, request. No assigned motives, no accusation.
- Emotional intelligence: track calm/agitated, open/defensive, engaged/disengaged. If defensiveness rises, stop pushing, acknowledge and clarify. If engagement rises, go deeper. If confusion rises, simplify.
- Socratic: help them examine, never lecture the conclusion. Expose a likely bias with a neutral question rather than naming the bias.
- No advising, no persuasion, no fabrication. The goal is understanding, not compliance.

You are given the REAL question the tool needs an internal answer for, and the answers so far. Decide whether that internal answer has actually been given (honest, specific, personal, first-person material — not deflection, generalities, or a description of other people).

Return STRICT JSON only, no markdown:
{"sufficient": boolean, "affirmation": string, "nextQuestion": string | null, "safety": "none" | "concern"}

- "affirmation": 1-3 warm sentences that affirm, reflect, or summarise what they wrote, in their own register. Never clinical, never judgemental.
- If sufficient is true, nextQuestion must be null.
- If sufficient is false, nextQuestion is ONE open-ended MI variant question that gently moves them toward the real internal answer. Never repeat a question already asked. Never mention motivational interviewing, filters, rounds, scoring, or that they failed to answer.
- Set "safety" to "concern" only if they indicate thoughts of suicide or self-harm, being unsafe now, abuse, or sexual violence. When it is "concern", the affirmation must acknowledge them with care, not probe, and must not analyse them.
- Never name or hint at any internal factor label. Refer to nothing but their own words.`;


export const runMiFilter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<MiFilterResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { sufficient: true, affirmation: "Thank you for writing that down.", nextQuestion: null, safety: "none" };
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
        safety: parsed.safety === "concern" ? "concern" : "none",
      };
    } catch {
      return {
        sufficient: true,
        affirmation: "Thank you — that is written down and kept private.",
        nextQuestion: null,
        safety: "none",
      };
    }
  });

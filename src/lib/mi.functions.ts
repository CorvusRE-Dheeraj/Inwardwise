import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildMiSystemPrompt, MI_MAX_ROUNDS } from "@/lib/mi-filter";

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(6000),
});

const InputSchema = z.object({
  targetQuestion: z.string().min(5).max(2000),
  context: z.string().max(4000).optional(),
  round: z.number().int().min(1).max(MI_MAX_ROUNDS),
  transcript: z.array(TurnSchema).min(1).max(40),
});

export interface MiTurnResult {
  reply: string;
  satisfied: boolean;
  capturedAnswer: string;
  resistance: "none" | "ambivalent" | "resisting";
  crisis: boolean;
  roundsLeft: number;
}

export const miInterviewTurn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<MiTurnResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("The interviewer is not configured (missing LOVABLE_API_KEY).");

    const system = buildMiSystemPrompt({
      targetQuestion: data.targetQuestion,
      context: data.context,
    });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...data.transcript,
          {
            role: "system",
            content:
              data.round >= MI_MAX_ROUNDS
                ? "This is the final round. Close warmly with a validating summary, ask no further question, and set satisfied to true if anything usable was said."
                : `Round ${data.round} of ${MI_MAX_ROUNDS}. Reply with JSON only.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) {
        throw new Error("Too many requests just now. Give it a moment and try again.");
      }
      if (res.status === 402) {
        throw new Error(
          "The interviewer is temporarily offline: the workspace AI balance is empty. Add credits in Settings → Plans & credit usage, then try again.",
        );
      }
      throw new Error(`Interviewer unreachable (${res.status}). ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "{}";

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    } catch {
      parsed = { reply: raw };
    }

    const resistance = parsed["resistance"];
    return {
      reply: typeof parsed["reply"] === "string" && parsed["reply"].trim()
        ? (parsed["reply"] as string).trim()
        : "Thank you for that. What else comes to mind when you sit with it?",
      satisfied: parsed["satisfied"] === true || data.round >= MI_MAX_ROUNDS,
      capturedAnswer:
        typeof parsed["captured_answer"] === "string" ? (parsed["captured_answer"] as string) : "",
      resistance:
        resistance === "ambivalent" || resistance === "resisting" ? resistance : "none",
      crisis: parsed["crisis"] === true,
      roundsLeft: Math.max(0, MI_MAX_ROUNDS - data.round),
    };
  });

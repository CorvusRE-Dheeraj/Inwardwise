import { createServerFn } from "@tanstack/react-start";
import { MiTurnInputSchema, runMiTurn, type MiTurnResult } from "@/lib/mi-turn";

export type { MiTurnResult };

export const miInterviewTurn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => MiTurnInputSchema.parse(data))
  .handler(async ({ data }): Promise<MiTurnResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("The interviewer is not configured (missing LOVABLE_API_KEY).");
    const result = await runMiTurn(data, apiKey);
    const { recordAiExchange } = await import("@/lib/ai-memory.server");
    const lastUser = [...data.transcript].reverse().find((t) => t.role === "user");
    void recordAiExchange({
      surface: "mi_interview",
      model: "google/gemini-2.5-flash",
      prompt: lastUser?.content ?? data.targetQuestion,
      response: result.reply,
      metadata: {
        targetQuestion: data.targetQuestion,
        round: data.round,
        satisfied: result.satisfied,
        resistance: result.resistance,
        crisis: result.crisis,
      },
    });
    return result;
  });

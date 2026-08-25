import { createServerFn } from "@tanstack/react-start";
import { MiTurnInputSchema, runMiTurn, type MiTurnResult } from "@/lib/mi-turn";

export type { MiTurnResult };

export const miInterviewTurn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => MiTurnInputSchema.parse(data))
  .handler(async ({ data }): Promise<MiTurnResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("The interviewer is not configured (missing LOVABLE_API_KEY).");
    return runMiTurn(data, apiKey);
  });

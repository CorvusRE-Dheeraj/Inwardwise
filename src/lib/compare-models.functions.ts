import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LiveComparison = {
  wiseOwl: string;
  inwardWise: string;
  divergence: string;
};

const PROMPT = `You compare two ways of answering the same difficult personal decision.

MODEL A — "Wise Owl" (public knowledge filter): answers from conventional wisdom, best practice,
majority behaviour and internet consensus. Sensible, fast, usually safe. It answers the question
exactly as it was asked and delivers a recommendation.

MODEL B — "InwardWise Decision" (OOOI framework): Situation -> Objective -> Solutions ->
Remove Bias & Fear -> Abstract the Objective -> Define the Boundary -> Work Out-In. It does not
answer the question as asked. It exposes the pseudo objective, strips fear, ego and social
conditioning, abstracts the objective upward, widens the decision boundary, then works inward to
options. It never issues a verdict; the person remains the judge.

Reply with JSON only, no markdown fences:
{"wiseOwl":"...","inwardWise":"...","divergence":"..."}

wiseOwl: 2-3 sentences, the conventional answer.
inwardWise: 3-5 sentences naming the real objective and the wider boundary.
divergence: 1-2 sentences on why the two conclusions differ.
Calm, plain English. No bullet points. Never diagnose or give medical or legal instructions.`;

export const compareDecisionModels = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ decision: z.string().trim().min(15).max(1200) }).parse(data),
  )
  .handler(async ({ data }): Promise<LiveComparison> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("The comparison service is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: PROMPT },
          { role: "user", content: data.decision },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[compare] gateway failed [${res.status}]: ${body}`);
      if (res.status === 429) throw new Error("Too many requests just now. Try again shortly.");
      if (res.status === 402)
        throw new Error("The comparison service has run out of credit for now.");
      throw new Error("The comparison could not be produced. Please try again.");
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("The comparison came back unreadable.");

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<LiveComparison>;
    return {
      wiseOwl: String(parsed.wiseOwl ?? "").trim(),
      inwardWise: String(parsed.inwardWise ?? "").trim(),
      divergence: String(parsed.divergence ?? "").trim(),
    };
  });

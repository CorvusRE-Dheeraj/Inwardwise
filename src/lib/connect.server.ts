import { classifyPrompt, readingFor, type ConnectCategory } from "./connect-matching";

const RISK_TERMS = [
  "kill myself",
  "suicide",
  "end my life",
  "hurt myself",
  "self harm",
  "self-harm",
  "want to die",
];

/** Code-level hook for future risk detection / escalation. */
export function riskFlagFor(text: string): string | null {
  const t = text.toLowerCase();
  return RISK_TERMS.some((term) => t.includes(term)) ? "crisis_language" : null;
}

export function categoryFor(text: string): ConnectCategory {
  return classifyPrompt(text);
}

export function fallbackReflection(category: ConnectCategory): string {
  const reading = readingFor(category);
  return `It sounds like this involves both uncertainty and a need to feel understood. Before deciding what to change, it may help to separate what you genuinely want from what the situation is making you feel you should want. ${reading.summary}`;
}

/**
 * Private reflection generated for the member alone. The prompt sent upstream
 * carries only the member's own words and a non-sensitive category tag — never
 * five-factor answers, contact details, or decision history.
 */
export async function generateReflection(
  promptText: string,
  category: ConnectCategory,
  selfBuilt = false,
): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return fallbackReflection(category);

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are InwardWise Connect. A member has described what is on their mind. Write one short private reflection of 55-85 words.

Rules:
- Be calm, human, non-judgemental. Recognise the experience before offering perspective.
- Separate what the person genuinely wants from what comparison or pressure makes them feel they should want, where relevant.
- End with one constructive, reversible next consideration — never an instruction, diagnosis, or promise.
- You are not therapy, medical care, legal advice, or emergency support. Do not imply otherwise.
- No headings, no lists, no quotation marks. Plain prose only.
${
  selfBuilt
    ? "This member has completed their own InwardWise Self build, so write to someone who already knows their own patterns: refer to the work they have already done on themselves in general terms only (you cannot see their answers), and point them back to their own Self for the specifics."
    : "This member has NOT completed their InwardWise Self build, so do not assume any self-knowledge. Lean on what is common in this situation for many people, and keep the perspective general and collective rather than personal."
}
Situation category: ${category}.`,
          },
          { role: "user", content: promptText },
        ],
      }),
    });
    if (!res.ok) return fallbackReflection(category);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = json.choices?.[0]?.message?.content?.trim();
    return reply && reply.length > 20 ? reply : fallbackReflection(category);
  } catch {
    return fallbackReflection(category);
  }
}

/**
 * Anonymous aggregate only. Returns null when there is not enough data —
 * statistics are never fabricated.
 */
export function aggregateInsight(sameCategoryCount: number, category: ConnectCategory): string | null {
  if (sameCategoryCount < 5) return null;
  return `${sameCategoryCount} other InwardWise members have described something in the same area — ${category.toLowerCase()}.`;
}

// Server-only reasoning for Connect AI: reads a prompt and picks the one
// pathway most likely to help right now. Never invents new pathways.

import { PATHWAYS, type PathwayId } from "@/lib/connect-pathways";

export type PathwaySuggestion = {
  pathwayId: PathwayId;
  why: string;
  firstStep: string;
};

const CATALOGUE = PATHWAYS.map((p) => `${p.id}: ${p.name} ${p.accent} — ${p.purpose}`).join("\n");

const FALLBACK: PathwaySuggestion = {
  pathwayId: "belonging",
  why: "From what you wrote, a small, low-pressure step towards other people looks like the most useful place to begin.",
  firstStep: "Open Connect Belonging and take the first small step it offers.",
};

function keywordFallback(text: string): PathwaySuggestion {
  const t = text.toLowerCase();
  if (/(decide|decision|choice|should i|choose|option)/.test(t))
    return {
      pathwayId: "decision",
      why: "What you wrote is really a choice you are carrying, so it is worth working through as a decision rather than as a feeling.",
      firstStep: "Start a decision and describe the situation in your own words.",
    };
  if (/(read|book|quiet|alone|think|reflect)/.test(t))
    return {
      pathwayId: "book",
      why: "You sound like you want something quiet to sit with rather than another conversation.",
      firstStep: "Open Connect Book and write what is going on to get a matched section.",
    };
  if (/(event|meet|group|people|network|out)/.test(t))
    return {
      pathwayId: "events",
      why: "Being physically around other people looks more useful to you right now than reading.",
      firstStep: "Open Connect Events and say where you are and when you are free.",
    };
  if (/(story|share|experience|tell)/.test(t))
    return {
      pathwayId: "share",
      why: "You have something of your own to put into words, and that helps you as much as it helps someone else.",
      firstStep: "Open Connect Share and record or write your experience anonymously.",
    };
  return FALLBACK;
}

export async function suggestPathway(prompt: string): Promise<PathwaySuggestion> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return keywordFallback(prompt);
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Connect AI. Someone writes how they feel or what they want. Choose exactly ONE pathway from the catalogue that best fits them right now.\n" +
              `Catalogue:\n${CATALOGUE}\n` +
              "Rules: never invent a pathway or an id outside the catalogue. Speak warmly and plainly, second person, no jargon, no headings, no lists. " +
              '"why" is one or two sentences saying why this fits what they wrote. "firstStep" is one short sentence naming the first useful thing to do there. ' +
              'Reply with JSON only: {"pathwayId":"<id>","why":"...","firstStep":"..."}',
          },
          { role: "user", content: prompt.slice(0, 3000) },
        ],
      }),
    });
    if (!res.ok) return keywordFallback(prompt);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = (json.choices?.[0]?.message?.content ?? "")
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(raw) as Partial<PathwaySuggestion>;
    const match = PATHWAYS.find((p) => p.id === parsed.pathwayId);
    if (!match || !parsed.why || !parsed.firstStep) return keywordFallback(prompt);
    return {
      pathwayId: match.id,
      why: String(parsed.why).slice(0, 600),
      firstStep: String(parsed.firstStep).slice(0, 300),
    };
  } catch {
    return keywordFallback(prompt);
  }
}

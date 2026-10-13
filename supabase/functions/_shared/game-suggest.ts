// Tentative AI suggestions for the Self Build games: a few words, or a few
// theme names. Only possibilities the member may reject; never diagnostic.

export type SuggestKind = "words" | "themes";

export const SUGGEST_KINDS: SuggestKind[] = ["words", "themes"];
export const SUGGEST_CONTEXT_MIN = 3;
export const SUGGEST_CONTEXT_MAX = 3000;

const LIMIT: Record<SuggestKind, number> = { words: 5, themes: 4 };

export function buildSuggestMessages(
  kind: SuggestKind,
  context: string,
): Array<{ role: "system" | "user"; content: string }> {
  const instruction =
    kind === "words"
      ? "Suggest up to 5 single words (feelings or descriptions) that might fit the person's experience. Neutral, gentle, never clinical, never diagnostic, never implying trauma or excusing harm."
      : "Suggest up to 4 short possible theme names (2-6 words each) that could group these life experiences. Tentative and neutral, never diagnostic.";
  return [
    {
      role: "system",
      content: `${instruction} These are only possibilities the person may reject. Reply with a JSON array of strings only.`,
    },
    { role: "user", content: context.slice(0, SUGGEST_CONTEXT_MAX) },
  ];
}

/** Turns the model's reply into a short, clean list, tolerating fences or a plain list. */
export function parseSuggestions(kind: SuggestKind, reply: string): string[] {
  const text = reply
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  let list: unknown;
  try {
    list = JSON.parse(text);
  } catch {
    list = text.split(/[\n,]/);
  }
  return (Array.isArray(list) ? list : [])
    .map((s) =>
      String(s)
        .replace(/^[-•"\s]+|["\s]+$/g, "")
        .slice(0, 60),
    )
    .filter(Boolean)
    .slice(0, LIMIT[kind]);
}

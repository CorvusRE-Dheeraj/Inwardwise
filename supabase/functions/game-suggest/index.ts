// Self Build games: tentative word or theme suggestions, only when the member
// asks. The text they send is used for this one request and never stored or
// logged.
//
// Secrets: AI_API_KEY (Google Gemini key). LOVABLE_API_KEY still works as a
// fallback. Optional: AI_BASE_URL, AI_MODEL. See ../_shared/ai.ts.
import { cors, json, requestUser, str } from "../_shared/http.ts";
import { aiConfig } from "../_shared/ai.ts";
import {
  SUGGEST_CONTEXT_MAX,
  SUGGEST_CONTEXT_MIN,
  SUGGEST_KINDS,
  buildSuggestMessages,
  parseSuggestions,
  type SuggestKind,
} from "../_shared/game-suggest.ts";

const TIMEOUT_MS = 20_000;
const UNAVAILABLE = "Suggestions aren't available right now.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await requestUser(req);
  if (!user) return json({ error: "Please sign in to get suggestions." }, 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = body?.kind as SuggestKind;
  const context = str(body?.context, SUGGEST_CONTEXT_MAX);
  if (!SUGGEST_KINDS.includes(kind) || context.length < SUGGEST_CONTEXT_MIN) {
    return json({ error: "Invalid request." }, 400);
  }

  const ai = aiConfig((name) => Deno.env.get(name));
  if (!ai.apiKey) {
    console.error("[game-suggest] no AI_API_KEY or LOVABLE_API_KEY set");
    return json({ error: UNAVAILABLE }, 500);
  }

  try {
    const res = await fetch(`${ai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ai.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ai.extraBody,
        model: ai.model,
        messages: buildSuggestMessages(kind, context),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[game-suggest] provider error:", res.status, await res.text().catch(() => ""));
      return json({ error: UNAVAILABLE }, 502);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json({ suggestions: parseSuggestions(kind, data.choices?.[0]?.message?.content ?? "") });
  } catch (err) {
    console.error("[game-suggest] request failed:", err instanceof Error ? err.name : err);
    return json({ error: UNAVAILABLE }, 502);
  }
});

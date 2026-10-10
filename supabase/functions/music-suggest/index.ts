// Connect Music: suggest songs for how someone feels, optionally tuned to
// their Self Journey.
//
// The Self profile is built in the browser from the member's unlocked answers
// (Reflecting is never included) and is used only for this one request: it is
// never stored or logged. When the AI is unavailable the member still gets
// well-known picks; the reason is logged as a code only, never their text.
//
// Secrets: AI_API_KEY (Google Gemini key). LOVABLE_API_KEY still works as a
// fallback. Optional: AI_BASE_URL, AI_MODEL. See ../_shared/ai.ts.
import {
  FEELINGS,
  MIND_MIN,
  MUSIC_MODE_IDS,
  type Feeling,
  type MusicMode,
} from "../_shared/music.ts";
import { suggestSongsFor } from "../_shared/songs.ts";
import { cors, json, requestUser, str } from "../_shared/http.ts";
import { aiConfig } from "../_shared/ai.ts";

// MUSIC_SELF_TOTAL_MAX (src/lib/music-self.ts) plus room for headings.
const SELF_PROFILE_MAX = 3200;
const NOTE_MAX = 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await requestUser(req);
  if (!user) return json({ error: "Please sign in to get song suggestions." }, 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);

  const mode = body.mode as MusicMode;
  if (!MUSIC_MODE_IDS.includes(mode)) return json({ error: "Invalid request." }, 400);
  const feeling = (body.feeling ?? null) as Feeling | null;
  if (feeling !== null && !FEELINGS.includes(feeling))
    return json({ error: "Invalid request." }, 400);
  const note = str(body.note, NOTE_MAX);
  const selfProfile = str(body.selfProfile, SELF_PROFILE_MAX) || null;

  // With their Self shared, the Self alone is enough. Without it, a feeling
  // and a short note are needed.
  if (!selfProfile && !feeling) return json({ error: "Choose how you are feeling first." }, 400);
  if (!selfProfile && note.length < MIND_MIN) {
    return json({ error: "Please write a little more, a sentence is enough." }, 400);
  }

  const ai = aiConfig((name) => Deno.env.get(name));
  const result = await suggestSongsFor(mode, feeling, note, selfProfile, {
    ...ai,
    // Where the request went and the provider's own error; never the key or
    // the member's text.
    onFallback: (reason, detail) =>
      console.warn(
        "[music-suggest] fallback picks:",
        reason,
        `(${URL.canParse(ai.baseUrl) ? new URL(ai.baseUrl).host : "invalid AI_BASE_URL"}, ${ai.model})`,
        detail ?? "",
      ),
  });

  return json({ ...result, usedSelf: !!selfProfile && result.source === "ai" });
});

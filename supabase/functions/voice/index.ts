// Voice for the signed-in pages: text-to-speech and speech-to-text.
//
// - JSON body { text, voice? }: returns MP3 audio of the text.
// - multipart/form-data with an "audio" file: returns { text }, the transcript.
//
// Recordings and text are passed straight to the provider and never stored.
//
// Secrets: VOICE_API_KEY (OpenAI key). LOVABLE_API_KEY still works as a
// fallback. Optional: VOICE_BASE_URL. See ../_shared/voice.ts.
import { cors, json, requestUser, str } from "../_shared/http.ts";
import {
  MIN_RECORDING_BYTES,
  TTS_MAX_CHARS,
  audioExtension,
  voiceConfig,
} from "../_shared/voice.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await requestUser(req);
  if (!user) return json({ error: "Please sign in to use voice." }, 401);

  const voice = voiceConfig((name) => Deno.env.get(name));
  if (!voice.apiKey) {
    console.error("[voice] no VOICE_API_KEY or LOVABLE_API_KEY set");
    return json({ error: "Voice is not available right now." }, 500);
  }

  const type = req.headers.get("content-type") ?? "";
  return type.startsWith("multipart/form-data") ? transcribe(req, voice) : speak(req, voice);
});

async function speak(req: Request, voice: ReturnType<typeof voiceConfig>): Promise<Response> {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const text = str(body?.text, TTS_MAX_CHARS);
  if (!text) return json({ error: "text is required" }, 400);

  const res = await fetch(`${voice.baseUrl}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${voice.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: voice.ttsModel,
      input: text,
      voice: str(body?.voice, 40) || "alloy",
      response_format: "mp3",
    }),
  });
  if (!res.ok) {
    console.error("[voice] tts failed:", res.status, await res.text().catch(() => ""));
    return json({ error: "Playback failed, please try again." }, 502);
  }
  return new Response(res.body, {
    headers: { ...cors, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}

async function transcribe(req: Request, voice: ReturnType<typeof voiceConfig>): Promise<Response> {
  const inbound = await req.formData().catch(() => null);
  const file = inbound?.get("audio");
  if (!(file instanceof File)) return json({ error: "Missing audio file" }, 400);
  if (file.size < MIN_RECORDING_BYTES) {
    return json({ error: "Recording is empty, please try again." }, 400);
  }

  const upstream = new FormData();
  upstream.append("model", voice.transcribeModel);
  upstream.append("file", file, `recording.${audioExtension(file.type || "")}`);

  const res = await fetch(`${voice.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${voice.apiKey}` },
    body: upstream,
  });
  if (!res.ok) {
    console.error("[voice] transcription failed:", res.status, await res.text().catch(() => ""));
    return json({ error: "Transcription failed, please try again." }, 502);
  }
  const data = (await res.json()) as { text?: string };
  return json({ text: data.text ?? "" });
}

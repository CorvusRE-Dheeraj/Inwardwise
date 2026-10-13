// Which provider the voice Edge Function calls for text-to-speech and
// transcription. Both speak OpenAI's audio API, so only the address, key and
// model names differ.
//
// - VOICE_API_KEY set: OpenAI directly (key from platform.openai.com).
// - Otherwise LOVABLE_API_KEY set: the Lovable AI Gateway (legacy).
// VOICE_BASE_URL overrides the address for either.

export type VoiceConfig = {
  apiKey: string | null;
  baseUrl: string;
  ttsModel: string;
  transcribeModel: string;
};

const OPENAI = "https://api.openai.com/v1";
const LOVABLE = "https://ai.gateway.lovable.dev/v1";

export function voiceConfig(env: (name: string) => string | undefined): VoiceConfig {
  const read = (name: string) => env(name)?.trim() || undefined;
  const openaiKey = read("VOICE_API_KEY");
  const lovableKey = read("LOVABLE_API_KEY");
  const baseUrl = (read("VOICE_BASE_URL") ?? (openaiKey || !lovableKey ? OPENAI : LOVABLE)).replace(
    /\/+$/,
    "",
  );
  // The gateway names models by provider ("openai/gpt-4o-mini-tts"); OpenAI
  // itself doesn't.
  const prefix = baseUrl.includes("ai.gateway.lovable.dev") ? "openai/" : "";
  return {
    apiKey: openaiKey ?? lovableKey ?? null,
    baseUrl,
    ttsModel: `${prefix}gpt-4o-mini-tts`,
    transcribeModel: `${prefix}gpt-4o-mini-transcribe`,
  };
}

/** File extension for a recording, from its real mime type, so the transcriber accepts it. */
export function audioExtension(mimeType: string): string {
  const mime = mimeType.split(";")[0];
  if (mime === "audio/mp4" || mime === "audio/x-m4a" || mime === "audio/aac") return "m4a";
  if (mime === "audio/mpeg") return "mp3";
  if (mime === "audio/wav" || mime === "audio/x-wav") return "wav";
  if (mime === "audio/ogg") return "ogg";
  return "webm";
}

/** Longest text sent for speech; the model has a per-request input limit. */
export const TTS_MAX_CHARS = 3500;
/** Recordings smaller than this are treated as empty. */
export const MIN_RECORDING_BYTES = 1024;

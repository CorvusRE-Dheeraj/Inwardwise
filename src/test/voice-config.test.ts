import { describe, expect, it } from "vitest";
import { audioExtension, voiceConfig } from "../../supabase/functions/_shared/voice.ts";

const envOf = (vars: Record<string, string>) => (name: string) => vars[name];

describe("voiceConfig", () => {
  it("uses OpenAI directly when VOICE_API_KEY is set", () => {
    expect(voiceConfig(envOf({ VOICE_API_KEY: "o", LOVABLE_API_KEY: "l" }))).toEqual({
      apiKey: "o",
      baseUrl: "https://api.openai.com/v1",
      ttsModel: "gpt-4o-mini-tts",
      transcribeModel: "gpt-4o-mini-transcribe",
    });
  });

  it("falls back to the Lovable gateway with provider-prefixed models", () => {
    expect(voiceConfig(envOf({ LOVABLE_API_KEY: "l" }))).toEqual({
      apiKey: "l",
      baseUrl: "https://ai.gateway.lovable.dev/v1",
      ttsModel: "openai/gpt-4o-mini-tts",
      transcribeModel: "openai/gpt-4o-mini-transcribe",
    });
  });

  it("has no key when neither secret is set", () => {
    expect(voiceConfig(envOf({})).apiKey).toBeNull();
  });

  it("honours VOICE_BASE_URL without a trailing slash", () => {
    const c = voiceConfig(
      envOf({ VOICE_API_KEY: "o", VOICE_BASE_URL: "https://proxy.example/v1/" }),
    );
    expect(c.baseUrl).toBe("https://proxy.example/v1");
    expect(c.ttsModel).toBe("gpt-4o-mini-tts");
  });
});

describe("audioExtension", () => {
  it.each([
    ["audio/webm;codecs=opus", "webm"],
    ["audio/mp4", "m4a"],
    ["audio/mpeg", "mp3"],
    ["audio/x-wav", "wav"],
    ["audio/ogg", "ogg"],
    ["", "webm"],
  ])("%s → %s", (mime, ext) => {
    expect(audioExtension(mime)).toBe(ext);
  });
});

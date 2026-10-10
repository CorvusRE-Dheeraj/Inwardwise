import { describe, expect, it } from "vitest";
import { aiConfig } from "../../supabase/functions/_shared/ai.ts";

const envOf = (vars: Record<string, string>) => (name: string) => vars[name];

describe("aiConfig", () => {
  it("uses Google Gemini directly when AI_API_KEY is set", () => {
    expect(aiConfig(envOf({ AI_API_KEY: "g" }))).toEqual({
      apiKey: "g",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-3.8-flash",
      extraBody: { reasoning_effort: "low" },
    });
  });

  it("prefers AI_API_KEY over a leftover LOVABLE_API_KEY", () => {
    const c = aiConfig(envOf({ AI_API_KEY: "g", LOVABLE_API_KEY: "l" }));
    expect(c.apiKey).toBe("g");
    expect(c.baseUrl).toContain("generativelanguage.googleapis.com");
  });

  it("falls back to the Lovable gateway with only LOVABLE_API_KEY", () => {
    expect(aiConfig(envOf({ LOVABLE_API_KEY: "l" }))).toEqual({
      apiKey: "l",
      baseUrl: "https://ai.gateway.lovable.dev/v1",
      model: "google/gemini-2.5-flash",
      extraBody: {},
    });
  });

  it("has no key when neither is set, so suggestions use the fallback picks", () => {
    expect(aiConfig(envOf({})).apiKey).toBeNull();
  });

  it("lets AI_BASE_URL and AI_MODEL override the defaults", () => {
    const c = aiConfig(
      envOf({ AI_API_KEY: "g", AI_MODEL: "gemini-2.5-pro", AI_BASE_URL: "https://x/v1" }),
    );
    expect(c).toMatchObject({ baseUrl: "https://x/v1", model: "gemini-2.5-pro" });
  });
});

describe("aiConfig recovers from common setup mistakes", () => {
  it("sends a Google key saved as LOVABLE_API_KEY to Google with Google's model name", () => {
    expect(aiConfig(envOf({ LOVABLE_API_KEY: "AIzaSyExample" }))).toEqual({
      apiKey: "AIzaSyExample",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-3.8-flash",
      extraBody: { reasoning_effort: "low" },
    });
  });

  it("drops the Lovable-style 'google/' prefix when calling Google", () => {
    const c = aiConfig(envOf({ AI_API_KEY: "g", AI_MODEL: "google/gemini-2.5-flash" }));
    expect(c.model).toBe("gemini-2.5-flash");
  });

  it.each([
    "https://generativelanguage.googleapis.com/v1beta/openai/",
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    " https://generativelanguage.googleapis.com/v1beta/openai ",
  ])("cleans a pasted base URL: %s", (url) => {
    expect(aiConfig(envOf({ AI_API_KEY: "g", AI_BASE_URL: url })).baseUrl).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai",
    );
  });
});

describe("aiConfig reasoning", () => {
  it("asks Gemini for light thinking so answers come back quickly", () => {
    expect(aiConfig(envOf({ AI_API_KEY: "g" })).extraBody).toEqual({ reasoning_effort: "low" });
  });
  it("sends nothing extra to the Lovable gateway", () => {
    expect(aiConfig(envOf({ LOVABLE_API_KEY: "l" })).extraBody).toEqual({});
  });
  it("can be turned off with AI_REASONING=none", () => {
    expect(aiConfig(envOf({ AI_API_KEY: "g", AI_REASONING: "none" })).extraBody).toEqual({});
  });
});

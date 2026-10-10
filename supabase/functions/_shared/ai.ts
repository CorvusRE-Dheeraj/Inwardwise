// Which AI provider the Edge Functions call. Both speak the OpenAI-compatible
// chat completions API, so only the address, key and model name differ.
//
// - AI_API_KEY set: Google Gemini directly (key from aistudio.google.com).
// - Otherwise LOVABLE_API_KEY set: the Lovable AI Gateway (legacy), unless
//   it actually holds a Google key.
// AI_BASE_URL and AI_MODEL override the defaults for either; AI_FALLBACK_MODEL
// is tried once when the main model is overloaded.

export type AiConfig = {
  apiKey: string | null;
  baseUrl: string;
  model: string;
  /** Provider-specific request fields. */
  extraBody: Record<string, unknown>;
  /** Backup model for one retry when the main one is overloaded (AI_FALLBACK_MODEL). */
  fallbackModel?: string;
};

// Google retires older models for new accounts (gemini-2.5-flash was, by
// 2026-10). If suggestions fall back with http_404 "no longer available",
// set the AI_MODEL secret to the model Google's message names; no redeploy needed.
const GEMINI = {
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  model: "gemini-3.8-flash",
};
const LOVABLE = {
  baseUrl: "https://ai.gateway.lovable.dev/v1",
  model: "google/gemini-2.5-flash",
};

export function aiConfig(env: (name: string) => string | undefined): AiConfig {
  const read = (name: string) => env(name)?.trim() || undefined;
  const geminiKey = read("AI_API_KEY");
  const lovableKey = read("LOVABLE_API_KEY");
  // Google API keys start with "AIza", so a Google key saved under the old
  // LOVABLE_API_KEY name still goes to Google.
  const googleKey = !!geminiKey || !lovableKey || lovableKey.startsWith("AIza");
  const defaults = googleKey ? GEMINI : LOVABLE;
  // Tolerate a pasted base URL with a trailing slash or the endpoint path.
  const baseUrl = (read("AI_BASE_URL") ?? defaults.baseUrl)
    .replace(/\/chat\/completions\/?$/, "")
    .replace(/\/+$/, "");
  // Pick the model name for where the request actually goes: Google wants
  // "gemini-2.5-flash", the Lovable gateway "google/gemini-2.5-flash".
  const google = baseUrl.includes("generativelanguage.googleapis.com");
  let model = read("AI_MODEL") ?? (google ? GEMINI.model : LOVABLE.model);
  if (google) model = model.replace(/^google\//, "");
  // Gemini "thinking" models can reason for a long time before answering;
  // picking songs doesn't need much. AI_REASONING overrides ("none" to omit).
  const reasoning = read("AI_REASONING") ?? (google ? "low" : undefined);
  const extraBody = reasoning && reasoning !== "none" ? { reasoning_effort: reasoning } : {};
  let fallbackModel = read("AI_FALLBACK_MODEL");
  if (google && fallbackModel) fallbackModel = fallbackModel.replace(/^google\//, "");
  return { apiKey: geminiKey ?? lovableKey ?? null, baseUrl, model, extraBody, fallbackModel };
}

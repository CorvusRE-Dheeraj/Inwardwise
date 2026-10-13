// The decision facilitator (Objective Solution Framework) for /decision.
// Streams the reply in the AI SDK's UI message format, which useChat reads.
//
// Each exchange is logged to ai_memory_log and counted in activity_events,
// as the old /api/chat route did.
//
// Secrets: AI_API_KEY (Google Gemini key). LOVABLE_API_KEY still works as a
// fallback. Optional: AI_BASE_URL, AI_MODEL. See ../_shared/ai.ts.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai@7.0.26";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@3.0.9";
import { cors, json, requestUser } from "../_shared/http.ts";
import { aiConfig } from "../_shared/ai.ts";
import { OOOI_SYSTEM_PROMPT } from "../_shared/ooi-system-prompt.ts";

const MAX_LOG_TEXT = 20000;
const clip = (s: string) => (s.length > MAX_LOG_TEXT ? `${s.slice(0, MAX_LOG_TEXT)}…` : s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await requestUser(req);
  if (!user) return json({ error: "Please sign in to continue." }, 401);

  const body = (await req.json().catch(() => null)) as { messages?: UIMessage[] } | null;
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages) return json({ error: "Invalid request." }, 400);

  const ai = aiConfig((name) => Deno.env.get(name));
  if (!ai.apiKey) {
    console.error("[decision-chat] no AI_API_KEY or LOVABLE_API_KEY set");
    return json({ error: "The facilitator is not available right now." }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  void admin
    .from("activity_events")
    .insert({
      user_id: user.id,
      event_type: "decision_request",
      metadata: { messageCount: messages.length },
    })
    .then(({ error }) => error && console.error("[decision-chat] activity log failed", error));

  const modelMessages = await convertToModelMessages(messages);
  const lastUser = [...modelMessages].reverse().find((m) => m.role === "user");
  const prompt =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : JSON.stringify(lastUser?.content ?? "");

  const provider = createOpenAICompatible({
    name: "inwardwise",
    baseURL: ai.baseUrl,
    apiKey: ai.apiKey,
  });
  const reasoningEffort = ai.extraBody.reasoning_effort as string | undefined;

  const result = streamText({
    model: provider(ai.model),
    system: OOOI_SYSTEM_PROMPT,
    messages: modelMessages,
    ...(reasoningEffort ? { providerOptions: { inwardwise: { reasoningEffort } } } : {}),
    onFinish: async ({ text }) => {
      const { error } = await admin.from("ai_memory_log").insert({
        surface: "decision_chat",
        user_id: user.id,
        model: ai.model,
        prompt: clip(prompt),
        response: clip(text),
        ok: true,
        metadata: { messageCount: messages.length },
      });
      if (error) console.error("[decision-chat] memory log failed", error);
    },
  });

  return result.toUIMessageStreamResponse({
    headers: cors,
    onError: (error) => {
      const err = error as { status?: number; statusCode?: number };
      const status = err?.status ?? err?.statusCode;
      console.error("[decision-chat] stream failed", status ?? "", error);
      if (status === 429) return "Rate limit exceeded, please try again shortly.";
      if (status === 402) return "AI credits exhausted for this workspace.";
      return "The facilitator ran into an issue. Please try again.";
    },
  });
});

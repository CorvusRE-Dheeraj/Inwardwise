import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { OOOI_SYSTEM_PROMPT } from "@/lib/ooi-system-prompt";

async function logDecisionRequest(request: Request, messageCount: number) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return;
    const token = auth.slice(7);
    if (token.split(".").length !== 3) return;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    const userId = userData.user?.id;
    if (!userId) return;

    await supabaseAdmin.from("activity_events").insert({
      user_id: userId,
      event_type: "decision_request",
      metadata: { messageCount },
    });
  } catch (err) {
    console.error("[chat] failed to log activity", err);
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const gateway = createLovableAiGatewayProvider(key);

        // Fire-and-forget activity log
        void logDecisionRequest(request, messages?.length ?? 0);

        const modelMessages = await convertToModelMessages(messages);
        const lastUser = [...modelMessages].reverse().find((m) => m.role === "user");
        const promptText =
          typeof lastUser?.content === "string"
            ? lastUser.content
            : JSON.stringify(lastUser?.content ?? "");
        const memoryUserId = await import("@/lib/ai-memory.server").then((m) =>
          m.userIdFromRequest(request),
        );

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: OOOI_SYSTEM_PROMPT,
          messages: modelMessages,
          onFinish: async ({ text }) => {
            const { recordAiExchange } = await import("@/lib/ai-memory.server");
            void recordAiExchange({
              surface: "decision_chat",
              userId: memoryUserId,
              model: "google/gemini-3-flash-preview",
              prompt: promptText,
              response: text,
              metadata: { messageCount: messages?.length ?? 0 },
            });
          },
        });

        return result.toUIMessageStreamResponse({
          onError: (error) => {
            const err = error as { status?: number; statusCode?: number };
            const status = err?.status ?? err?.statusCode;
            if (status === 429) return "Rate limit exceeded, please try again shortly.";
            if (status === 402) return "AI credits exhausted for this workspace.";
            return "The facilitator ran into an issue. Please try again.";
          },
        });
      },
    },
  },
});

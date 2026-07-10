import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { OOOI_SYSTEM_PROMPT } from "@/lib/ooi-system-prompt";

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

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: OOOI_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          onError: (error) => {
            const err = error as { status?: number; statusCode?: number };
            const status = err?.status ?? err?.statusCode;
            if (status === 429) return "Rate limit exceeded — please try again shortly.";
            if (status === 402) return "AI credits exhausted for this workspace.";
            return "The facilitator ran into an issue. Please try again.";
          },
        });
      },
    },
  },
});

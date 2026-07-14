// Text-to-speech via Lovable AI Gateway. Returns MP3 audio bytes.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tts")({
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

        const { text, voice } = (await request.json()) as { text?: string; voice?: string };
        if (!text || !text.trim()) {
          return new Response(JSON.stringify({ error: "text is required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        // Cap length defensively; the model has a per-request input limit.
        const input = text.trim().slice(0, 3500);

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input,
            voice: voice || "alloy",
            response_format: "mp3",
          }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          return new Response(
            JSON.stringify({ error: `TTS failed: ${res.status} ${body}` }),
            { status: res.status, headers: { "content-type": "application/json" } },
          );
        }

        return new Response(res.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});

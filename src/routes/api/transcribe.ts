// Speech-to-text via Lovable AI Gateway. Accepts multipart/form-data with an "audio" file field.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
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

        const inbound = await request.formData();
        const file = inbound.get("audio");
        if (!(file instanceof File)) {
          return new Response(JSON.stringify({ error: "Missing audio file" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        if (file.size < 1024) {
          return new Response(
            JSON.stringify({ error: "Recording is empty — please try again." }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }

        // Derive extension from the blob's real mime type so OpenAI's transcriber accepts it.
        const mime = (file.type || "").split(";")[0];
        const ext =
          mime === "audio/mp4" || mime === "audio/x-m4a" || mime === "audio/aac"
            ? "m4a"
            : mime === "audio/mpeg"
              ? "mp3"
              : mime === "audio/wav" || mime === "audio/x-wav"
                ? "wav"
                : mime === "audio/ogg"
                  ? "ogg"
                  : "webm";

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, `recording.${ext}`);

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          return new Response(
            JSON.stringify({ error: `Transcription failed: ${res.status} ${body}` }),
            { status: res.status, headers: { "content-type": "application/json" } },
          );
        }

        const data = (await res.json()) as { text?: string };
        return new Response(JSON.stringify({ text: data.text ?? "" }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

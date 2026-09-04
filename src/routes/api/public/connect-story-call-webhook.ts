import { createFileRoute } from "@tanstack/react-router";

type VapiPayload = {
  message?: {
    type?: string;
    call?: { id?: string };
    transcript?: string;
    artifact?: { transcript?: string };
  };
};

/**
 * Vapi posts the end-of-call report here. The spoken story is saved as a
 * pending, anonymous story, a moderator still reviews it before it appears.
 */
async function handle(request: Request) {
  const cronSecret = process.env["MEDITATION_CRON_SECRET"];
  const provided =
    request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("token");
  if (!cronSecret || provided !== cronSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = (await request.json().catch(() => ({}))) as VapiPayload;
  const msg = payload.message;
  if (msg?.type !== "end-of-call-report") return Response.json({ ignored: true });

  const callId = msg.call?.id;
  const transcript = (msg.artifact?.transcript ?? msg.transcript ?? "").trim();
  if (!callId) return Response.json({ ignored: true });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("connect_story_calls")
    .select("id, user_id, category")
    .eq("provider_call_id", callId)
    .maybeSingle();
  if (!row) return Response.json({ ignored: true });

  if (transcript.length > 40) {
    await supabaseAdmin.from("connect_stories").insert({
      owner_user_id: row.user_id,
      pseudonym: "Anonymous Member",
      category: row.category,
      situation: transcript.slice(0, 8000),
      moderation_status: "pending",
      is_published: false,
    });
  }

  await supabaseAdmin
    .from("connect_story_calls")
    .update({ status: transcript.length > 40 ? "completed" : "no_story" })
    .eq("id", row.id);

  return Response.json({ ok: true });
}

export const Route = createFileRoute("/api/public/connect-story-call-webhook")({
  server: { handlers: { POST: async ({ request }) => handle(request) } },
});

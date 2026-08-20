import { createFileRoute } from "@tanstack/react-router";

const QUESTIONS = [
  "What were you facing?",
  "What were you afraid of?",
  "What did you decide or do?",
  "What happened afterward?",
  "What did you learn?",
  "What would you tell someone going through this now?",
];

/**
 * Polled by the database scheduler. Places the automated story-recording call
 * for every Connect story call whose time has arrived.
 */
async function dispatch(request: Request) {
  const cronSecret = process.env["MEDITATION_CRON_SECRET"];
  const provided =
    request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("token");
  if (!cronSecret || provided !== cronSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  const vapiKey = process.env["VAPI_API_KEY"];
  const phoneNumberId = process.env["VAPI_PHONE_NUMBER_ID"];

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: due, error } = await supabaseAdmin
    .from("connect_story_calls")
    .select("id, user_id, phone_number, category")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    if (!vapiKey || !phoneNumberId) {
      await supabaseAdmin
        .from("connect_story_calls")
        .update({ status: "failed", last_error: "Calling is not configured." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const res = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: { Authorization: `Bearer ${vapiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId,
          customer: { number: row.phone_number },
          metadata: { storyCallId: row.id, userId: row.user_id, category: row.category },
          assistant: {
            name: "InwardWise Story Interviewer",
            firstMessage:
              "Hello, this is InwardWise. Whenever you are ready, I would like to hear your story in your own words. Nothing is published without review, and it stays anonymous.",
            firstMessageMode: "assistant-speaks-first",
            maxDurationSeconds: 900,
            silenceTimeoutSeconds: 60,
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.4,
              messages: [
                {
                  role: "system",
                  content:
                    `You are a warm, unhurried interviewer collecting an anonymous personal story for InwardWise Connect, in the area of ${row.category}. ` +
                    `Ask these questions one at a time, in order, and let the person finish before moving on:\n` +
                    QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n") +
                    `\nDo not give advice, diagnosis, or therapy. If the person sounds in crisis, gently encourage them to contact local emergency services and end the call. ` +
                    `When the questions are answered, thank them, explain the story will be reviewed before it appears, and end the call.`,
                },
              ],
            },
            voice: { provider: "vapi", voiceId: "Paige" },
            server: {
              url: `https://project--cd008caf-0d68-4a9e-9728-28d447940785.lovable.app/api/public/connect-story-call-webhook?token=${encodeURIComponent(cronSecret)}`,
            },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[connect-story] Vapi call failed [${res.status}]: ${body}`);
        await supabaseAdmin
          .from("connect_story_calls")
          .update({
            status: "failed",
            last_error: `Call failed (${res.status}).`,
            last_call_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        results.push({ id: row.id, status: "failed" });
        continue;
      }

      const json = (await res.json()) as { id?: string };
      await supabaseAdmin
        .from("connect_story_calls")
        .update({
          status: "called",
          provider_call_id: json.id ?? null,
          last_error: null,
          last_call_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "called" });
    } catch (err) {
      console.error("[connect-story] dispatch error", err);
      await supabaseAdmin
        .from("connect_story_calls")
        .update({ status: "failed", last_error: "Call could not be placed." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
    }
  }

  return Response.json({ processed: results.length, results });
}

export const Route = createFileRoute("/api/public/connect-story-dispatch")({
  server: {
    handlers: {
      GET: async ({ request }) => dispatch(request),
      POST: async ({ request }) => dispatch(request),
    },
  },
});

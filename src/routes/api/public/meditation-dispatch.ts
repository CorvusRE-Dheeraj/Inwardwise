import { createFileRoute } from "@tanstack/react-router";

/**
 * Polled every minute by the database scheduler. Places the Twilio voice call
 * for every meditation whose scheduled time has arrived.
 */
async function dispatch(request: Request) {
  const cronSecret = process.env["MEDITATION_CRON_SECRET"];
  const provided =
    request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("token");
  if (!cronSecret || provided !== cronSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_FROM_NUMBER"];

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: due, error } = await supabaseAdmin
    .from("meditation_settings")
    .select("id, user_id, phone_number, voice_enabled, call_token, scheduled_at")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const origin = new URL(request.url).origin;
  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    // Voice off, or no number: nothing to call — just close the schedule out.
    if (!row.voice_enabled || !row.phone_number) {
      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "cancelled", last_call_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, status: "cancelled" });
      continue;
    }

    if (!sid || !authToken || !from) {
      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "failed", last_error: "Calling is not configured." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const twimlUrl = `${origin}/api/public/meditation-twiml/${row.id}?token=${row.call_token}`;
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${sid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: row.phone_number,
            From: from,
            Url: twimlUrl,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        console.error(`[meditation] Twilio call failed [${res.status}]: ${body}`);
        let detail = `Call failed (${res.status}).`;
        try {
          const parsed = JSON.parse(body) as { message?: string };
          if (parsed.message) detail = parsed.message;
        } catch {
          /* keep the generic message */
        }
        await supabaseAdmin
          .from("meditation_settings")
          .update({
            status: "failed",
            last_error: detail.slice(0, 300),
            last_call_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        results.push({ id: row.id, status: "failed" });
        continue;
      }


      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "sent", last_error: null, last_call_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, status: "sent" });
    } catch (err) {
      console.error("[meditation] dispatch error", err);
      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "failed", last_error: "Call could not be placed." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
    }
  }

  return Response.json({ processed: results.length, results });
}

export const Route = createFileRoute("/api/public/meditation-dispatch")({
  server: {
    handlers: {
      GET: async ({ request }) => dispatch(request),
      POST: async ({ request }) => dispatch(request),
    },
  },
});

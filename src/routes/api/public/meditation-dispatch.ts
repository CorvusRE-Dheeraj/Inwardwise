import { createFileRoute } from "@tanstack/react-router";
import {
  CAPACITY_RETRY_MESSAGE,
  capacityRetryAt,
  isCapacityError,
} from "@/lib/call-capacity";

type Line = { set: string; text: string };

const SET_TITLES: Record<string, string> = {
  sorry: "I am sorry.",
  forgive: "Please forgive me.",
  thank: "Thank you.",
  love: "I love you.",
};

/** Turn the saved prayer lines into a single spoken meditation script. */
function buildScriptText(script: unknown, minutes: number): string {
  const lines = Array.isArray(script) ? (script as Line[]) : [];
  if (lines.length === 0) {
    return "Your meditation is not prepared yet. Please open the dashboard and save your settings again.";
  }
  const order = ["sorry", "forgive", "thank", "love"];
  const parts: string[] = [
    "Welcome to your meditation. Find a quiet place, and breathe slowly.",
  ];
  for (const key of order) {
    const items = lines.filter((l) => l.set === key);
    if (items.length === 0) continue;
    parts.push(SET_TITLES[key] ?? "");
    for (const l of items) parts.push(l.text);
  }
  parts.push("Rest now. Your meditation is complete.");
  return `This is a ${minutes} minute meditation.\n\n${parts.join("\n")}`;
}

/**
 * Polled every minute by the database scheduler. Places the Vapi voice call
 * for every meditation whose scheduled time has arrived.
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

  // First, settle calls already placed. Each scheduled session is called once;
  // unanswered calls are never automatically retried.
  if (vapiKey) {
    const { data: pending } = await supabaseAdmin
      .from("meditation_settings")
      .select("id, provider_call_id, call_attempts")
      .eq("status", "calling")
      .not("provider_call_id", "is", null)
      .limit(25);

    for (const row of pending ?? []) {
      try {
        const res = await fetch(`https://api.vapi.ai/call/${row.provider_call_id}`, {
          headers: { Authorization: `Bearer ${vapiKey}` },
        });
        if (!res.ok) continue;
        const call = (await res.json()) as { status?: string; endedReason?: string };
        if (call.status !== "ended") continue;

        const reason = (call.endedReason ?? "").toLowerCase();
        const unreached =
          reason.includes("voicemail") ||
          reason.includes("no-answer") ||
          reason.includes("noanswer") ||
          reason.includes("busy") ||
          reason.includes("customer-did-not-answer");

        if (unreached) {
          await supabaseAdmin
            .from("meditation_settings")
            .update({
              status: "failed",
              last_error: "The call was not answered. Reschedule when you can pick up.",
            })
            .eq("id", row.id);
        } else {
          await supabaseAdmin
            .from("meditation_settings")
            .update({ status: "sent", last_error: null })
            .eq("id", row.id);
        }
      } catch (err) {
        console.error("[meditation] status poll error", err);
      }
    }
  }

  const { data: due, error } = await supabaseAdmin
    .from("meditation_settings")
    .select(
      "id, user_id, phone_number, voice_enabled, scheduled_at, script, duration_minutes, call_attempts",
    )
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });



  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    // Claim this schedule before contacting the provider. Concurrent scheduler
    // runs cannot place a second call for the same scheduled session.
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("meditation_settings")
      .update({ status: "calling", last_error: null })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();

    if (claimError) console.error("[meditation] claim error", claimError);
    if (!claimed) continue;


    // Voice off, or no number: nothing to call, just close the schedule out.
    if (!row.voice_enabled || !row.phone_number) {
      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "cancelled", last_call_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, status: "cancelled" });
      continue;
    }

    if (!vapiKey || !phoneNumberId) {
      await supabaseAdmin
        .from("meditation_settings")
        .update({ status: "failed", last_error: "Calling is not configured." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const minutes = row.duration_minutes ?? 10;
      const scriptText = buildScriptText(row.script, minutes);

      const res = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vapiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumberId,
          customer: { number: row.phone_number },
          assistant: {
            name: "Meditation Guide",
            firstMessage:
              "Welcome to your meditation. Settle in, and breathe slowly with me.",
            firstMessageMode: "assistant-speaks-first",
            maxDurationSeconds: Math.min(3600, Math.max(300, minutes * 60 + 120)),
            silenceTimeoutSeconds: 120,
            // Answering machine: hang up rather than meditate to voicemail.
            voicemailDetection: {
              provider: "vapi",
              backoffPlan: { startAtSeconds: 3, frequencySeconds: 3, maxRetries: 6 },
            },
            // No voicemail message is left, so the assistant simply ends the call.
            voicemailMessage: "",
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.4,
              messages: [
                {
                  role: "system",
                  content:
                    `You are a calm meditation guide leading a ${minutes} minute Ho'oponopono meditation over the phone. ` +
                    `Speak the script below slowly, one line at a time, pausing between lines and letting the listener breathe. ` +
                    `Do not add commentary, do not ask questions, and do not rush. If the listener speaks, respond gently in one short sentence and continue. ` +
                    `When the script is finished, wish them rest and end the call.\n\nSCRIPT:\n${scriptText}`,
                },
              ],
            },
            voice: { provider: "vapi", voiceId: "Paige" },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[meditation] Vapi call failed [${res.status}]: ${body}`);

        // Provider capacity/daily limits are temporary: requeue instead of
        // burning the member's scheduled session.
        if (isCapacityError(res.status, body)) {
          await supabaseAdmin
            .from("meditation_settings")
            .update({
              status: "scheduled",
              scheduled_at: capacityRetryAt(),
              last_error: CAPACITY_RETRY_MESSAGE,
            })
            .eq("id", row.id);
          results.push({ id: row.id, status: "requeued" });
          continue;
        }

        let detail = `Call failed (${res.status}).`;
        try {
          const parsed = JSON.parse(body) as { message?: string | string[] };
          if (parsed.message) {
            detail = Array.isArray(parsed.message) ? parsed.message.join(" ") : parsed.message;
          }
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

      const placed = (await res.json().catch(() => null)) as { id?: string } | null;

      // The call is in flight: the next cron pass checks how it ended and
      // reschedules it when voicemail picked up instead of the person.
      await supabaseAdmin
        .from("meditation_settings")
        .update({
          status: placed?.id ? "calling" : "sent",
          provider_call_id: placed?.id ?? null,
          call_attempts: (row.call_attempts ?? 0) + 1,
          last_error: null,
          last_call_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: placed?.id ? "calling" : "sent" });
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

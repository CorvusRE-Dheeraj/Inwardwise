import { createFileRoute } from "@tanstack/react-router";
import { CAPACITY_RETRY_MESSAGE, capacityRetryAt, isCapacityError } from "@/lib/call-capacity";
import { nextRunAt, pickRandom } from "@/lib/mantra-schedule";

/**
 * Polled by the database scheduler. For every daily mantra call time that is
 * due, picks one or two of the member's saved mantras at random and places a
 * single Vapi call that repeats them aloud, then rolls the time to tomorrow.
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

  // Settle calls already in flight, then free the schedule for tomorrow.
  if (vapiKey) {
    const { data: pending } = await supabaseAdmin
      .from("mantra_schedules")
      .select("id, provider_call_id, time_of_day, timezone, is_active")
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
        const unreached = ["voicemail", "no-answer", "noanswer", "busy", "did-not-answer"].some(
          (r) => reason.includes(r),
        );
        await supabaseAdmin
          .from("mantra_schedules")
          .update({
            status: unreached ? "failed" : "sent",
            last_error: unreached
              ? "The last call was not answered. We will try again at the next time."
              : null,
            next_run_at: row.is_active
              ? nextRunAt(row.time_of_day as string, row.timezone as string).toISOString()
              : null,
          })
          .eq("id", row.id);
      } catch (err) {
        console.error("[mantra] status poll error", err);
      }
    }
  }

  const { data: due, error } = await supabaseAdmin
    .from("mantra_schedules")
    .select(
      "id, user_id, phone_number, repeats, mantras_per_call, time_of_day, timezone, call_attempts",
    )
    .eq("is_active", true)
    .in("status", ["scheduled", "sent", "failed"])
    .not("next_run_at", "is", null)
    .lte("next_run_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    const tomorrow = nextRunAt(row.time_of_day as string, row.timezone as string).toISOString();

    // Claim the slot before contacting the provider, so a second scheduler run
    // cannot place the same call twice.
    const { data: claimed } = await supabaseAdmin
      .from("mantra_schedules")
      .update({ status: "calling", last_error: null })
      .eq("id", row.id)
      .neq("status", "calling")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const { data: library } = await supabaseAdmin
      .from("mantra_library")
      .select("text")
      .eq("user_id", row.user_id);

    const chosen = pickRandom(
      (library ?? []).map((m) => String(m.text ?? "").slice(0, 400)).filter(Boolean),
      Math.min(2, Math.max(1, row.mantras_per_call ?? 1)),
    );

    if (chosen.length === 0) {
      await supabaseAdmin
        .from("mantra_schedules")
        .update({
          status: "failed",
          last_error: "No mantras saved yet, so there was nothing to say.",
          next_run_at: tomorrow,
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "no-mantras" });
      continue;
    }

    if (!vapiKey || !phoneNumberId) {
      await supabaseAdmin
        .from("mantra_schedules")
        .update({
          status: "failed",
          last_error: "Calling is not configured.",
          next_run_at: tomorrow,
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const repeats = Math.min(108, Math.max(1, row.repeats ?? 12));
      const totalLines = repeats * chosen.length;
      const seconds = Math.min(3600, Math.max(300, totalLines * 14 + 90));
      const lineBlock = chosen.map((t, i) => `LINE ${i + 1}:\n${t}`).join("\n\n");

      const res = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: { Authorization: `Bearer ${vapiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId,
          customer: { number: row.phone_number },
          assistant: {
            name: "Mantra Guide",
            firstMessage: "Welcome. Settle in, and we will repeat your line together.",
            firstMessageMode: "assistant-speaks-first",
            maxDurationSeconds: seconds,
            silenceTimeoutSeconds: 120,
            voicemailDetection: {
              provider: "vapi",
              backoffPlan: { startAtSeconds: 3, frequencySeconds: 3, maxRetries: 6 },
            },
            voicemailMessage: "",
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.2,
              messages: [
                {
                  role: "system",
                  content:
                    `You are a calm guide on a phone call. Repeat each line below aloud slowly, ` +
                    `exactly ${repeats} times each, in order, pausing a few seconds between repetitions. ` +
                    `Say nothing else: no commentary, no counting aloud, no questions. If the listener ` +
                    `speaks, answer in one short gentle sentence and continue. After the final ` +
                    `repetition, say "Rest now", and end the call.\n\n${lineBlock}`,
                },
              ],
            },
            voice: { provider: "vapi", voiceId: "Paige" },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[mantra] Vapi call failed [${res.status}]: ${body}`);
        if (isCapacityError(res.status, body)) {
          await supabaseAdmin
            .from("mantra_schedules")
            .update({
              status: "scheduled",
              next_run_at: capacityRetryAt(),
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
          .from("mantra_schedules")
          .update({
            status: "failed",
            last_error: detail.slice(0, 300),
            last_call_at: new Date().toISOString(),
            next_run_at: tomorrow,
          })
          .eq("id", row.id);
        results.push({ id: row.id, status: "failed" });
        continue;
      }

      const placed = (await res.json().catch(() => null)) as { id?: string } | null;
      await supabaseAdmin
        .from("mantra_schedules")
        .update({
          status: placed?.id ? "calling" : "sent",
          provider_call_id: placed?.id ?? null,
          call_attempts: (row.call_attempts ?? 0) + 1,
          last_error: null,
          last_call_at: new Date().toISOString(),
          next_run_at: placed?.id ? null : tomorrow,
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: placed?.id ? "calling" : "sent" });
    } catch (err) {
      console.error("[mantra] dispatch error", err);
      await supabaseAdmin
        .from("mantra_schedules")
        .update({
          status: "failed",
          last_error: "Call could not be placed.",
          next_run_at: tomorrow,
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
    }
  }

  return Response.json({ processed: results.length, results });
}

export const Route = createFileRoute("/api/public/mantra-dispatch")({
  server: {
    handlers: {
      GET: async ({ request }) => dispatch(request),
      POST: async ({ request }) => dispatch(request),
    },
  },
});

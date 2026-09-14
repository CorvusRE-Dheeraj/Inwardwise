import { createFileRoute } from "@tanstack/react-router";
import { CAPACITY_RETRY_MESSAGE, capacityRetryAt, isCapacityError } from "@/lib/call-capacity";

/**
 * Polled by the database scheduler. Places one Vapi call per due mantra
 * schedule, and the assistant repeats the member's own line aloud.
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

  // Settle calls already in flight. Each schedule is called exactly once.
  if (vapiKey) {
    const { data: pending } = await supabaseAdmin
      .from("mantra_calls")
      .select("id, provider_call_id")
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
          .from("mantra_calls")
          .update(
            unreached
              ? {
                  status: "failed",
                  last_error: "The call was not answered. Reschedule when you can pick up.",
                }
              : { status: "sent", last_error: null },
          )
          .eq("id", row.id);
      } catch (err) {
        console.error("[mantra] status poll error", err);
      }
    }
  }

  const { data: due, error } = await supabaseAdmin
    .from("mantra_calls")
    .select("id, phone_number, mantra_text, repeats, call_attempts")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    const { data: claimed } = await supabaseAdmin
      .from("mantra_calls")
      .update({ status: "calling", last_error: null })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    if (!row.phone_number) {
      await supabaseAdmin
        .from("mantra_calls")
        .update({ status: "cancelled", last_call_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, status: "cancelled" });
      continue;
    }

    if (!vapiKey || !phoneNumberId) {
      await supabaseAdmin
        .from("mantra_calls")
        .update({ status: "failed", last_error: "Calling is not configured." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const repeats = Math.min(108, Math.max(1, row.repeats ?? 12));
      const mantra = String(row.mantra_text ?? "").slice(0, 400);
      // Roughly twelve seconds per repetition, plus a little room to close.
      const seconds = Math.min(3600, Math.max(300, repeats * 14 + 90));

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
                    `You are a calm guide on a phone call. Repeat the following line aloud slowly, ` +
                    `exactly ${repeats} times, pausing a few seconds between repetitions. Say nothing else: ` +
                    `no commentary, no counting aloud, no questions. If the listener speaks, answer in one ` +
                    `short gentle sentence and continue. After the final repetition, say "Rest now", and end the call.` +
                    `\n\nLINE:\n${mantra}`,
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
            .from("mantra_calls")
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
          .from("mantra_calls")
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
      await supabaseAdmin
        .from("mantra_calls")
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
      console.error("[mantra] dispatch error", err);
      await supabaseAdmin
        .from("mantra_calls")
        .update({ status: "failed", last_error: "Call could not be placed." })
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

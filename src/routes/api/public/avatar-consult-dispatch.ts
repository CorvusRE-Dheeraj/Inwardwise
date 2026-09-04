import { createFileRoute } from "@tanstack/react-router";
import {
  CAPACITY_RETRY_MESSAGE,
  capacityRetryAt,
  isCapacityError,
} from "@/lib/call-capacity";

/**
 * Polled by the database scheduler. Places one Vapi voice call for every
 * InwardWise Self consultation whose scheduled time has arrived. A scheduled
 * consultation is called once; unanswered calls are never retried automatically.
 *
 * Privacy: the member's encrypted factor answers are never readable server-side,
 * so the call is a reflective consultation guided by the focus the member typed
 * themselves, nothing from the vault is sent to the provider.
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

  // Settle calls already placed.
  if (vapiKey) {
    const { data: pending } = await supabaseAdmin
      .from("avatar_consult_calls")
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
        const unreached =
          reason.includes("voicemail") ||
          reason.includes("no-answer") ||
          reason.includes("noanswer") ||
          reason.includes("busy") ||
          reason.includes("customer-did-not-answer");

        await supabaseAdmin
          .from("avatar_consult_calls")
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
        console.error("[consult] status poll error", err);
      }
    }
  }

  const { data: due, error } = await supabaseAdmin
    .from("avatar_consult_calls")
    .select("id, phone_number, focus, duration_minutes, call_attempts")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; status: string }> = [];

  for (const row of due ?? []) {
    // Claim the schedule so concurrent runs cannot place a second call.
    const { data: claimed } = await supabaseAdmin
      .from("avatar_consult_calls")
      .update({ status: "calling", last_error: null })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    if (!row.phone_number) {
      await supabaseAdmin
        .from("avatar_consult_calls")
        .update({ status: "cancelled" })
        .eq("id", row.id);
      results.push({ id: row.id, status: "cancelled" });
      continue;
    }

    if (!vapiKey || !phoneNumberId) {
      await supabaseAdmin
        .from("avatar_consult_calls")
        .update({ status: "failed", last_error: "Calling is not configured." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
      continue;
    }

    try {
      const minutes = row.duration_minutes ?? 10;
      const focus = (row.focus ?? "").trim();

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
            name: "InwardWise Self",
            firstMessage:
              "Hello. This is your scheduled InwardWise consultation. Before we begin: this is a reflection conversation, not medical, legal or emergency support. Whenever you are ready, tell me where your mind is right now.",
            firstMessageMode: "assistant-speaks-first",
            maxDurationSeconds: Math.min(3600, Math.max(300, minutes * 60 + 120)),
            silenceTimeoutSeconds: 30,
            voicemailDetection: {
              provider: "vapi",
              backoffPlan: { startAtSeconds: 3, frequencySeconds: 3, maxRetries: 6 },
            },
            voicemailMessage: "",
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.5,
              messages: [
                {
                  role: "system",
                  content:
                    `You are the caller's own InwardWise Self: a calm, private reflective voice that speaks in their interest and no one else's. ` +
                    `This is a ${minutes} minute spoken consultation. Ask one short question at a time, listen, reflect back what you hear, and help the person separate what they genuinely want from what pressure makes them feel they should want. ` +
                    `Never diagnose, never give medical, legal or financial advice, and never claim to be a professional. If the caller describes danger to themselves or others, gently tell them to contact local emergency services or a crisis line, and stay warm. ` +
                    `Do not use technical or framework jargon. Speak plainly and slowly. Close by naming one small, reversible next step and end the call.` +
                    (focus ? `\n\nThe caller asked to focus on: ${focus}` : ""),
                },
              ],
            },
            voice: { provider: "vapi", voiceId: "Paige" },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[consult] Vapi call failed [${res.status}]: ${body}`);

        if (isCapacityError(res.status, body)) {
          await supabaseAdmin
            .from("avatar_consult_calls")
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
          .from("avatar_consult_calls")
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
        .from("avatar_consult_calls")
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
      console.error("[consult] dispatch error", err);
      await supabaseAdmin
        .from("avatar_consult_calls")
        .update({ status: "failed", last_error: "Call could not be placed." })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
    }
  }

  return Response.json({ processed: results.length, results });
}

export const Route = createFileRoute("/api/public/avatar-consult-dispatch")({
  server: {
    handlers: {
      GET: async ({ request }) => dispatch(request),
      POST: async ({ request }) => dispatch(request),
    },
  },
});

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const E164 = /^\+[1-9]\d{7,14}$/;

const LineSchema = z.object({
  set: z.enum(["sorry", "forgive", "thank", "love"]),
  text: z.string().min(1).max(400),
});

const SendSchema = z.object({
  phoneNumber: z.string().trim().max(20),
  durationMinutes: z.number().int().min(5).max(45),
  scheduledAt: z.string().datetime().nullable(),
  script: z.array(LineSchema).min(1).max(120),
});

const SET_TITLES: Record<string, string> = {
  sorry: "I am sorry.",
  forgive: "Please forgive me.",
  thank: "Thank you.",
  love: "I love you.",
};

/** Compose the written draft of tonight's meditation, sized to the session. */
function buildDraft(
  script: Array<{ set: string; text: string }>,
  minutes: number,
  when: string | null,
): string {
  const parts: string[] = [
    when
      ? `Your ${minutes}-minute meditation for ${when}.`
      : `Your ${minutes}-minute meditation.`,
  ];
  for (const key of ["sorry", "forgive", "thank", "love"]) {
    const items = script.filter((l) => l.set === key);
    if (items.length === 0) continue;
    parts.push("", SET_TITLES[key] ?? "");
    for (const l of items) parts.push(`• ${l.text}`);
  }
  parts.push("", "Read each line slowly, and rest.");
  return parts.join("\n").slice(0, 1500);
}

export const sendMeditationText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SendSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +14155550123.");
    }

    // A meditation cannot be delivered twice at once: if a voice call is
    // queued for this same moment, the text has to move to another time.
    const { data: settings } = await context.supabase
      .from("meditation_settings")
      .select("status, voice_enabled, scheduled_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (
      settings?.status === "scheduled" &&
      settings.voice_enabled &&
      settings.scheduled_at &&
      data.scheduledAt &&
      new Date(settings.scheduled_at).getTime() === new Date(data.scheduledAt).getTime()
    ) {
      throw new Error(
        "A voice call is already scheduled for that exact time. Turn the call off, or pick a different time, then send the text.",
      );
    }

    const sid = process.env["TWILIO_ACCOUNT_SID"];
    const token = process.env["TWILIO_AUTH_TOKEN"];
    const from = process.env["TWILIO_FROM_NUMBER"];
    if (!sid || !token || !from) {
      throw new Error("Text messaging is not configured yet.");
    }

    const when = data.scheduledAt
      ? new Date(data.scheduledAt).toISOString().replace("T", " ").slice(0, 16) + " UTC"
      : null;

    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: buildDraft(data.script, data.durationMinutes, when),
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      let detail = `The text could not be sent (${res.status}).`;
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) detail = parsed.message;
      } catch {
        /* keep the generic message */
      }
      throw new Error(detail.slice(0, 300));
    }

    return { ok: true as const, phone };
  });

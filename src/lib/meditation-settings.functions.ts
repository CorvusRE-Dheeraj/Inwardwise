import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const E164 = /^\+[1-9]\d{7,14}$/;

const LineSchema = z.object({
  set: z.enum(["sorry", "forgive", "thank", "love"]),
  text: z.string().min(1).max(400),
});

const SaveSchema = z.object({
  phoneNumber: z.string().trim().max(20).nullable(),
  scheduledAt: z.string().datetime().nullable(),
  durationMinutes: z.number().int().min(5).max(45),
  voiceEnabled: z.boolean(),
  timezone: z.string().min(1).max(64),
  script: z.array(LineSchema).max(120).nullable(),
});

export type MeditationSettings = {
  phone_number: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  voice_enabled: boolean;
  timezone: string;
  status: string;
  last_error: string | null;
  last_call_at: string | null;
};

export const getMeditationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("meditation_settings")
      .select(
        "phone_number, scheduled_at, duration_minutes, voice_enabled, timezone, status, last_error, last_call_at",
      )
      .eq("user_id", context.userId)
      .maybeSingle();
    return { settings: (data as MeditationSettings | null) ?? null };
  });

export const saveMeditationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber?.replace(/[\s()-]/g, "") || null;
    if (phone && !E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +14155550123.");
    }
    if (data.scheduledAt && new Date(data.scheduledAt).getTime() <= Date.now()) {
      throw new Error("Choose a time in the future.");
    }
    if (data.voiceEnabled && data.scheduledAt && !phone) {
      throw new Error("A phone number is needed to receive the scheduled call.");
    }

    const row = {
      user_id: context.userId,
      phone_number: phone,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      voice_enabled: data.voiceEnabled,
      timezone: data.timezone,
      status: data.scheduledAt ? "scheduled" : "cancelled",
      last_error: null,
      ...(data.script ? { script: data.script } : {}),
    };

    const { error } = await context.supabase
      .from("meditation_settings")
      .upsert(row, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    return { ok: true as const, phone, scheduledAt: data.scheduledAt };
  });

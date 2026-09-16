import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const E164 = /^\+[1-9]\d{7,14}$/;

const SaveSchema = z.object({
  phoneNumber: z.string().trim().max(20),
  focus: z.string().trim().max(600),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(5).max(45),
  timezone: z.string().min(1).max(64),
});

export type ConsultCall = {
  id: string;
  phone_number: string | null;
  focus: string;
  scheduled_at: string | null;
  duration_minutes: number;
  timezone: string;
  status: string;
  last_error: string | null;
  last_call_at: string | null;
};

const COLUMNS =
  "id, phone_number, focus, scheduled_at, duration_minutes, timezone, status, last_error, last_call_at";

export const getConsultCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("avatar_consult_calls")
      .select(COLUMNS)
      .eq("user_id", context.userId)
      .maybeSingle();
    return { call: (data as ConsultCall | null) ?? null };
  });

export const scheduleConsultCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      throw new Error("Enter the phone number with its country code, e.g. +919876543210 for India or +14155550123 for the US.");
    }
    if (new Date(data.scheduledAt).getTime() <= Date.now()) {
      throw new Error("Choose a time in the future.");
    }

    const { error } = await context.supabase.from("avatar_consult_calls").upsert(
      {
        user_id: context.userId,
        phone_number: phone,
        focus: data.focus,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        timezone: data.timezone,
        status: "scheduled",
        provider_call_id: null,
        call_attempts: 0,
        last_error: null,
        last_call_at: null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const cancelConsultCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("avatar_consult_calls")
      .update({ status: "cancelled", scheduled_at: null, provider_call_id: null })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

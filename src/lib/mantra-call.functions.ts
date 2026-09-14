import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const E164 = /^\+[1-9]\d{7,14}$/;

const SaveSchema = z.object({
  phoneNumber: z.string().trim().max(20),
  mantraText: z.string().trim().min(3).max(400),
  repeats: z.number().int().min(1).max(108),
  scheduledAt: z.string().datetime(),
  timezone: z.string().min(1).max(64),
});

export type MantraCall = {
  id: string;
  phone_number: string | null;
  mantra_text: string;
  repeats: number;
  scheduled_at: string | null;
  timezone: string;
  status: string;
  last_error: string | null;
  last_call_at: string | null;
};

const COLUMNS =
  "id, phone_number, mantra_text, repeats, scheduled_at, timezone, status, last_error, last_call_at";

export const getMantraCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("mantra_calls")
      .select(COLUMNS)
      .eq("user_id", context.userId)
      .maybeSingle();
    return { call: (data as MantraCall | null) ?? null };
  });

export const scheduleMantraCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +14155550123.");
    }
    if (new Date(data.scheduledAt).getTime() <= Date.now()) {
      throw new Error("Choose a time in the future.");
    }

    const { error } = await context.supabase.from("mantra_calls").upsert(
      {
        user_id: context.userId,
        phone_number: phone,
        mantra_text: data.mantraText,
        repeats: data.repeats,
        scheduled_at: data.scheduledAt,
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

export const cancelMantraCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("mantra_calls")
      .update({ status: "cancelled", scheduled_at: null, provider_call_id: null })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

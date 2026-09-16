import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const E164 = /^\+[1-9]\d{7,14}$/;

const ScheduleSchema = z.object({
  phoneNumber: z.string().trim().max(20),
  category: z.string().min(2).max(80),
  scheduledAt: z.string().datetime(),
});

export type StoryCall = {
  id: string;
  phone_number: string;
  category: string;
  scheduled_at: string;
  status: string;
  last_error: string | null;
};

export const getStoryCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("connect_story_calls")
      .select("id, phone_number, category, scheduled_at, status, last_error")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { call: (data as StoryCall | null) ?? null };
  });

/** Book an automated call that walks the member through their story out loud. */
export const scheduleStoryCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ScheduleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      throw new Error("Enter the phone number with its country code, e.g. +919876543210 for India or +14155550123 for the US.");
    }
    if (new Date(data.scheduledAt).getTime() <= Date.now()) {
      throw new Error("Choose a time in the future.");
    }

    // One meditation and one story call cannot ring at the same moment.
    const { data: med } = await context.supabase
      .from("meditation_settings")
      .select("status, voice_enabled, scheduled_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (
      med?.status === "scheduled" &&
      med.voice_enabled &&
      med.scheduled_at &&
      new Date(med.scheduled_at).getTime() === new Date(data.scheduledAt).getTime()
    ) {
      throw new Error(
        "A meditation call is already scheduled for that exact time. Pick a different time for your story call.",
      );
    }

    await context.supabase
      .from("connect_story_calls")
      .update({ status: "cancelled" })
      .eq("user_id", context.userId)
      .eq("status", "scheduled");

    const { error } = await context.supabase.from("connect_story_calls").insert({
      user_id: context.userId,
      phone_number: phone,
      category: data.category,
      scheduled_at: data.scheduledAt,
      status: "scheduled",
    });
    if (error) throw new Error(error.message);

    return { ok: true as const, phone, scheduledAt: data.scheduledAt };
  });

export const cancelStoryCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("connect_story_calls")
      .update({ status: "cancelled" })
      .eq("user_id", context.userId)
      .eq("status", "scheduled");
    return { ok: true as const };
  });

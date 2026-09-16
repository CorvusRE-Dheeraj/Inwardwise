import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TIME_PATTERN, nextRunAt } from "@/lib/mantra-schedule";

const E164 = /^\+[1-9]\d{7,14}$/;

export type MantraItem = { id: string; text: string };

export type MantraSchedule = {
  id: string;
  phone_number: string;
  time_of_day: string;
  timezone: string;
  repeats: number;
  mantras_per_call: number;
  is_active: boolean;
  next_run_at: string | null;
  status: string;
  last_error: string | null;
  last_call_at: string | null;
};

const SCHEDULE_COLUMNS =
  "id, phone_number, time_of_day, timezone, repeats, mantras_per_call, is_active, next_run_at, status, last_error, last_call_at";

/* ---------------------------------- library --------------------------------- */

export const listMantras = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("mantra_library")
      .select("id, text")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    return { mantras: (data ?? []) as MantraItem[] };
  });

export const saveMantra = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ id: z.string().uuid().nullable(), text: z.string().trim().min(3).max(400) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase
        .from("mantra_library")
        .update({ text: data.text })
        .eq("id", data.id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { count } = await context.supabase
      .from("mantra_library")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if ((count ?? 0) >= 50) throw new Error("You can keep up to 50 mantras.");
    const { data: row, error } = await context.supabase
      .from("mantra_library")
      .insert({ user_id: context.userId, text: data.text })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteMantra = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mantra_library")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------------- schedules -------------------------------- */

export const listMantraSchedules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("mantra_schedules")
      .select(SCHEDULE_COLUMNS)
      .eq("user_id", context.userId)
      .order("time_of_day", { ascending: true });
    return { schedules: (data ?? []) as MantraSchedule[] };
  });

const ScheduleSchema = z.object({
  phoneNumber: z.string().trim().max(20),
  timeOfDay: z.string().trim().regex(TIME_PATTERN, "Choose a valid time of day."),
  timezone: z.string().min(1).max(64),
  repeats: z.number().int().min(1).max(108),
  mantrasPerCall: z.number().int().min(1).max(2),
});

export const addMantraSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ScheduleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const phone = data.phoneNumber.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +44 7700 900123.");
    }
    const { count } = await context.supabase
      .from("mantra_schedules")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if ((count ?? 0) >= 12) throw new Error("You can keep up to 12 call times a day.");

    const { error } = await context.supabase.from("mantra_schedules").insert({
      user_id: context.userId,
      phone_number: phone,
      time_of_day: data.timeOfDay,
      timezone: data.timezone,
      repeats: data.repeats,
      mantras_per_call: data.mantrasPerCall,
      is_active: true,
      status: "scheduled",
      next_run_at: nextRunAt(data.timeOfDay, data.timezone).toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setMantraScheduleActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("mantra_schedules")
      .select("time_of_day, timezone")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row) throw new Error("That call time no longer exists.");
    const { error } = await context.supabase
      .from("mantra_schedules")
      .update({
        is_active: data.active,
        status: data.active ? "scheduled" : "paused",
        last_error: null,
        next_run_at: data.active
          ? nextRunAt(row.time_of_day as string, row.timezone as string).toISOString()
          : null,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteMantraSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mantra_schedules")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

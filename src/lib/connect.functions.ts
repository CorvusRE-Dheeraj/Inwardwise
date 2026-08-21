import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  aggregateInsight,
  categoryFor,
  generateReflection,
  riskFlagFor,
} from "./connect.server";
import {
  activitiesFor,
  bookContentFor,
  rankStories,
  readingFor,
  supportOptionsFor,
} from "./connect-matching";

const promptSchema = z.object({ prompt: z.string().trim().min(8).max(4000) });

export const analyzeConnectPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => promptSchema.parse(data))
  .handler(async ({ data, context }) => {
    const category = categoryFor(data.prompt);
    const risk = riskFlagFor(data.prompt);

    const { data: promptRow, error: promptError } = await context.supabase
      .from("connect_prompts")
      .insert({
        user_id: context.userId,
        prompt_text: data.prompt,
        category,
        status: "analyzed",
        risk_flag: risk,
      })
      .select("id")
      .single();
    if (promptError) throw new Error(promptError.message);

    const [{ count }, { data: storyRows }, { data: groupRows }, { data: factorRows }] =
      await Promise.all([
      context.supabase
        .from("connect_prompts")
        .select("id", { count: "exact", head: true })
        .eq("category", category)
        .neq("user_id", context.userId),
      context.supabase
        .from("connect_stories")
        .select("id, pseudonym, category, situation, fear, action_taken, outcome, lesson, advice, audio_url")
        .eq("is_published", true)
        .eq("moderation_status", "approved")
        .limit(24),
      context.supabase
        .from("connect_groups")
        .select("id, title, category, description, status, max_members, starts_at")
        .eq("moderation_status", "approved")
        .limit(12),
      context.supabase
        .from("avatar_dimensions")
        .select("dimension_number, progress_pct")
        .eq("user_id", context.userId),
    ]);

    // Two Connect paths: a member who has completed their Self build gets the
    // personal path; everyone else gets the collective path (others' results,
    // book content and reviewed stories from others).
    const completedFactors = (factorRows ?? []).filter((f) => (f.progress_pct ?? 0) >= 100).length;
    const selfBuilt = completedFactors >= 5;
    const path = selfBuilt ? ("self" as const) : ("community" as const);

    const reflection = await generateReflection(data.prompt, category, selfBuilt);
    const aggregate = aggregateInsight(count ?? 0, category);
    const reading = readingFor(category);

    await context.supabase.from("connect_insights").insert({
      prompt_id: promptRow.id,
      user_id: context.userId,
      reflection,
      aggregate_insight: aggregate,
      reading_title: reading.title,
      reading_body: reading.body,
    });

    const stories = rankStories(storyRows ?? [], category).slice(0, selfBuilt ? 4 : 8);
    const groups = (groupRows ?? []).filter((g) => g.category === category);

    return {
      promptId: promptRow.id,
      path,
      selfBuilt,
      completedFactors,
      book: selfBuilt ? null : bookContentFor(category),
      category,
      riskFlag: risk,
      reflection,
      aggregate,
      reading,
      stories,
      groups,
      support: supportOptionsFor(category),
      activities: activitiesFor(category),
    };
  });

const storySchema = z.object({
  category: z.string().min(2).max(80),
  situation: z.string().trim().min(10).max(4000),
  fear: z.string().max(4000).optional(),
  action_taken: z.string().max(4000).optional(),
  outcome: z.string().max(4000).optional(),
  lesson: z.string().max(4000).optional(),
  advice: z.string().max(4000).optional(),
});

export const submitConnectStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => storySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("connect_stories").insert({
      owner_user_id: context.userId,
      pseudonym: "Anonymous Member",
      category: data.category,
      situation: data.situation,
      fear: data.fear ?? null,
      action_taken: data.action_taken ?? null,
      outcome: data.outcome ?? null,
      lesson: data.lesson ?? null,
      advice: data.advice ?? null,
      moderation_status: "pending",
      is_published: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const reportSchema = z.object({
  target_type: z.enum(["story", "group", "member", "content"]),
  target_id: z.string().uuid().optional(),
  reason: z.string().trim().min(4).max(2000),
});

export const reportConnectContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reportSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("connect_reports").insert({
      reporter_user_id: context.userId,
      target_type: data.target_type,
      target_id: data.target_id ?? null,
      reason: data.reason,
      status: "open",
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const waitlistSchema = z.object({ category: z.string().min(2).max(80) });

export const joinConnectGroupWaitlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => waitlistSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: group } = await context.supabase
      .from("connect_groups")
      .select("id")
      .eq("category", data.category)
      .eq("moderation_status", "approved")
      .limit(1)
      .maybeSingle();

    if (!group) return { ok: true as const, waitlisted: false };

    const { error } = await context.supabase
      .from("connect_group_members")
      .upsert(
        { group_id: group.id, user_id: context.userId, pseudonym: "Anonymous Member", status: "waitlist" },
        { onConflict: "group_id,user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const, waitlisted: true };
  });

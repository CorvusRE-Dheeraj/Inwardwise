import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * "People Like Me" scenario engine.
 *
 * Everything here reads admin-managed fictional characters and stores only the
 * signed-in member's own progress and answers. Merry and Alex are fictional:
 * nothing in this module ever links a scenario to a real person or member.
 */

export type CharacterCard = {
  slug: string;
  name: string;
  shortLabel: string;
  avatarKey: string;
  scenario: { slug: string; title: string; summary: string; sceneCount: number } | null;
  themes: string[];
  progress: { currentScene: number; status: string } | null;
};

export const listPeopleLikeMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CharacterCard[]> => {
    const { data: characters } = await context.supabase
      .from("characters")
      .select("id, slug, name, short_label, avatar_key, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const ids = (characters ?? []).map((c) => c.id);
    if (ids.length === 0) return [];

    const { data: scenarios } = await context.supabase
      .from("character_scenarios")
      .select("id, character_id, slug, title, summary, sort_order")
      .in("character_id", ids)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const scenarioIds = (scenarios ?? []).map((s) => s.id);

    const [{ data: themes }, { data: scenes }, { data: progress }] = await Promise.all([
      context.supabase
        .from("scenario_themes")
        .select("scenario_id, label, sort_order")
        .in("scenario_id", scenarioIds)
        .order("sort_order", { ascending: true }),
      context.supabase
        .from("scenario_scenes")
        .select("scenario_id, scene_number")
        .in("scenario_id", scenarioIds)
        .eq("is_active", true),
      context.supabase
        .from("user_scenario_interactions")
        .select("scenario_id, current_scene, status")
        .eq("user_id", context.userId),
    ]);

    return (characters ?? []).map((c) => {
      const scenario = (scenarios ?? []).find((s) => s.character_id === c.id) ?? null;
      const mine = scenario
        ? (progress ?? []).find((p) => p.scenario_id === scenario.id) ?? null
        : null;
      return {
        slug: c.slug,
        name: c.name,
        shortLabel: c.short_label,
        avatarKey: c.avatar_key,
        scenario: scenario
          ? {
              slug: scenario.slug,
              title: scenario.title,
              summary: scenario.summary,
              sceneCount: (scenes ?? []).filter((s) => s.scenario_id === scenario.id).length,
            }
          : null,
        themes: scenario
          ? (themes ?? []).filter((t) => t.scenario_id === scenario.id).map((t) => t.label)
          : [],
        progress: mine ? { currentScene: mine.current_scene, status: mine.status } : null,
      };
    });
  });

export type ScenarioScene = {
  id: string;
  number: number;
  body: string;
  characterState: string;
  environment: string | null;
  animation: string | null;
  narration: string | null;
  durationSeconds: number | null;
  questions: {
    id: string;
    prompt: string;
    allowFreeText: boolean;
    freeTextLabel: string;
    options: { id: string; label: string }[];
  }[];
};

export type ScenarioDetail = {
  character: { slug: string; name: string; shortLabel: string; avatarKey: string };
  scenario: { id: string; slug: string; title: string; summary: string };
  themes: string[];
  scenes: ScenarioScene[];
  interaction: {
    currentScene: number;
    status: string;
    familiarity: string | null;
    familiarityNote: string | null;
  } | null;
  responses: Record<string, { optionId: string | null; freeText: string | null }>;
};

const slugSchema = z.object({ slug: z.string().trim().min(1).max(120) });

export const getScenario = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data, context }): Promise<ScenarioDetail | null> => {
    const { data: character } = await context.supabase
      .from("characters")
      .select("id, slug, name, short_label, avatar_key")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!character) return null;

    const { data: scenario } = await context.supabase
      .from("character_scenarios")
      .select("id, slug, title, summary")
      .eq("character_id", character.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!scenario) return null;

    const [{ data: themes }, { data: scenes }, { data: interaction }, { data: responses }] =
      await Promise.all([
        context.supabase
          .from("scenario_themes")
          .select("label, sort_order")
          .eq("scenario_id", scenario.id)
          .order("sort_order", { ascending: true }),
        context.supabase
          .from("scenario_scenes")
          .select("id, scene_number, body")
          .eq("scenario_id", scenario.id)
          .eq("is_active", true)
          .order("scene_number", { ascending: true }),
        context.supabase
          .from("user_scenario_interactions")
          .select("current_scene, status, familiarity, familiarity_note")
          .eq("user_id", context.userId)
          .eq("scenario_id", scenario.id)
          .maybeSingle(),
        context.supabase
          .from("user_scenario_responses")
          .select("question_id, option_id, free_text")
          .eq("user_id", context.userId)
          .eq("scenario_id", scenario.id),
      ]);

    const sceneIds = (scenes ?? []).map((s) => s.id);
    const { data: questions } = await context.supabase
      .from("scenario_questions")
      .select("id, scene_id, prompt, allow_free_text, free_text_label, sort_order")
      .in("scene_id", sceneIds)
      .order("sort_order", { ascending: true });

    const { data: options } = await context.supabase
      .from("scenario_options")
      .select("id, question_id, label, sort_order")
      .in("question_id", (questions ?? []).map((q) => q.id))
      .order("sort_order", { ascending: true });

    return {
      character: {
        slug: character.slug,
        name: character.name,
        shortLabel: character.short_label,
        avatarKey: character.avatar_key,
      },
      scenario: {
        id: scenario.id,
        slug: scenario.slug,
        title: scenario.title,
        summary: scenario.summary,
      },
      themes: (themes ?? []).map((t) => t.label),
      scenes: (scenes ?? []).map((s) => ({
        id: s.id,
        number: s.scene_number,
        body: s.body,
        questions: (questions ?? [])
          .filter((q) => q.scene_id === s.id)
          .map((q) => ({
            id: q.id,
            prompt: q.prompt,
            allowFreeText: q.allow_free_text,
            freeTextLabel: q.free_text_label,
            options: (options ?? [])
              .filter((o) => o.question_id === q.id)
              .map((o) => ({ id: o.id, label: o.label })),
          })),
      })),
      interaction: interaction
        ? {
            currentScene: interaction.current_scene,
            status: interaction.status,
            familiarity: interaction.familiarity,
            familiarityNote: interaction.familiarity_note,
          }
        : null,
      responses: Object.fromEntries(
        (responses ?? []).map((r) => [
          r.question_id,
          { optionId: r.option_id, freeText: r.free_text },
        ]),
      ),
    };
  });

const progressSchema = z.object({
  scenarioId: z.string().uuid(),
  currentScene: z.number().int().min(1).max(200),
  status: z.enum(["in_progress", "paused", "completed", "exited"]),
});

export const saveScenarioProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => progressSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_scenario_interactions").upsert(
      {
        user_id: context.userId,
        scenario_id: data.scenarioId,
        current_scene: data.currentScene,
        status: data.status,
        completed_at: data.status === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,scenario_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const responseSchema = z.object({
  scenarioId: z.string().uuid(),
  questionId: z.string().uuid(),
  optionId: z.string().uuid().nullable().optional(),
  freeText: z.string().trim().max(2000).optional(),
});

export const saveScenarioResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => responseSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_scenario_responses").upsert(
      {
        user_id: context.userId,
        scenario_id: data.scenarioId,
        question_id: data.questionId,
        option_id: data.optionId ?? null,
        free_text: data.freeText?.length ? data.freeText : null,
      },
      { onConflict: "user_id,question_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const reflectionSchema = z.object({
  scenarioId: z.string().uuid(),
  familiarity: z.enum(["very_much", "somewhat", "a_little", "not_really", "not_sure"]),
  note: z.string().trim().max(2000).optional(),
  sceneCount: z.number().int().min(1).max(200),
});

export const saveScenarioReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reflectionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_scenario_interactions").upsert(
      {
        user_id: context.userId,
        scenario_id: data.scenarioId,
        current_scene: data.sceneCount,
        status: "completed",
        familiarity: data.familiarity,
        familiarity_note: data.note?.length ? data.note : null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,scenario_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

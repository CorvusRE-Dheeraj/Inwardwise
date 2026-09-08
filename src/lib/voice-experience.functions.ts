import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Specific experiences we invite people to record, so recordings stay useful to others. */
export const EXPERIENCE_PROMPTS = [
  "A decision you were afraid of, and what actually happened after you made it.",
  "A time your health forced you to change how you live.",
  "A conflict in your family that you found a way through.",
  "Work or money pressure that changed what you thought mattered.",
  "Something you were ashamed of that turned out to be useful.",
  "Advice you were given that you ignored, and later understood.",
];

const submitSchema = z.object({
  category: z.string().trim().min(2).max(80),
  promptTitle: z.string().trim().min(4).max(200),
  situation: z.string().trim().min(10).max(4000),
  lesson: z.string().trim().max(4000).optional(),
  /** Base64 (no data-url prefix) of the recorded audio. */
  audioBase64: z.string().min(100),
  audioType: z.string().max(60).default("audio/webm"),
  consent: z.literal(true),
});

export const submitVoiceExperience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bytes = Buffer.from(data.audioBase64, "base64");
    if (bytes.byteLength > 20 * 1024 * 1024) throw new Error("That recording is too long.");

    const ext = data.audioType.includes("mp4") ? "mp4" : data.audioType.includes("mpeg") ? "mp3" : "webm";
    const path = `${context.userId}/${crypto.randomUUID()}.${ext}`;

    const upload = await supabaseAdmin.storage
      .from("connect-audio")
      .upload(path, bytes, { contentType: data.audioType, upsert: false });
    if (upload.error) throw new Error(upload.error.message);

    const { error } = await context.supabase.from("connect_stories").insert({
      owner_user_id: context.userId,
      pseudonym: "Anonymous Member",
      category: data.category,
      situation: `${data.promptTitle}\n\n${data.situation}`,
      lesson: data.lesson ?? null,
      audio_url: path,
      moderation_status: "pending",
      is_published: false,
    });
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });

/** The person's own recordings, so they can see where each one stands. */
export const listMyVoiceExperiences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("connect_stories")
      .select("id, category, situation, moderation_status, is_published, created_at")
      .eq("owner_user_id", context.userId)
      .not("audio_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []) as Array<{
      id: string;
      category: string;
      situation: string;
      moderation_status: string;
      is_published: boolean;
      created_at: string;
    }>;
  });

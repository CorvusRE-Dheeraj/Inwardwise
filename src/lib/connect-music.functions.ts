import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  FEELINGS,
  MIND_MIN,
  MUSIC_MODE_IDS,
  SHARE_FROM_MAX,
  SHARE_MESSAGE_MAX,
  SONG_ARTIST_MAX,
  SONG_TITLE_MAX,
  SONG_URL_MAX,
  cleanSong,
  normalizeMusicUrl,
  sameSong,
  songShareUrl,
  type Song,
} from "@/lib/music";
import type { SongSuggestions } from "@/lib/connect-music.server";
import { MUSIC_SELF_TOTAL_MAX } from "@/lib/music-self";

// Songs live in connect_reflections, told apart by their context:
//   { pathway: "music", kind: "journal",  song }  → shown in the Journal
//   { pathway: "music", kind: "playlist", song }  → the member's own playlist
// Playlist rows are hidden from the Journal list.

const PLAYLIST_MAX = 100;

const SongSchema = z.object({
  title: z.string().trim().min(1).max(SONG_TITLE_MAX),
  artist: z.string().trim().max(SONG_ARTIST_MAX).default(""),
  url: z.string().trim().max(SONG_URL_MAX).nullable().optional(),
  why: z.string().trim().max(400).nullable().optional(),
});

function parseSong(input: z.infer<typeof SongSchema>): Song {
  if (input.url && !normalizeMusicUrl(input.url)) {
    throw new Error(
      "That link does not look right. Paste a full link, e.g. https://open.spotify.com/…",
    );
  }
  const song = cleanSong(input);
  if (!song) throw new Error("Add the song name first.");
  return song;
}

function songFromContext(context: unknown): Song | null {
  const song = (context as { song?: Song } | null)?.song;
  return song ? cleanSong(song) : null;
}

export type PlaylistItem = Song & { id: string; addedAt: string };

export const suggestSongs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mode: z.enum(MUSIC_MODE_IDS),
        feeling: z.enum(FEELINGS).nullable().optional(),
        note: z.string().trim().max(1000).default(""),
        /** Built in the browser from the member's unlocked Self Journey. Never stored. */
        selfProfile: z
          .string()
          .trim()
          .max(MUSIC_SELF_TOTAL_MAX + 200)
          .nullable()
          .optional(),
      })
      // With their Self shared, the Self alone is enough. Without it, a feeling
      // and a short note are needed.
      .refine((v) => !!v.selfProfile || !!v.feeling, {
        message: "Choose how you are feeling first.",
        path: ["feeling"],
      })
      .refine((v) => !!v.selfProfile || v.note.length >= MIND_MIN, {
        message: "Please write a little more, a sentence is enough.",
        path: ["note"],
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<SongSuggestions & { usedSelf: boolean }> => {
    const { suggestSongsFor } = await import("@/lib/connect-music.server");
    const selfProfile = data.selfProfile || null;
    const feeling = data.feeling ?? null;
    const result = await suggestSongsFor(data.mode, feeling, data.note, selfProfile);
    const usedSelf = !!selfProfile && result.source === "ai";
    const { recordAiExchange } = await import("@/lib/ai-memory.server");
    void recordAiExchange({
      surface: "connect_music_suggest",
      userId: context.userId,
      // The Self profile is private: only whether it was shared is logged, never its text.
      prompt: `[${data.mode}] ${feeling ?? "from Self"}: ${data.note}`,
      response: result.songs.map((s) => `${s.title} — ${s.artist}`).join("; "),
      metadata: { source: result.source, mode: data.mode, selfShared: !!selfProfile, usedSelf },
    });
    return { ...result, usedSelf };
  });

/* --------------------------------- playlist -------------------------------- */

export const listPlaylist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlaylistItem[]> => {
    const db = context.supabase;
    const { data } = await db
      .from("connect_reflections")
      .select("id, context, created_at")
      .eq("user_id", context.userId)
      .eq("context->>pathway", "music")
      .eq("context->>kind", "playlist")
      .order("created_at", { ascending: false })
      .limit(PLAYLIST_MAX);
    return (data ?? []).flatMap((r) => {
      const song = songFromContext(r.context);
      return song ? [{ ...song, id: r.id as string, addedAt: r.created_at as string }] : [];
    });
  });

export const addToPlaylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ song: SongSchema }).parse(d))
  .handler(async ({ context, data }): Promise<{ id: string; alreadyThere: boolean }> => {
    const db = context.supabase;
    const song = parseSong(data.song);
    const { data: rows } = await db
      .from("connect_reflections")
      .select("id, context")
      .eq("user_id", context.userId)
      .eq("context->>pathway", "music")
      .eq("context->>kind", "playlist")
      .limit(PLAYLIST_MAX);
    const existing = (rows ?? []).find((r) => {
      const s = songFromContext(r.context);
      return s && sameSong(s, song);
    });
    if (existing) {
      // Same song again: keep one row, but take the newer link if one was given.
      if (song.url) {
        await db
          .from("connect_reflections")
          .update({ context: { pathway: "music", kind: "playlist", song } })
          .eq("id", existing.id)
          .eq("user_id", context.userId);
      }
      return { id: existing.id, alreadyThere: true };
    }
    if ((rows ?? []).length >= PLAYLIST_MAX) {
      throw new Error(`Your playlist can hold up to ${PLAYLIST_MAX} songs. Remove one first.`);
    }
    const { data: row, error } = await db
      .from("connect_reflections")
      .insert({
        user_id: context.userId,
        source: "written",
        body: `${song.title}${song.artist ? ` — ${song.artist}` : ""}`,
        context: { pathway: "music", kind: "playlist", song },
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, alreadyThere: false };
  });

export const updatePlaylistLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ id: z.string().uuid(), url: z.string().trim().max(SONG_URL_MAX).nullable() })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<{ url: string | null }> => {
    const db = context.supabase;
    const url = data.url ? normalizeMusicUrl(data.url) : null;
    if (data.url && !url) {
      throw new Error("That link does not look right. Paste a full link, e.g. https://youtu.be/…");
    }
    const { data: row } = await db
      .from("connect_reflections")
      .select("context")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("context->>kind", "playlist")
      .maybeSingle();
    const song = row ? songFromContext(row.context) : null;
    if (!song) throw new Error("That song is no longer in your playlist.");
    const { error } = await db
      .from("connect_reflections")
      .update({ context: { pathway: "music", kind: "playlist", song: { ...song, url } } })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { url };
  });

export const removeFromPlaylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const db = context.supabase;
    const { error } = await db
      .from("connect_reflections")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("context->>kind", "playlist");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- share ---------------------------------- */

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Emails or texts a song link to someone. The link is built here from this
 * site's own address, so the delivery channels can never carry other links.
 */
export const sendSongToSomeone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        song: SongSchema,
        message: z.string().trim().max(SHARE_MESSAGE_MAX).default(""),
        from: z.string().trim().max(SHARE_FROM_MAX).default(""),
        email: z.string().trim().email().max(200).optional().or(z.literal("")),
        phone: z.string().trim().max(20).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ sent: string[]; note: string }> => {
    const song = parseSong(data.song);
    const phone = (data.phone ?? "").replace(/[\s()-]/g, "");
    if (phone && !E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +44 7700 900123.");
    }
    if (!data.email && !phone) throw new Error("Add their email address or phone number.");

    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const link = songShareUrl(getRequestUrl().origin, {
      title: song.title,
      artist: song.artist,
      url: song.url ?? null,
      message: data.message,
      from: data.from,
    });
    const who = data.from || "Someone";
    const label = `${song.title}${song.artist ? ` by ${song.artist}` : ""}`;
    const text =
      `${who} sent you a song through InwardWise: ${label}.` +
      (data.message ? `\n\n"${data.message}"` : "") +
      `\n\nListen here: ${link}`;

    const { sendConnectEmail, sendConnectSms } = await import("@/lib/connect-only.server");
    const sent: string[] = [];
    const notes: string[] = [];
    if (data.email) {
      const r = await sendConnectEmail(data.email, `${who} sent you a song`, text);
      if (r.ok) sent.push("email");
      else if (r.note) notes.push(r.note);
    }
    if (phone) {
      const r = await sendConnectSms(phone, text);
      if (r.ok) sent.push("text");
      else if (r.note) notes.push(r.note);
    }
    if (sent.length === 0) {
      throw new Error(
        `${notes.join(" ") || "It could not be sent just now."} You can still copy the link or share it on WhatsApp.`,
      );
    }
    return { sent, note: `Sent by ${sent.join(" and ")}.` };
  });

/* --------------------------------- journal --------------------------------- */

export const saveSongToJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        song: SongSchema,
        note: z.string().trim().max(2000).default(""),
        feeling: z.enum(FEELINGS).nullable().optional(),
        mode: z.enum(MUSIC_MODE_IDS).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<{ id: string; createdAt: string }> => {
    const db = context.supabase;
    const song = parseSong(data.song);
    const label = `${song.title}${song.artist ? ` — ${song.artist}` : ""}`;
    const { data: row, error } = await db
      .from("connect_reflections")
      .insert({
        user_id: context.userId,
        source: "written",
        body: data.note || `Song for this moment: ${label}`,
        context: {
          pathway: "music",
          kind: "journal",
          song,
          feeling: data.feeling ?? null,
          mode: data.mode ?? null,
        },
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, createdAt: row.created_at };
  });

/** The member's song for this moment: the last one they journaled. */
export const getCurrentSong = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<(Song & { savedAt: string }) | null> => {
    const db = context.supabase;
    const { data } = await db
      .from("connect_reflections")
      .select("context, created_at")
      .eq("user_id", context.userId)
      .eq("context->>pathway", "music")
      .eq("context->>kind", "journal")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const song = songFromContext(data.context);
    return song ? { ...song, savedAt: data.created_at } : null;
  });

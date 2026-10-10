// Connect Music data, from the browser.
//
// The site is static (GitHub Pages), so nothing here runs on our own server:
// - playlist, journal and "song for this moment" read and write
//   connect_reflections directly; row-level security limits each member to
//   their own rows;
// - suggestions and email/text sharing go through Supabase Edge Functions
//   (music-suggest, music-send), which hold the API keys.
//
// Songs live in connect_reflections, told apart by their context:
//   { pathway: "music", kind: "journal",  song }  → shown in the Journal
//   { pathway: "music", kind: "playlist", song }  → the member's own playlist
// Playlist rows are hidden from the Journal list.
import { supabase } from "@/integrations/supabase/client";
import {
  cleanSong,
  normalizeMusicUrl,
  sameSong,
  type Feeling,
  type MusicMode,
  type Song,
} from "@/lib/music";

const PLAYLIST_MAX = 100;

export type PlaylistItem = Song & { id: string; addedAt: string };
export type SongSuggestions = { songs: Song[]; source: "ai" | "picks"; usedSelf: boolean };
export type SendChannels = { email: boolean; text: boolean };

function songFromContext(context: unknown): Song | null {
  const song = (context as { song?: Song } | null)?.song;
  return song ? cleanSong(song) : null;
}

function parseSong(input: Song): Song {
  if (input.url && !normalizeMusicUrl(input.url)) {
    throw new Error(
      "That link does not look right. Paste a full link, e.g. https://open.spotify.com/…",
    );
  }
  const song = cleanSong(input);
  if (!song) throw new Error("Add the song name first.");
  return song;
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in again.");
  return data.user.id;
}

/** Calls an Edge Function, turning its { error } replies into readable messages. */
async function invoke<T>(
  name: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
  /** Gives up after this long, so the page never waits forever. */
  timeoutMs = 30_000,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body, timeout: timeoutMs });
  if (!error) return data as T;
  const context = (error as { context?: unknown }).context;
  if (context instanceof Response) {
    const payload = (await context.json().catch(() => null)) as { error?: string } | null;
    if (payload?.error) throw new Error(payload.error);
  }
  throw new Error(fallbackMessage);
}

/* ------------------------------- suggestions ------------------------------- */

export function suggestSongs(input: {
  mode: MusicMode;
  feeling: Feeling | null;
  note: string;
  /** Built in the browser from the member's unlocked Self Journey. Never stored. */
  selfProfile: string | null;
}): Promise<SongSuggestions> {
  return invoke<SongSuggestions>(
    "music-suggest",
    input,
    "Songs couldn't be suggested just now. Please try again in a moment.",
  );
}

/* --------------------------------- playlist -------------------------------- */

export async function listPlaylist(): Promise<PlaylistItem[]> {
  const uid = await userId();
  const { data, error } = await supabase
    .from("connect_reflections")
    .select("id, context, created_at")
    .eq("user_id", uid)
    .eq("context->>pathway", "music")
    .eq("context->>kind", "playlist")
    .order("created_at", { ascending: false })
    .limit(PLAYLIST_MAX);
  if (error) throw new Error("Your playlist couldn't be loaded just now.");
  return (data ?? []).flatMap((r) => {
    const song = songFromContext(r.context);
    return song ? [{ ...song, id: r.id, addedAt: r.created_at }] : [];
  });
}

export async function addToPlaylist(input: Song): Promise<{ id: string; alreadyThere: boolean }> {
  const uid = await userId();
  const song = parseSong(input);
  const { data: rows, error: listError } = await supabase
    .from("connect_reflections")
    .select("id, context")
    .eq("user_id", uid)
    .eq("context->>pathway", "music")
    .eq("context->>kind", "playlist")
    .limit(PLAYLIST_MAX);
  if (listError) throw new Error("Your playlist couldn't be loaded just now.");
  const existing = (rows ?? []).find((r) => {
    const s = songFromContext(r.context);
    return s && sameSong(s, song);
  });
  if (existing) {
    // Same song again: keep one row, but take the newer link if one was given.
    if (song.url) {
      await supabase
        .from("connect_reflections")
        .update({ context: { pathway: "music", kind: "playlist", song } })
        .eq("id", existing.id)
        .eq("user_id", uid);
    }
    return { id: existing.id, alreadyThere: true };
  }
  if ((rows ?? []).length >= PLAYLIST_MAX) {
    throw new Error(`Your playlist can hold up to ${PLAYLIST_MAX} songs. Remove one first.`);
  }
  const { data: row, error } = await supabase
    .from("connect_reflections")
    .insert({
      user_id: uid,
      source: "written",
      body: `${song.title}${song.artist ? ` — ${song.artist}` : ""}`,
      context: { pathway: "music", kind: "playlist", song },
    })
    .select("id")
    .single();
  if (error) throw new Error("The song couldn't be added just now.");
  return { id: row.id, alreadyThere: false };
}

export async function updatePlaylistLink(
  id: string,
  rawUrl: string | null,
): Promise<{ url: string | null }> {
  const uid = await userId();
  const url = rawUrl ? normalizeMusicUrl(rawUrl) : null;
  if (rawUrl && !url) {
    throw new Error("That link does not look right. Paste a full link, e.g. https://youtu.be/…");
  }
  const { data: row } = await supabase
    .from("connect_reflections")
    .select("context")
    .eq("id", id)
    .eq("user_id", uid)
    .eq("context->>kind", "playlist")
    .maybeSingle();
  const song = row ? songFromContext(row.context) : null;
  if (!song) throw new Error("That song is no longer in your playlist.");
  const { error } = await supabase
    .from("connect_reflections")
    .update({ context: { pathway: "music", kind: "playlist", song: { ...song, url } } })
    .eq("id", id)
    .eq("user_id", uid);
  if (error) throw new Error("The link couldn't be saved just now.");
  return { url };
}

export async function removeFromPlaylist(id: string): Promise<void> {
  const uid = await userId();
  const { error } = await supabase
    .from("connect_reflections")
    .delete()
    .eq("id", id)
    .eq("user_id", uid)
    .eq("context->>kind", "playlist");
  if (error) throw new Error("It couldn't be removed just now.");
}

/* ---------------------------------- share ---------------------------------- */

/** Which of email and text are set up. Both false if the function isn't reachable. */
export async function sendChannels(): Promise<SendChannels> {
  try {
    return await invoke<SendChannels>("music-send", { action: "capabilities" }, "");
  } catch {
    return { email: false, text: false };
  }
}

export function sendSongToSomeone(input: {
  song: Song;
  message: string;
  from: string;
  email: string;
  phone: string;
}): Promise<{ sent: string[]; note: string }> {
  return invoke(
    "music-send",
    { ...input, song: parseSong(input.song) },
    "It couldn't be sent just now. You can still copy the link or share it on WhatsApp.",
  );
}

/* --------------------------------- journal --------------------------------- */

export async function saveSongToJournal(input: {
  song: Song;
  note?: string;
  feeling?: Feeling | null;
  mode?: MusicMode | null;
}): Promise<{ id: string; createdAt: string }> {
  const uid = await userId();
  const song = parseSong(input.song);
  const note = (input.note ?? "").trim().slice(0, 2000);
  const label = `${song.title}${song.artist ? ` — ${song.artist}` : ""}`;
  const { data: row, error } = await supabase
    .from("connect_reflections")
    .insert({
      user_id: uid,
      source: "written",
      body: note || `Song for this moment: ${label}`,
      context: {
        pathway: "music",
        kind: "journal",
        song,
        feeling: input.feeling ?? null,
        mode: input.mode ?? null,
      },
    })
    .select("id, created_at")
    .single();
  if (error) throw new Error("It couldn't be saved to your journal just now.");
  return { id: row.id, createdAt: row.created_at };
}

/** The member's song for this moment: the last one they journaled. */
export async function getCurrentSong(): Promise<(Song & { savedAt: string }) | null> {
  const uid = await userId();
  const { data } = await supabase
    .from("connect_reflections")
    .select("context, created_at")
    .eq("user_id", uid)
    .eq("context->>pathway", "music")
    .eq("context->>kind", "journal")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const song = songFromContext(data.context);
  return song ? { ...song, savedAt: data.created_at } : null;
}

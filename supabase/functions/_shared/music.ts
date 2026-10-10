// Shared helpers for Connect Music: feelings, songs, listening links and the
// share link a member sends to someone else. Imports nothing, so it runs in the
// browser (via src/lib/music.ts) and in Supabase Edge Functions alike.

export const FEELINGS = [
  "Calm",
  "Anxious",
  "Sad",
  "Lonely",
  "Hopeful",
  "Grateful",
  "Angry",
  "Tired",
  "Energised",
  "In love",
] as const;

export type Feeling = (typeof FEELINGS)[number];

/** The four ways into Connect Music. */
export const MUSIC_MODES = [
  {
    id: "discover",
    name: "Discover",
    line: "Find music for your mood.",
    placeholder: "e.g. I feel restless tonight and can't switch off.",
    cta: "Find songs for my mood",
  },
  {
    id: "express",
    name: "Express",
    line: "Say something you can't put into words.",
    placeholder: "e.g. I've been thinking about my father. We don't talk much.",
    cta: "Find songs that say it",
  },
  {
    id: "share",
    name: "Share",
    line: "Send a song to someone.",
    placeholder: "e.g. My friend just lost her job and I want her to know I'm here.",
    cta: "Find a song to send",
  },
  {
    id: "reflect",
    name: "Reflect",
    line: "Write what the song made you feel.",
    placeholder: "e.g. I keep coming back to songs about home lately.",
    cta: "Find songs to reflect with",
  },
] as const;

export type MusicMode = (typeof MUSIC_MODES)[number]["id"];
export const MUSIC_MODE_IDS = MUSIC_MODES.map((m) => m.id) as [MusicMode, ...MusicMode[]];

export function musicMode(id: MusicMode) {
  return MUSIC_MODES.find((m) => m.id === id)!;
}

/** Shortest "what's on your mind" accepted before songs are suggested. */
export const MIND_MIN = 8;

export type Song = {
  title: string;
  artist: string;
  /** A link the member added themselves (Spotify, YouTube, …). */
  url?: string | null;
  /** Why the song fits, when Connect suggested it. */
  why?: string | null;
};

export const SONG_TITLE_MAX = 120;
export const SONG_ARTIST_MAX = 120;
export const SONG_URL_MAX = 500;
export const SHARE_MESSAGE_MAX = 300;
export const SHARE_FROM_MAX = 40;

/**
 * Accepts a pasted link and returns a safe https URL, or null. A missing
 * scheme ("open.spotify.com/…") is completed; anything but http(s) is refused.
 */
export function normalizeMusicUrl(raw: string | null | undefined): string | null {
  const text = (raw ?? "").trim();
  if (!text || text.length > SONG_URL_MAX) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!url.hostname.includes(".")) return null;
  url.protocol = "https:";
  return url.toString();
}

/** Where a member's own link goes, for the button label. */
export function musicLinkLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "Link";
  }
  if (host.endsWith("spotify.com") || host === "spotify.link") return "Spotify";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "YouTube";
  if (host.endsWith("music.apple.com")) return "Apple Music";
  if (host.endsWith("soundcloud.com")) return "SoundCloud";
  if (host.endsWith("jiosaavn.com")) return "JioSaavn";
  if (host.endsWith("gaana.com")) return "Gaana";
  if (host.endsWith("wynk.in")) return "Wynk";
  return "Link";
}

function searchText(song: Pick<Song, "title" | "artist">): string {
  return [song.title, song.artist]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function spotifySearchUrl(song: Pick<Song, "title" | "artist">): string {
  return `https://open.spotify.com/search/${encodeURIComponent(searchText(song))}`;
}

export function youtubeSearchUrl(song: Pick<Song, "title" | "artist">): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText(song))}`;
}

/** Trim and bound a song before it is kept or sent anywhere. */
export function cleanSong(song: Song): Song | null {
  const title = (song.title ?? "").trim().slice(0, SONG_TITLE_MAX);
  const artist = (song.artist ?? "").trim().slice(0, SONG_ARTIST_MAX);
  if (!title) return null;
  return {
    title,
    artist,
    url: normalizeMusicUrl(song.url),
    why: song.why ? String(song.why).trim().slice(0, 400) : null,
  };
}

export function sameSong(a: Pick<Song, "title" | "artist">, b: Pick<Song, "title" | "artist">) {
  const k = (s: Pick<Song, "title" | "artist">) =>
    `${s.title.trim().toLowerCase()}|${s.artist.trim().toLowerCase()}`;
  return k(a) === k(b);
}

/* ------------------------------- share links ------------------------------ */

export type SongShare = {
  title: string;
  artist: string;
  url: string | null;
  message: string;
  from: string;
};

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string): string {
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Packs a song and a short message into the `s` value of a /song link. */
export function encodeSongShare(share: SongShare): string {
  const song = cleanSong({ title: share.title, artist: share.artist, url: share.url });
  if (!song) throw new Error("A song needs a title.");
  return toBase64Url(
    JSON.stringify({
      t: song.title,
      a: song.artist,
      u: song.url ?? "",
      m: share.message.trim().slice(0, SHARE_MESSAGE_MAX),
      f: share.from.trim().slice(0, SHARE_FROM_MAX),
    }),
  );
}

/** Reads a /song link back. Anything malformed or tampered returns null. */
export function decodeSongShare(data: string | null | undefined): SongShare | null {
  if (!data || data.length > 4000) return null;
  try {
    const raw = JSON.parse(fromBase64Url(data)) as Record<string, unknown>;
    const song = cleanSong({
      title: typeof raw["t"] === "string" ? raw["t"] : "",
      artist: typeof raw["a"] === "string" ? raw["a"] : "",
      url: typeof raw["u"] === "string" ? raw["u"] : null,
    });
    if (!song) return null;
    return {
      title: song.title,
      artist: song.artist,
      url: song.url ?? null,
      message: typeof raw["m"] === "string" ? raw["m"].slice(0, SHARE_MESSAGE_MAX) : "",
      from: typeof raw["f"] === "string" ? raw["f"].slice(0, SHARE_FROM_MAX) : "",
    };
  } catch {
    return null;
  }
}

export function songShareUrl(origin: string, share: SongShare): string {
  return `${origin.replace(/\/$/, "")}/song?s=${encodeSongShare(share)}`;
}

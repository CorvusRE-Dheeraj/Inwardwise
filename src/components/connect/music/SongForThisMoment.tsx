import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Music } from "lucide-react";
import { getCurrentSong, saveSongToJournal } from "@/lib/connect-music.functions";
import {
  SONG_ARTIST_MAX,
  SONG_TITLE_MAX,
  SONG_URL_MAX,
  cleanSong,
  normalizeMusicUrl,
  type Song,
} from "@/lib/music";
import { SongHeading, SongLinks } from "./SongLinks";
import { ACTION_BUTTON, SMALL_INPUT } from "./SongActions";

/** The music prompt that fits each Connect page. */
export const MOMENT_PROMPTS = {
  journal: "Would you like to capture this thought with a song?",
  share: "Can't find the words? Send a song.",
  belonging: "Find music that reminds you that others have felt this too.",
  oneness: "Explore music that makes the world feel bigger.",
  membership: "Share a song that represents what you're going through.",
} as const;

export type MomentPage = keyof typeof MOMENT_PROMPTS;

/**
 * "A Song for This Moment", shown on other Connect pathways with a prompt
 * that fits the page. It shows the member's current song, lets them name one
 * right here, and always points to Connect Music, where it can be changed.
 */
export function SongForThisMoment({ page }: { page: MomentPage }) {
  const load = useServerFn(getCurrentSong);
  const save = useServerFn(saveSongToJournal);

  const [current, setCurrent] = useState<(Song & { savedAt: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    load({})
      .then(setCurrent)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [load]);
  useEffect(() => refresh(), [refresh]);

  async function submit() {
    if (url.trim() && !normalizeMusicUrl(url)) {
      setError("That link does not look right. Paste a full link, e.g. https://youtu.be/…");
      return;
    }
    const song = cleanSong({ title, artist, url });
    if (!song) {
      setError("Add the song name first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await save({ data: { song, note: "" } });
      setTitle("");
      setArtist("");
      setUrl("");
      setEditing(false);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be kept just now.");
    } finally {
      setBusy(false);
    }
  }

  const asking = !loading && (!current || editing);

  return (
    <section className="mx-auto w-[min(1100px,calc(100%-2rem))] pb-16">
      <div className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--royal)]/[0.03] p-6 sm:p-8">
        <div className="font-mono-cap flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
          <Music className="h-3 w-3" /> Connect Music
        </div>
        <h2 className="font-display mt-3 text-2xl sm:text-3xl">
          A Song for <em className="italic text-[color:var(--royal)]">This Moment</em>
        </h2>
        <p className="mt-3 max-w-2xl font-display text-[clamp(1.05rem,2.2vw,1.35rem)] italic leading-snug text-[color:var(--royal)]">
          {MOMENT_PROMPTS[page]}
        </p>

        {loading && (
          <p className="mt-4 text-[14px] text-[color:var(--muted-foreground)]">Loading…</p>
        )}

        {!loading && current && !editing && (
          <div className="mt-5">
            <SongHeading song={current} />
            <div className="mt-4">
              <SongLinks song={current} />
            </div>
          </div>
        )}

        {asking && (
          <div className="mt-5">
            <p className="text-[15px]">Which song would you like to listen to now?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                value={title}
                maxLength={SONG_TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song name"
                aria-label="Song name"
                className={SMALL_INPUT}
              />
              <input
                value={artist}
                maxLength={SONG_ARTIST_MAX}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                aria-label="Artist"
                className={SMALL_INPUT}
              />
              <input
                value={url}
                maxLength={SONG_URL_MAX}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Your link (optional)"
                aria-label="Your link (optional)"
                inputMode="url"
                className={SMALL_INPUT}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy}
                className={ACTION_BUTTON}
              >
                {busy ? "Saving…" : "Make this my song for now"}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} className={ACTION_BUTTON}>
                  Cancel
                </button>
              )}
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        )}

        <p className="mt-6 border-t border-[color:var(--rule)] pt-4 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
          {current
            ? "This is your current song. You can change it anytime here, or in Connect Music, where you can also get suggestions and keep your own playlist."
            : "Not sure which song? Connect Music asks how you feel and suggests a few, each with a reason why it fits."}{" "}
          {current && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="underline underline-offset-2 hover:text-[color:var(--ink)]"
            >
              Change it here
            </button>
          )}
        </p>
        <Link
          to="/connect/music"
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
        >
          {current ? "Change it in Connect Music" : "Open Connect Music"}{" "}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

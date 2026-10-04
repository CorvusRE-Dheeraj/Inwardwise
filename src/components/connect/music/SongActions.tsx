import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Check, ListPlus, Send } from "lucide-react";
import { addToPlaylist, saveSongToJournal } from "@/lib/connect-music.functions";
import {
  SONG_URL_MAX,
  normalizeMusicUrl,
  type Feeling,
  type MusicMode,
  type Song,
} from "@/lib/music";

export const ACTION_BUTTON =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-3.5 py-1.5 text-[12px] transition hover:border-[color:var(--ink)] disabled:opacity-50";
export const SMALL_INPUT =
  "w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30";

type Panel = null | "playlist" | "journal" | "send";

/** What a member can do with a song: keep it, journal it, or send it. */
export function SongActions({
  song,
  feeling,
  mode,
  onPlaylistChange,
  renderSend,
}: {
  song: Song;
  feeling: Feeling | null;
  mode: MusicMode | null;
  onPlaylistChange: () => void;
  renderSend?: (song: Song, close: () => void) => React.ReactNode;
}) {
  const add = useServerFn(addToPlaylist);
  const journal = useServerFn(saveSongToJournal);

  const [panel, setPanel] = useState<Panel>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function open(next: Panel) {
    setError(null);
    setDone(null);
    setPanel((p) => (p === next ? null : next));
  }

  async function keep() {
    if (link.trim() && !normalizeMusicUrl(link)) {
      setError("That link does not look right. Paste a full link, e.g. https://youtu.be/…");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await add({
        data: { song: { ...song, url: link.trim() || song.url || null } },
      });
      setDone(res.alreadyThere ? "Already in your playlist." : "Added to your playlist.");
      setPanel(null);
      setLink("");
      onPlaylistChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be added just now.");
    } finally {
      setBusy(false);
    }
  }

  async function saveToJournal() {
    if (mode === "reflect" && note.trim().length < 2) {
      setError("Write a few words about what the song made you feel.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await journal({ data: { song, note: note.trim(), feeling, mode } });
      setDone("Saved to your Journal.");
      setPanel(null);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be kept just now.");
    } finally {
      setBusy(false);
    }
  }

  const reflecting = mode === "reflect";
  const lead = (on: boolean) =>
    on
      ? `${ACTION_BUTTON} border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]`
      : ACTION_BUTTON;

  const playlistButton = (
    <button
      key="playlist"
      type="button"
      onClick={() => (song.url ? void keep() : open("playlist"))}
      disabled={busy}
      className={lead(mode === "discover")}
    >
      <ListPlus className="h-3.5 w-3.5" /> Add to My Playlist
    </button>
  );
  const journalButton = (
    <button
      key="journal"
      type="button"
      onClick={() => open("journal")}
      className={lead(reflecting || mode === "express")}
    >
      <BookOpen className="h-3.5 w-3.5" />{" "}
      {reflecting ? "What did it make you feel?" : "Save to Journal"}
    </button>
  );
  const sendButton = renderSend ? (
    <button
      key="send"
      type="button"
      onClick={() => open("send")}
      className={lead(mode === "share")}
    >
      <Send className="h-3.5 w-3.5" /> Send to someone
    </button>
  ) : null;

  // Each mode puts its own next step first.
  const buttons =
    mode === "share"
      ? [sendButton, playlistButton, journalButton]
      : mode === "reflect" || mode === "express"
        ? [journalButton, playlistButton, sendButton]
        : [playlistButton, journalButton, sendButton];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {buttons}
        {done && (
          <span className="inline-flex items-center gap-1 text-[12px] text-[color:var(--royal)]">
            <Check className="h-3.5 w-3.5" /> {done}
          </span>
        )}
      </div>

      {panel === "playlist" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
              Your own link (optional): Spotify, YouTube or any https link
            </span>
            <input
              value={link}
              maxLength={SONG_URL_MAX}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
              inputMode="url"
              className={SMALL_INPUT}
            />
          </label>
          <button
            type="button"
            onClick={() => void keep()}
            disabled={busy}
            className={ACTION_BUTTON}
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      )}

      {panel === "journal" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
              {reflecting
                ? "What did this song make you feel? Write it in your own words."
                : "A note for your Journal (optional): why this song, right now?"}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 2000))}
              rows={3}
              className={`${SMALL_INPUT} resize-y leading-relaxed`}
            />
          </label>
          <button
            type="button"
            onClick={() => void saveToJournal()}
            disabled={busy}
            className={ACTION_BUTTON}
          >
            {busy ? "Saving…" : "Save to Journal"}
          </button>
        </div>
      )}

      {panel === "send" && renderSend && (
        <div className="mt-4">{renderSend(song, () => setPanel(null))}</div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}

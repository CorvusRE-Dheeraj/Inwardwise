import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Trash2 } from "lucide-react";
import {
  removeFromPlaylist,
  updatePlaylistLink,
  type PlaylistItem,
} from "@/lib/connect-music.functions";
import { SONG_URL_MAX, normalizeMusicUrl, type Song } from "@/lib/music";
import { SongHeading, SongLinks } from "./SongLinks";
import { ACTION_BUTTON, SMALL_INPUT } from "./SongActions";

function PlaylistRow({
  item,
  onChange,
  renderSend,
}: {
  item: PlaylistItem;
  onChange: () => void;
  renderSend?: (song: Song, close: () => void) => React.ReactNode;
}) {
  const saveLink = useServerFn(updatePlaylistLink);
  const remove = useServerFn(removeFromPlaylist);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [link, setLink] = useState(item.url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitLink() {
    if (link.trim() && !normalizeMusicUrl(link)) {
      setError("That link does not look right. Paste a full link, e.g. https://youtu.be/…");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveLink({ data: { id: item.id, url: link.trim() || null } });
      setEditing(false);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The link could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function drop() {
    setBusy(true);
    try {
      await remove({ data: { id: item.id } });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be removed.");
      setBusy(false);
    }
  }

  return (
    <li className="py-5">
      <SongHeading song={item} />
      <div className="mt-3">
        <SongLinks song={item} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditing((v) => !v)} className={ACTION_BUTTON}>
          <Link2 className="h-3.5 w-3.5" /> {item.url ? "Change my link" : "Add my own link"}
        </button>
        {renderSend && (
          <button type="button" onClick={() => setSending((v) => !v)} className={ACTION_BUTTON}>
            Send to someone
          </button>
        )}
        <button type="button" onClick={() => void drop()} disabled={busy} className={ACTION_BUTTON}>
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
      {editing && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={link}
            maxLength={SONG_URL_MAX}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://open.spotify.com/track/…  (leave empty to remove)"
            inputMode="url"
            aria-label={`Your link for ${item.title}`}
            className={SMALL_INPUT}
          />
          <button
            type="button"
            onClick={() => void submitLink()}
            disabled={busy}
            className={`${ACTION_BUTTON} shrink-0 justify-center`}
          >
            {busy ? "Saving…" : "Save link"}
          </button>
        </div>
      )}
      {sending && renderSend && (
        <div className="mt-3">{renderSend(item, () => setSending(false))}</div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </li>
  );
}

/** The member's own playlist, private to them. */
export function MyPlaylist({
  items,
  loading,
  onChange,
  renderSend,
}: {
  items: PlaylistItem[];
  loading: boolean;
  onChange: () => void;
  renderSend?: (song: Song, close: () => void) => React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        § 04 · Private to you
      </div>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">
        My <em className="italic text-[color:var(--royal)]">Playlist</em>
      </h2>
      {loading ? (
        <p className="mt-4 text-[14px] text-[color:var(--muted-foreground)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
          Nothing here yet. Use “Add to My Playlist” on any song above, and add your own Spotify or
          YouTube link if you have one.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-[color:var(--rule)]">
          {items.map((item) => (
            <PlaylistRow key={item.id} item={item} onChange={onChange} renderSend={renderSend} />
          ))}
        </ul>
      )}
    </div>
  );
}

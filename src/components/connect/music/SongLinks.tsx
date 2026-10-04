import { ExternalLink } from "lucide-react";
import {
  musicLinkLabel,
  normalizeMusicUrl,
  spotifySearchUrl,
  youtubeSearchUrl,
  type Song,
} from "@/lib/music";

const LINK_CLASS =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-3.5 py-1.5 text-[12px] transition hover:border-[color:var(--ink)]";

/**
 * Listening links for a song. A member's own link comes first; Spotify and
 * YouTube searches are always offered, so every song can be played somewhere.
 */
export function SongLinks({ song }: { song: Song }) {
  const url = normalizeMusicUrl(song.url);
  const own = url ? musicLinkLabel(url) : null;
  return (
    <div className="flex flex-wrap gap-2">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${LINK_CLASS} border-[color:var(--ink)]`}
        >
          {own === "Link" ? "Open your link" : `Open in ${own}`}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {own !== "Spotify" && (
        <a
          href={spotifySearchUrl(song)}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          Find on Spotify <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {own !== "YouTube" && (
        <a
          href={youtubeSearchUrl(song)}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          Find on YouTube <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

/** Song name and artist, as shown on every card. */
export function SongHeading({ song }: { song: Pick<Song, "title" | "artist"> }) {
  return (
    <div>
      <div className="font-display text-[1.35rem] leading-tight">{song.title}</div>
      {song.artist && (
        <div className="mt-0.5 text-[13px] italic text-[color:var(--muted-foreground)]">
          {song.artist}
        </div>
      )}
    </div>
  );
}

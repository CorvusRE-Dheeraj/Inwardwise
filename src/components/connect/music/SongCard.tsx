import type { Song } from "@/lib/music";
import { SongHeading, SongLinks } from "./SongLinks";

/** One song: name, artist, why it fits, where to play it, and what to do with it. */
export function SongCard({
  song,
  label,
  actions,
}: {
  song: Song;
  label?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[color:var(--rule)] p-5">
      {label && (
        <div className="font-mono-cap mb-3 text-[10px] text-[color:var(--muted-foreground)]">
          {label}
        </div>
      )}
      <SongHeading song={song} />
      {song.why && (
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
          {song.why}
        </p>
      )}
      <div className="mt-4">
        <SongLinks song={song} />
      </div>
      {actions && <div className="mt-4 border-t border-[color:var(--rule)] pt-4">{actions}</div>}
    </div>
  );
}

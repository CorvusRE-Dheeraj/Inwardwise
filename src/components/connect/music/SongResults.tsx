import type { Song } from "@/lib/music";
import { SongCard } from "./SongCard";
import type { SuggestionResult } from "./useSongSuggestions";

/** Suggested songs, with a note on where they came from. */
export function SongResults({
  result,
  renderActions,
}: {
  result: SuggestionResult;
  renderActions: (song: Song) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {result.usedSelf && (
        <p className="text-[12px] text-[color:var(--royal)]">
          ✓ Tuned to your Self. The reasons below are written for you.
        </p>
      )}
      {result.source === "picks" && (
        <p className="text-[12px] text-[color:var(--muted-foreground)]">
          AI suggestions are not available right now, so these are Connect's own{" "}
          {result.feeling ? `picks for feeling ${result.feeling.toLowerCase()}` : "general picks"}
          {result.sharedSelf ? ". Your Self is only used when AI suggestions are available." : "."}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {result.songs.map((s) => (
          <SongCard key={`${s.title}|${s.artist}`} song={s} actions={renderActions(s)} />
        ))}
      </div>
    </div>
  );
}

import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { suggestSongs } from "@/lib/connect-music.functions";
import type { Feeling, MusicMode, Song } from "@/lib/music";
import type { MusicSelfProfile } from "@/lib/music-self";

export type SuggestionResult = {
  songs: Song[];
  source: "ai" | "picks";
  usedSelf: boolean;
  sharedSelf: boolean;
  /** Null when songs were suggested from the Self alone. */
  feeling: Feeling | null;
};

export type SuggestionRequest = {
  mode: MusicMode;
  feeling: Feeling | null;
  note: string;
  selfProfile: MusicSelfProfile | null;
};

/** Asks Connect for songs and keeps the latest answer. */
export function useSongSuggestions() {
  const suggest = useServerFn(suggestSongs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestionResult | null>(null);

  const run = useCallback(
    async ({ mode, feeling, note, selfProfile }: SuggestionRequest) => {
      setBusy(true);
      setError(null);
      try {
        const res = await suggest({
          data: { mode, feeling, note: note.trim(), selfProfile: selfProfile?.text ?? null },
        });
        setResult({ ...res, sharedSelf: !!selfProfile, feeling });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Songs could not be suggested just now.");
      } finally {
        setBusy(false);
      }
    },
    [suggest],
  );

  return { busy, error, result, run };
}

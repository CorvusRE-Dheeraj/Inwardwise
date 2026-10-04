import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import { SongCard } from "@/components/connect/music/SongCard";
import { SongActions } from "@/components/connect/music/SongActions";
import { MyPlaylist } from "@/components/connect/music/MyPlaylist";
import { SendSong } from "@/components/connect/music/SendSong";
import { TuneToSelf } from "@/components/connect/music/TuneToSelf";
import { SongResults } from "@/components/connect/music/SongResults";
import { useSongSuggestions } from "@/components/connect/music/useSongSuggestions";
import type { MusicSelfProfile } from "@/lib/music-self";
import { CrisisNotice } from "@/components/CrisisNotice";
import { detectCrisis } from "@/lib/crisis-detect";
import { listPlaylist, type PlaylistItem } from "@/lib/connect-music.functions";
import {
  FEELINGS,
  MIND_MIN,
  MUSIC_MODES,
  SONG_ARTIST_MAX,
  SONG_TITLE_MAX,
  SONG_URL_MAX,
  cleanSong,
  musicMode,
  normalizeMusicUrl,
  type Feeling,
  type MusicMode,
  type Song,
} from "@/lib/music";

export const Route = createFileRoute("/_authenticated/connect/music")({
  head: () => ({
    meta: [
      { title: "Connect Music | InwardWise" },
      {
        name: "description",
        content:
          "Say how you feel, find a song that fits the moment, keep it in your own playlist or send it to someone.",
      },
      { property: "og:title", content: "Connect Music | InwardWise" },
      { property: "og:description", content: "Sometimes a song says what words cannot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MusicPathway,
});

const INPUT_CLASS =
  "w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30";
const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-50";

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
      § {n} · {children}
    </div>
  );
}

/* ---------------------------- § 01 how you feel ---------------------------- */

function StartStep({
  mode,
  feeling,
  note,
  onMode,
  onFeeling,
  onNote,
}: {
  mode: MusicMode;
  feeling: Feeling | null;
  note: string;
  onMode: (m: MusicMode) => void;
  onFeeling: (f: Feeling) => void;
  onNote: (n: string) => void;
}) {
  return (
    <PathwayCard>
      <SectionLabel n="01">Start here</SectionLabel>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">What would you like music for?</h2>
      <div
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        role="radiogroup"
        aria-label="Mode"
      >
        {MUSIC_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => onMode(m.id)}
            className={`rounded-md border p-4 text-left transition ${
              mode === m.id
                ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                : "border-[color:var(--rule)] hover:border-[color:var(--ink)]"
            }`}
          >
            <div className="font-display text-xl">{m.name}</div>
            <div
              className={`mt-1 text-[13px] leading-snug ${
                mode === m.id ? "opacity-80" : "text-[color:var(--muted-foreground)]"
              }`}
            >
              {m.line}
            </div>
          </button>
        ))}
      </div>

      <h3 className="font-display mt-8 text-xl">How are you feeling right now?</h3>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Your feeling">
        {FEELINGS.map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={feeling === f}
            onClick={() => onFeeling(f)}
            className={`min-h-10 rounded-full border px-4 py-2 text-[13px] transition ${
              feeling === f
                ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                : "border-[color:var(--rule)] hover:border-[color:var(--ink)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <label className="mt-8 block">
        <span className="font-display mb-3 block text-xl">What's on your mind?</span>
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value.slice(0, 1000))}
          rows={3}
          placeholder={musicMode(mode).placeholder}
          className={`${INPUT_CLASS} resize-y leading-relaxed`}
        />
      </label>
    </PathwayCard>
  );
}

/* --------------------------- § 02 your own song ---------------------------- */

function OwnSongStep({ renderActions }: { renderActions: (song: Song) => React.ReactNode }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<Song | null>(null);

  function show() {
    if (url.trim() && !normalizeMusicUrl(url)) {
      setError("That link does not look right. Paste a full link, e.g. https://open.spotify.com/…");
      return;
    }
    const cleaned = cleanSong({ title, artist, url });
    if (!cleaned) {
      setError("Add the song name first.");
      return;
    }
    setError(null);
    setSong(cleaned);
  }

  return (
    <PathwayCard>
      <SectionLabel n="02">Your choice, not the AI's</SectionLabel>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">
        Which song would you like to listen to now?
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[13px] text-[color:var(--muted-foreground)]">
            Song name
          </span>
          <input
            value={title}
            maxLength={SONG_TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix You"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] text-[color:var(--muted-foreground)]">
            Artist
          </span>
          <input
            value={artist}
            maxLength={SONG_ARTIST_MAX}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Coldplay"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[13px] text-[color:var(--muted-foreground)]">
            Your link (optional): Spotify, YouTube, Apple Music or any https link
          </span>
          <input
            value={url}
            maxLength={SONG_URL_MAX}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/…"
            inputMode="url"
            className={INPUT_CLASS}
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5">
        <button type="button" onClick={show} className={PRIMARY_BUTTON}>
          Use this song <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {song && (
        <div className="mt-6">
          <SongCard song={song} label="Your song" actions={renderActions(song)} />
        </div>
      )}
    </PathwayCard>
  );
}

/* ------------------------- § 03 connect suggestions ------------------------ */

function SuggestStep({
  mode,
  feeling,
  note,
  selfProfile,
  renderActions,
}: {
  mode: MusicMode;
  feeling: Feeling | null;
  note: string;
  selfProfile: MusicSelfProfile | null;
  renderActions: (song: Song) => React.ReactNode;
}) {
  const { busy, error, result, run: suggest } = useSongSuggestions();

  // With the Self shared, it gives the context, so writing a note is optional.
  const missing = !feeling
    ? "Choose how you are feeling in § 01 first."
    : !selfProfile && note.trim().length < MIND_MIN
      ? "Write what's on your mind in § 01, a sentence is enough."
      : null;

  function run() {
    if (!feeling || missing) return;
    void suggest({ mode, feeling, note, selfProfile });
  }

  const current = musicMode(mode);

  return (
    <PathwayCard>
      <SectionLabel n="03">Or let Connect suggest · {current.name}</SectionLabel>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">{current.line}</h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
        {missing ??
          (selfProfile
            ? `Connect reads how you feel, what is on your mind and your Self (${selfProfile.stages.join(", ")}), then suggests a few songs, each with a short reason why it fits.`
            : `Connect reads how you feel and what is on your mind, then suggests a few songs, each with a short reason why it fits.`)}
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5">
        <button type="button" onClick={run} disabled={!!missing || busy} className={PRIMARY_BUTTON}>
          {busy ? "Finding songs…" : current.cta} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {result && (
        <div className="mt-6">
          <SongResults result={result} renderActions={renderActions} />
        </div>
      )}
    </PathwayCard>
  );
}

/* ---------------------------------- page ---------------------------------- */

function MusicPathway() {
  const [mode, setMode] = useState<MusicMode>("discover");
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState("");
  const [selfProfile, setSelfProfile] = useState<MusicSelfProfile | null>(null);
  const crisis = note.trim() ? detectCrisis(note) : [];

  const loadPlaylist = useServerFn(listPlaylist);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(true);
  const refreshPlaylist = useCallback(() => {
    loadPlaylist({})
      .then(setPlaylist)
      .catch(() => undefined)
      .finally(() => setPlaylistLoading(false));
  }, [loadPlaylist]);
  useEffect(() => refreshPlaylist(), [refreshPlaylist]);

  const renderSend = (song: Song, close: () => void) => <SendSong song={song} onClose={close} />;
  const renderActions = (song: Song): React.ReactNode => (
    <SongActions
      song={song}
      feeling={feeling}
      mode={mode}
      onPlaylistChange={refreshPlaylist}
      renderSend={renderSend}
    />
  );

  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={
        <>
          Connect <em className="italic text-[color:var(--royal)]">Music</em>
        </>
      }
      tagline="Sometimes a song says what we cannot put into words."
      intro="Pick a mode — Discover, Express, Share or Reflect — say how you feel and what is on your mind. Then choose a song yourself, or let Connect suggest a few with a short reason why each one fits. Keep them in your own playlist, journal them, or send one to someone when words aren't enough."
    >
      <PathwaySection>
        <div className="space-y-6">
          <StartStep
            mode={mode}
            feeling={feeling}
            note={note}
            onMode={setMode}
            onFeeling={setFeeling}
            onNote={setNote}
          />
          <CrisisNotice categories={crisis} />
          <OwnSongStep renderActions={renderActions} />
          <TuneToSelf onChange={setSelfProfile} renderActions={renderActions} />
          <SuggestStep
            mode={mode}
            feeling={feeling}
            note={note}
            selfProfile={selfProfile}
            renderActions={renderActions}
          />
          <MyPlaylist
            items={playlist}
            loading={playlistLoading}
            onChange={refreshPlaylist}
            renderSend={renderSend}
          />
        </div>
      </PathwaySection>
    </PathwayShell>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PinKeypad } from "@/components/avatar/PinKeypad";
import { useAvatarVault } from "@/lib/avatar-vault";
import { decryptText } from "@/lib/avatar-crypto";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { MUSIC_SELF_STAGES, buildMusicSelfProfile, type MusicSelfProfile } from "@/lib/music-self";
import type { Song } from "@/lib/music";
import { ACTION_BUTTON } from "./SongActions";
import { SongResults } from "./SongResults";
import { useSongSuggestions } from "./useSongSuggestions";

const LINK = "underline underline-offset-2";

/**
 * Unlocks the Self with the member's PIN and reads their answers on this
 * device. Mounted only after they choose "Use my Self", so simply visiting
 * Connect Music never touches their Self.
 */
function SelfReader({
  onLoaded,
  onCancel,
}: {
  onLoaded: (profile: MusicSelfProfile | null) => void;
  onCancel: () => void;
}) {
  const vault = useAvatarVault();
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile || started.current) return;
    started.current = true;
    const key = vault.key;
    const uid = vault.profile.user_id;
    setReading(true);
    void (async () => {
      try {
        const { data, error: err } = await supabase
          .from("avatar_answers")
          .select("question_key, answer_text")
          .eq("user_id", uid);
        if (err) throw new Error(err.message);
        const answers: AvatarAnswers = {};
        for (const row of data ?? []) {
          try {
            answers[row.question_key] = await decryptText(key, row.answer_text);
          } catch {
            /* skip an answer that cannot be read */
          }
        }
        onLoaded(buildMusicSelfProfile(answers));
      } catch (e) {
        started.current = false;
        setError(e instanceof Error ? e.message : "Your Self could not be read just now.");
      } finally {
        setReading(false);
      }
    })();
  }, [vault.status, vault.key, vault.profile, onLoaded]);

  if (vault.status === "loading" || reading) {
    return (
      <p className="mt-5 text-[14px] text-[color:var(--muted-foreground)]">
        Reading your Self on this device…
      </p>
    );
  }

  if (vault.status === "needs-setup") {
    return (
      <p className="mt-5 text-[14px] leading-relaxed">
        You have not started your Self Journey yet.{" "}
        <Link to="/avatar" className={LINK}>
          Start it here
        </Link>
        , then come back to tune your songs.{" "}
        <button type="button" onClick={onCancel} className={LINK}>
          Not now
        </button>
      </p>
    );
  }

  if (vault.status === "locked") {
    return (
      <div className="mt-6 max-w-xs">
        <PinKeypad
          mode="enter"
          busy={vault.busy}
          error={vault.error}
          onSubmit={(pin) => void vault.unlock(pin)}
        />
        <button
          type="button"
          onClick={onCancel}
          className={`mt-4 text-[13px] text-[color:var(--muted-foreground)] ${LINK}`}
        >
          Not now
        </button>
      </div>
    );
  }

  return error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null;
}

/**
 * Optional: tune song suggestions to the member's own Self Journey. Answers
 * are decrypted in the browser with their PIN; only a short summary of the
 * stages below is sent with a suggestion request, and it is never stored.
 */
export function TuneToSelf({
  onChange,
  renderActions,
}: {
  onChange: (profile: MusicSelfProfile | null) => void;
  renderActions: (song: Song) => React.ReactNode;
}) {
  const [wanted, setWanted] = useState(false);
  // undefined = not read yet; null = read, but nothing usable answered.
  const [profile, setProfile] = useState<MusicSelfProfile | null | undefined>(undefined);
  const [showShared, setShowShared] = useState(false);
  const songs = useSongSuggestions();
  const asked = useRef(false);

  // Songs from the Self alone: no feeling, no note. Asked once, as soon as
  // the Self is read; "Show other songs" asks again.
  const { run } = songs;
  useEffect(() => {
    if (!wanted || !profile || asked.current) return;
    asked.current = true;
    void run({ mode: "discover", feeling: null, note: "", selfProfile: profile });
  }, [wanted, profile, run]);

  function askAgain() {
    if (!profile) return;
    void run({ mode: "discover", feeling: null, note: "", selfProfile: profile });
  }

  function loaded(p: MusicSelfProfile | null) {
    setProfile(p);
    onChange(p);
  }

  function turnOn() {
    setWanted(true);
    if (profile) onChange(profile);
  }

  function turnOff() {
    setWanted(false);
    setShowShared(false);
    asked.current = false;
    onChange(null);
  }

  return (
    <div className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--royal)]/[0.03] p-6 sm:p-8">
      <div className="font-mono-cap flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
        <Sparkles className="h-3 w-3" /> Optional · private to you
      </div>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">
        Tune songs to <em className="italic text-[color:var(--royal)]">your Self</em>
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
        Connect can choose songs that fit your life — the moments that shaped you, the music and
        culture you come from — using your Self Journey stages {MUSIC_SELF_STAGES.join(", ")}.
        Reflecting is never used. Your answers are unlocked with your PIN on this device, shared
        only with the suggestion you ask for, and never stored with your songs.
      </p>

      {!wanted && (
        <button type="button" onClick={turnOn} className={`${ACTION_BUTTON} mt-5`}>
          <Lock className="h-3.5 w-3.5" /> Use my Self
        </button>
      )}

      {wanted && profile === undefined && <SelfReader onLoaded={loaded} onCancel={turnOff} />}

      {wanted && profile === null && (
        <p className="mt-5 text-[14px] leading-relaxed">
          Your Self Journey has no answers in {MUSIC_SELF_STAGES.join(", ")} yet, so there is
          nothing to tune with.{" "}
          <Link to="/avatar" className={LINK}>
            Continue your Self Journey
          </Link>{" "}
          — Getting Started and Exploring help most.{" "}
          <button type="button" onClick={turnOff} className={LINK}>
            Not now
          </button>
        </p>
      )}

      {wanted && profile && (
        <div className="mt-5 space-y-3">
          <p className="text-[14px] text-[color:var(--royal)]">
            ✓ Suggestions are tuned to your Self, using: {profile.stages.join(", ")}.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowShared((v) => !v)}
              className={ACTION_BUTTON}
            >
              {showShared ? "Hide what is shared" : "See exactly what is shared"}
            </button>
            <button type="button" onClick={turnOff} className={ACTION_BUTTON}>
              Stop using my Self
            </button>
          </div>
          {showShared && (
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-[color:var(--rule)] p-4 text-[12px] leading-relaxed text-[color:var(--muted-foreground)]">
              {profile.text}
            </pre>
          )}

          <div className="border-t border-[color:var(--rule)] pt-5">
            <h3 className="font-display text-xl">Songs from your Self</h3>
            <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">
              Chosen from your life, your music and where you come from.
            </p>
            {songs.busy && (
              <p className="mt-4 text-[14px] text-[color:var(--muted-foreground)]">
                Finding songs for you…
              </p>
            )}
            {songs.error && <p className="mt-4 text-sm text-destructive">{songs.error}</p>}
            {songs.result && !songs.busy && (
              <div className="mt-5 space-y-4">
                <SongResults result={songs.result} renderActions={renderActions} />
                <button type="button" onClick={askAgain} className={ACTION_BUTTON}>
                  <RefreshCw className="h-3.5 w-3.5" /> Show other songs
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

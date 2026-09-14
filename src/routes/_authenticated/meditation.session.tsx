import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAvatarVault } from "@/lib/avatar-vault";
import { decryptText } from "@/lib/avatar-crypto";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { synthesizeSpeech } from "@/lib/voice";
import { buildCalmRoundsPrompt } from "@/lib/calm-prompt";
import {
  CALM_STEPS,
  IMAGINE_LINE,
  PAUSE_SECONDS,
  REPEAT_OPTIONS,
  genericRound,
  parseCalmRounds,
  spokenLine,
  type CalmRound,
} from "@/lib/calm-session";

export const Route = createFileRoute("/_authenticated/meditation/session")({
  head: () => ({
    meta: [
      { title: "Self-Calm Session, InwardWise" },
      {
        name: "description",
        content:
          "Four prayers, spoken one at a time, each held for a minute while you picture the situation and feel it.",
      },
      { property: "og:title", content: "Self-Calm Session" },
      {
        property: "og:description",
        content:
          "Thank you, please forgive me, I am sorry, I love myself — repeated as many times as you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CalmSession,
});

type Phase = "idle" | "preparing" | "speaking" | "pausing" | "done";

function CalmSession() {
  const vault = useAvatarVault();
  const chatFn = useServerFn(chatWithAvatar);

  const [answers, setAnswers] = useState<AvatarAnswers | null>(null);
  const [name, setName] = useState("");
  const hydratedRef = useRef(false);

  const [repeats, setRepeats] = useState(3);
  const [voiceOn, setVoiceOn] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rounds, setRounds] = useState<CalmRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(PAUSE_SECONDS);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const profile = vault.profile;
    const key = vault.key;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const meta = auth.user?.user_metadata as { full_name?: string; name?: string } | undefined;
        const { data } = await supabase
          .from("avatar_answers")
          .select("question_key, answer_text")
          .eq("user_id", profile.user_id);
        const out: AvatarAnswers = {};
        for (const row of data ?? []) {
          out[row.question_key] = await decryptText(key, row.answer_text);
        }
        setName(meta?.full_name || meta?.name || "");
        setAnswers(out);
      } catch {
        hydratedRef.current = false;
        setAnswers({});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status, vault.key, vault.profile?.user_id]);

  const totalQuestions = useMemo(
    () => AVATAR_DIMENSIONS.reduce((n, d) => n + d.questions.length, 0),
    [],
  );
  const answeredCount = useMemo(
    () =>
      answers
        ? AVATAR_DIMENSIONS.flatMap((d) => d.questions).filter(
            (q) => (answers[q.key] ?? "").trim().length > 0,
          ).length
        : 0,
    [answers],
  );
  const selfComplete = answers !== null && answeredCount === totalQuestions;

  const stopEverything = useCallback(() => {
    runIdRef.current += 1;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      if (audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);
      audio.removeAttribute("src");
      audioRef.current = null;
    }
  }, []);

  useEffect(() => stopEverything, [stopEverything]);

  const speak = useCallback(async (text: string, runId: number) => {
    if (!voiceOn) return;
    try {
      const blob = await synthesizeSpeech(text);
      if (runId !== runIdRef.current) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        void audio.play().catch(() => resolve());
      });
      if (audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);
      if (audioRef.current === audio) audioRef.current = null;
    } catch {
      // Silence is acceptable: the line stays on screen to be read.
    }
  }, [voiceOn]);

  const hold = useCallback(
    (runId: number) =>
      new Promise<void>((resolve) => {
        setRemaining(PAUSE_SECONDS);
        let left = PAUSE_SECONDS;
        timerRef.current = setInterval(() => {
          if (runId !== runIdRef.current) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            resolve();
            return;
          }
          left -= 1;
          setRemaining(left);
          if (left <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            resolve();
          }
        }, 1000);
      }),
    [],
  );

  async function start() {
    if (phase !== "idle" && phase !== "done") return;
    stopEverything();
    const runId = runIdRef.current;
    setPhase("preparing");

    let prepared: CalmRound[] = [];
    try {
      if (selfComplete && answers) {
        const res = await chatFn({
          data: {
            systemPrompt: buildCalmRoundsPrompt(answers, repeats, name),
            messages: [{ role: "user" as const, content: "Prepare this Self-Calm session." }],
          },
        });
        prepared = parseCalmRounds(res.reply || "");
      }
    } catch {
      prepared = [];
    }

    if (prepared.length === 0) {
      prepared = Array.from({ length: repeats }, () => genericRound());
    }
    while (prepared.length < repeats) prepared.push(prepared[prepared.length - 1]!);
    prepared = prepared.slice(0, repeats);

    if (runId !== runIdRef.current) return;
    setRounds(prepared);
    setRoundIndex(0);
    setStepIndex(0);

    for (let r = 0; r < prepared.length; r += 1) {
      for (let s = 0; s < CALM_STEPS.length; s += 1) {
        if (runId !== runIdRef.current) return;
        setRoundIndex(r);
        setStepIndex(s);
        setPhase("speaking");
        await speak(spokenLine(prepared[r]![CALM_STEPS[s]!.key]), runId);
        if (runId !== runIdRef.current) return;
        setPhase("pausing");
        await hold(runId);
      }
    }
    if (runId !== runIdRef.current) return;
    setPhase("done");
    toast.success("Session complete. Rest for a moment.");
  }

  function stop() {
    stopEverything();
    setPhase("idle");
  }

  function skipPause() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRemaining(0);
  }

  if (vault.status === "loading") return <div className="min-h-[60vh]" />;

  if (vault.status !== "unlocked") {
    return (
      <div className="mx-auto grid w-[min(900px,calc(100%-2rem))] gap-8 py-20 md:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--rule)] p-8">
          <PinKeypad
            mode={vault.status === "needs-setup" ? "setup" : "enter"}
            busy={vault.busy}
            error={vault.error}
            onSubmit={(pin) =>
              vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
            }
          />
        </div>
        <Caution>
          This session is written from the answers only you can unlock. They are decrypted in your
          browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  const running = phase === "speaking" || phase === "pausing";
  const currentStep = CALM_STEPS[stepIndex]!;
  const currentText = rounds[roundIndex]?.[currentStep.key] ?? "";

  return (
    <div className="mx-auto w-[min(880px,calc(100%-2rem))] py-14 md:py-20">
      <Link
        to="/meditation/schedule"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Calm schedule
      </Link>

      <header className="mt-6">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">
          Volume III · The Session
        </span>
        <h1 className="font-display mt-3 text-[clamp(2rem,5.5vw,3.4rem)] leading-[1.03] tracking-tight">
          Self-<em className="italic text-[color:var(--royal)]">Calm</em>
        </h1>
        <p className="mt-5 max-w-xl text-[color:var(--muted-foreground)]">
          Four lines, in the same order every time: thank you, please forgive me, I am sorry, I love
          myself. Each one is held for a minute while you picture the situation and feel it.
        </p>
        <p className="mt-3 max-w-xl text-xs text-[color:var(--muted-foreground)]">
          {answers === null
            ? "Unlocking your answers…"
            : selfComplete
              ? "Your five factors are complete, so each line is written from your own words."
              : `Your five factors are not finished yet (${answeredCount} of ${totalQuestions}), so the session uses open questions you answer inwardly.`}
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-[color:var(--rule)] p-6 md:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">
              How many times?
            </span>
            <select
              value={repeats}
              onChange={(e) => setRepeats(Number(e.target.value))}
              disabled={running}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm disabled:opacity-50"
            >
              {REPEAT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "round" : "rounds"}
                </option>
              ))}
            </select>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Each round is four lines, about {Math.round((4 * (PAUSE_SECONDS + 12)) / 60)} minutes.
            </span>
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Spoken aloud</span>
            <button
              type="button"
              role="switch"
              aria-checked={voiceOn}
              onClick={() => setVoiceOn((v) => !v)}
              className={`inline-flex h-9 w-20 items-center rounded-full border border-[color:var(--rule)] px-1 transition ${
                voiceOn ? "bg-[color:var(--royal)]" : "bg-transparent"
              }`}
            >
              <span
                className={`h-7 w-7 rounded-full bg-[color:var(--paper)] shadow transition-transform ${
                  voiceOn ? "translate-x-11" : ""
                }`}
              />
            </button>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              {voiceOn ? "Each line is read to you." : "Off, read each line yourself."}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={start}
            disabled={running || phase === "preparing" || answers === null}
            className="rounded-full bg-[color:var(--royal)] px-6 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {phase === "preparing" ? "Preparing…" : running ? "In session" : "Begin the session"}
          </button>
          {running && (
            <>
              <button
                onClick={skipPause}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm transition hover:border-[color:var(--ink)]"
              >
                Move on
              </button>
              <button
                onClick={stop}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm transition hover:border-[color:var(--ink)]"
              >
                End
              </button>
            </>
          )}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {(running || phase === "done") && (
          <motion.section
            key={`${phase}-${roundIndex}-${stepIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 rounded-xl border border-[color:var(--rule)] p-8 text-center md:p-12"
          >
            {phase === "done" ? (
              <p className="font-display text-2xl">Your session is complete. Rest a moment.</p>
            ) : (
              <>
                <div className="font-mono-cap text-xs text-[color:var(--muted-foreground)]">
                  Round {roundIndex + 1} of {rounds.length} · {currentStep.title}
                </div>
                <p className="font-display mt-6 text-[clamp(1.3rem,3.4vw,2rem)] leading-snug">
                  {currentText}
                </p>
                <p className="mt-5 text-sm text-[color:var(--muted-foreground)]">{IMAGINE_LINE}</p>
                {phase === "pausing" && (
                  <p className="mt-6 font-mono-cap text-xs text-[color:var(--muted-foreground)]">
                    {remaining}s of silence
                  </p>
                )}
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

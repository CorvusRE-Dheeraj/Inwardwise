import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { useAvatarVault } from "@/lib/avatar-vault";
import { decryptText } from "@/lib/avatar-crypto";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import {
  PRAYER_SETS,
  SESSION_MINUTE_OPTIONS,
  dwellSecondsFor,
  linesPerSetFor,
  type PrayerLine,
} from "@/lib/meditation";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-dimensions";
import { buildMeditationPrompt, parseMeditationLines } from "@/lib/meditation-prompt";
import { synthesizeSpeech } from "@/lib/voice";
import { toast } from "sonner";
import {
  getMeditationSettings,
  saveMeditationSettings,
  type MeditationSettings,
} from "@/lib/meditation-settings.functions";


export const Route = createFileRoute("/_authenticated/meditation/practice")({
  head: () => ({
    meta: [
      { title: "Guided Meditation Practice — Decision Philosophy" },
      {
        name: "description",
        content:
          "A private, voice-guided four-prayer meditation built from the answers you wrote yourself.",
      },
      { property: "og:title", content: "Guided Meditation Practice" },
      {
        property: "og:description",
        content: "Four prayers, spoken in your own life's words, before you sleep.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MeditationPractice,
});

/** Format an ISO timestamp for a datetime-local input in the user's LOCAL time. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The browser's IANA timezone, e.g. "Asia/Kolkata". */
function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function MeditationPractice() {
  const chatFn = useServerFn(chatWithAvatar);
  const vault = useAvatarVault();

  const [answers, setAnswers] = useState<AvatarAnswers | null>(null);
  const [name, setName] = useState("");

  // Dashboard state (mirrors the avatar profile — one phone, one schedule).
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [minutes, setMinutes] = useState<number>(10);
  const [timeZone, setTimeZone] = useState<string>("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const [lines, setLines] = useState<PrayerLine[] | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  /** Set once the person confirms they are in a quiet place and ready. */
  const [ready, setReady] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const meta = auth.user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const { data } = await supabase
        .from("avatar_answers")
        .select("question_key, answer_text")
        .eq("user_id", vault.profile!.user_id);
      const out: AvatarAnswers = {};
      for (const row of data ?? []) {
        out[row.question_key] = await decryptText(vault.key!, row.answer_text);
      }
      if (cancelled) return;
      setName(meta?.full_name || meta?.name || "");
      setAnswers(out);
      setVoiceEnabled(!!vault.profile!.voice_enabled);
      setPhone(vault.profile!.phone_number ?? "");
      setScheduledAt(toLocalInput(vault.profile!.scheduled_call_at));
      setMinutes(
        (vault.profile as { session_minutes?: number | null }).session_minutes ?? 10,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [vault.status, vault.key, vault.profile]);

  // Detect the browser's timezone after hydration and keep the profile in sync.
  useEffect(() => {
    const tz = detectTimeZone();
    setTimeZone(tz);
    if (!vault.profile) return;
    const stored = (vault.profile as { timezone?: string | null }).timezone;
    if (stored === tz) return;
    void supabase
      .from("avatar_profiles")
      .update({ timezone: tz })
      .eq("user_id", vault.profile.user_id)
      .then(() => vault.setProfile({ ...vault.profile!, timezone: tz } as typeof vault.profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.profile?.user_id]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const grouped = useMemo(() => {
    if (!lines) return [];
    return PRAYER_SETS.map((s) => ({ set: s, items: lines.filter((l) => l.set === s.key) })).filter(
      (g) => g.items.length > 0,
    );
  }, [lines]);

  const flat = useMemo(
    () => grouped.flatMap((g) => g.items.map((l) => ({ ...l, set: g.set }))),
    [grouped],
  );
  const current = flat[step];

  // The meditation cannot start until the avatar is 100% built.
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
  const avatarComplete = answers !== null && answeredCount === totalQuestions;

  async function saveDashboard() {
    if (!vault.profile) return;
    setSavedNote(null);
    const tz = timeZone || detectTimeZone();
    const patch = {
      voice_enabled: voiceEnabled,
      phone_number: phone.trim() || null,
      scheduled_call_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      timezone: tz,
      session_minutes: minutes,
    };
    const { error: err } = await supabase
      .from("avatar_profiles")
      .update(patch)
      .eq("user_id", vault.profile.user_id);
    setSavedNote(
      err ? err.message : `Saved — a ${minutes}-minute session, set in ${tz} time.`,
    );
    if (!err) vault.setProfile({ ...vault.profile, ...patch } as typeof vault.profile);
  }

  async function buildTonight() {
    if (!answers || building || !avatarComplete) return;
    setBuilding(true);
    setError(null);
    try {
      const res = await chatFn({
        data: {
          systemPrompt: buildMeditationPrompt(answers, name, linesPerSetFor(minutes), minutes),
          messages: [{ role: "user" as const, content: "Prepare tonight's meditation." }],
        },
      });
      const parsed = parseMeditationLines(res.reply || "");
      if (parsed.length === 0) throw new Error("Tonight's lines could not be prepared. Try again.");
      setLines(parsed);
      setStep(0);
      setRunning(true);
      if (voiceEnabled) {
        void speak(
          "Get ready for your meditation. Take a minute to find a quiet place. When you are ready, we will begin.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBuilding(false);
    }
  }

  async function speak(text: string) {
    try {
      audioRef.current?.pause();
      const blob = await synthesizeSpeech(text);
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      await audio.play();
    } catch {
      /* silent — the practice works read-only too */
    }
  }

  useEffect(() => {
    if (running && ready && voiceEnabled && current) void speak(current.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, running, ready]);

  // Pace the session: each quarter of the scheduled time holds its own lines.
  useEffect(() => {
    if (!running || !ready || !autoAdvance || !current) return;
    if (step >= flat.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), dwellSecondsFor(minutes) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, running, ready, autoAdvance, minutes, flat.length]);



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
          Tonight&apos;s meditation is written from the answers only you can unlock. They are
          decrypted in your browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(980px,calc(100%-2rem))] py-14 md:py-20">
      <Link
        to="/meditation"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Meditation
      </Link>

      <header className="mt-6">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">
          Volume III · The Practice
        </span>
        <h1 className="font-display mt-3 text-[clamp(2rem,5.5vw,3.6rem)] leading-[1.03] tracking-tight">
          Four prayers, in your <em className="italic text-[color:var(--royal)]">own words</em>
        </h1>
        <p className="mt-5 max-w-xl text-[color:var(--muted-foreground)]">
          Tonight&apos;s lines are written from what you answered across your five dimensions. Say
          each one aloud, slowly, and stay with it before moving on.
        </p>
      </header>

      {/* ---------- Design dashboard ---------- */}
      <section className="mt-12 rounded-xl border border-[color:var(--rule)] p-6 md:p-8">
        <div className="font-mono-cap text-[color:var(--muted-foreground)]">Meditation dashboard</div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Schedule</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            />
            <span className="text-xs text-[color:var(--muted-foreground)]">
              {timeZone
                ? `Your local time · ${timeZone}`
                : "Detecting your timezone…"}
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">
              How many minutes?
            </span>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            >
              {SESSION_MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Divided into four equal parts — {linesPerSetFor(minutes)} lines per prayer.
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            />
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Check this is correct to receive the guided call.
            </span>
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">
              Voice-enabled guided meditation
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={voiceEnabled}
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`inline-flex h-9 w-20 items-center rounded-full border border-[color:var(--rule)] px-1 transition ${
                voiceEnabled ? "bg-[color:var(--royal)]" : "bg-transparent"
              }`}
            >
              <span
                className={`h-7 w-7 rounded-full bg-[color:var(--paper)] shadow transition-transform ${
                  voiceEnabled ? "translate-x-11" : ""
                }`}
              />
            </button>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              {voiceEnabled ? "On — each line is spoken to you." : "Off — read the lines yourself."}
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={saveDashboard}
            className="rounded-full border border-[color:var(--ink)] px-5 py-2 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            Save settings
          </button>
          {savedNote && (
            <span className="text-xs text-[color:var(--muted-foreground)]">{savedNote}</span>
          )}
        </div>
      </section>

      {/* ---------- The practice ---------- */}
      <section className="mt-10">
        {!lines && (
          <div className="rounded-xl border border-[color:var(--rule)] p-8 text-center">
            <p className="mx-auto max-w-md text-[color:var(--muted-foreground)]">
              When you are ready to sleep, begin. Your {minutes}-minute session is prepared fresh
              each time, so the prayer is never the same twice.
            </p>
            {answers && !avatarComplete && (
              <p className="mx-auto mt-5 max-w-md text-sm text-[color:var(--muted-foreground)]">
                Your meditation cannot begin until your avatar is fully built —{" "}
                {answeredCount} of {totalQuestions} questions answered.{" "}
                <Link to="/avatar" className="text-[color:var(--royal)] underline">
                  Finish building your avatar →
                </Link>
              </p>
            )}
            <button
              onClick={buildTonight}
              disabled={building || !answers || !avatarComplete}
              className="mt-6 rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {building ? "Preparing tonight's meditation…" : "Start meditation"}
            </button>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        )}

        {lines && !ready && (
          <div className="rounded-xl border border-[color:var(--rule)] p-8 text-center md:p-12">
            <p className="font-display text-[clamp(1.4rem,3vw,2.1rem)] leading-snug tracking-tight">
              Get ready for your meditation. Take a minute to find a quiet place.
            </p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
              Are you ready to begin?
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setReady(true)}
                className="rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white"
              >
                Yes, I&apos;m ready
              </button>
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setLines(null);
                  setRunning(false);
                }}
                className="rounded-full border border-[color:var(--rule)] px-6 py-3 text-sm"
              >
                Not yet
              </button>
            </div>
          </div>
        )}

        {lines && ready && current && (
          <div className="rounded-xl border border-[color:var(--rule)] p-8 md:p-12">
            <div className="flex items-center justify-between">
              <span className="font-mono-cap text-[color:var(--royal)]">
                Prayer {current.set.n} · {current.set.title}
              </span>
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">
                {step + 1} / {flat.length}
              </span>
            </div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {current.set.invitation}
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                className="font-display mt-10 min-h-[7rem] text-[clamp(1.5rem,3.4vw,2.4rem)] leading-[1.25] tracking-tight"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm disabled:opacity-40"
              >
                Back
              </button>
              {step < flat.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-sm text-[color:var(--paper)]"
                >
                  Next breath →
                </button>
              ) : (
                <button
                  onClick={() => {
                    audioRef.current?.pause();
                    setRunning(false);
                    setReady(false);
                    setLines(null);
                    setStep(0);
                  }}
                  className="rounded-full bg-[color:var(--royal)] px-6 py-2.5 text-sm text-white"
                >
                  Close the practice
                </button>
              )}
              <button
                onClick={() => speak(current.text)}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
              >
                Speak this line
              </button>
              <button
                onClick={() => setAutoAdvance((a) => !a)}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
              >
                {autoAdvance
                  ? `Paced · ${dwellSecondsFor(minutes)}s per line`
                  : "Paced timing off"}
              </button>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}

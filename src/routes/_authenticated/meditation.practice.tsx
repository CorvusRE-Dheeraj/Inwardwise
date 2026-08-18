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
import { sendMeditationText } from "@/lib/meditation-sms.functions";



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
  const saveSettingsFn = useServerFn(saveMeditationSettings);
  const statusFn = useServerFn(getMeditationSettings);
  const sendTextFn = useServerFn(sendMeditationText);

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
  const [saving, setSaving] = useState(false);
  const [texting, setTexting] = useState(false);
  const [callStatus, setCallStatus] = useState<MeditationSettings | null>(null);



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
        setVoiceEnabled(!!profile.voice_enabled);
        setPhone(profile.phone_number ?? "");
        setScheduledAt(toLocalInput(profile.scheduled_call_at));
        setMinutes((profile as { session_minutes?: number | null }).session_minutes ?? 10);
      } catch {
        // Allow a retry on the next render rather than staying stuck.
        hydratedRef.current = false;
        setAnswers({});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status, vault.key, vault.profile?.user_id]);


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

  // Show the state of the scheduled call (queued, called, failed).
  useEffect(() => {
    if (vault.status !== "unlocked") return;
    let cancelled = false;
    void statusFn({}).then(({ settings }) => {
      if (!cancelled) setCallStatus(settings);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status]);


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

  // ---- Validation for the schedule -------------------------------------
  const normalizedPhone = phone.replace(/[\s()-]/g, "").trim();
  const phoneError =
    normalizedPhone.length > 0 && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
      ? "Use the international format, e.g. +14155550123."
      : null;
  const scheduleError =
    scheduledAt && new Date(scheduledAt).getTime() <= Date.now()
      ? "Choose a time in the future."
      : null;
  const missingPhone =
    voiceEnabled && !!scheduledAt && normalizedPhone.length === 0
      ? "A phone number is needed for the scheduled call."
      : null;
  const canSave = !phoneError && !scheduleError && !missingPhone && !saving;

  // A meditation is delivered one way at a time: a call already queued for the
  // chosen moment blocks the text for that same moment.
  const callAtSameTime =
    !!scheduledAt &&
    voiceEnabled &&
    callStatus?.status === "scheduled" &&
    !!callStatus.voice_enabled &&
    !!callStatus.scheduled_at &&
    new Date(callStatus.scheduled_at).getTime() === new Date(scheduledAt).getTime();
  const textBlockedReason = answers === null
    ? "Unlocking your answers…"
    : !avatarComplete
      ? `Finish your avatar to receive the written draft (${answeredCount} of ${totalQuestions} answered).`
      : normalizedPhone.length === 0 || phoneError
        ? "Add a valid phone number to receive the draft by text."
        : callAtSameTime
          ? "A call is already scheduled for that exact time — the text cannot be scheduled for the same moment. Turn the call off or pick another time."
          : null;

  const canText = !textBlockedReason && !texting && !saving;


  /** Writes tonight's prayer lines using the person's own dimension answers. */
  async function generateScript(): Promise<PrayerLine[]> {
    if (!answers) throw new Error("Your answers are still loading.");
    const res = await chatFn({
      data: {
        systemPrompt: buildMeditationPrompt(answers, name, linesPerSetFor(minutes), minutes),
        messages: [{ role: "user" as const, content: "Prepare tonight's meditation." }],
      },
    });
    const parsed = parseMeditationLines(res.reply || "");
    if (parsed.length === 0) throw new Error("Tonight's lines could not be prepared. Try again.");
    return parsed;
  }

  async function saveDashboard() {
    if (!vault.profile || !canSave) return;
    setSavedNote(null);
    setSaving(true);
    const tz = timeZone || detectTimeZone();
    try {
      // Keep the avatar profile in step for the rest of the app.
      const patch = {
        voice_enabled: voiceEnabled,
        phone_number: normalizedPhone || null,
        scheduled_call_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        timezone: tz,
        session_minutes: minutes,
      };
      await supabase.from("avatar_profiles").update(patch).eq("user_id", vault.profile.user_id);
      vault.setProfile({ ...vault.profile, ...patch } as typeof vault.profile);

      // The call speaks the same wording every time — prepare it once, now.
      let script: PrayerLine[] | null = null;
      if (scheduledAt && voiceEnabled && normalizedPhone && avatarComplete) {
        script = await generateScript();
      }

      await saveSettingsFn({
        data: {
          phoneNumber: normalizedPhone || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          durationMinutes: minutes,
          voiceEnabled,
          timezone: tz,
          script,
        },
      });

      const when = scheduledAt
        ? new Date(scheduledAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : null;
      const note =
        when && voiceEnabled && normalizedPhone
          ? `Saved — we will call ${normalizedPhone} on ${when} (${tz}) for ${minutes} minutes.`
          : when
            ? `Saved — ${minutes} minutes on ${when} (${tz}). No call: turn voice on to be called.`
            : `Saved — a ${minutes}-minute session, in ${tz} time.`;
      setSavedNote(note);
      toast.success(note);
      const { settings } = await statusFn({});
      setCallStatus(settings);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your settings.";
      setSavedNote(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  /** Sends tonight's written draft as a text message to the saved number. */
  async function textDraft() {
    if (!canText) return;
    setTexting(true);
    setSavedNote(null);
    try {
      const script = lines ?? (await generateScript());
      setLines((prev) => prev ?? script);
      await sendTextFn({
        data: {
          phoneNumber: normalizedPhone,
          durationMinutes: minutes,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          script,
        },
      });
      const note = `Draft texted to ${normalizedPhone}.`;
      setSavedNote(note);
      toast.success(note);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "The text could not be sent.";
      setSavedNote(msg);
      toast.error(msg);
    } finally {
      setTexting(false);
    }
  }




  async function buildTonight() {
    if (!answers || building || !avatarComplete) return;
    setBuilding(true);
    setError(null);
    try {
      const parsed = await generateScript();
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
            <span
              className={`text-xs ${scheduleError ? "text-destructive" : "text-[color:var(--muted-foreground)]"}`}
            >
              {scheduleError ??
                (timeZone ? `Your local time · ${timeZone}` : "Detecting your timezone…")}
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
            <span
              className={`text-xs ${phoneError || missingPhone ? "text-destructive" : "text-[color:var(--muted-foreground)]"}`}
            >
              {phoneError ?? missingPhone ?? "Check this is correct to receive the guided call."}
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
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={saveDashboard}
            disabled={!canSave}
            className="rounded-full border border-[color:var(--ink)] px-5 py-2 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[color:var(--ink)]"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <button
            onClick={textDraft}
            disabled={!canText}
            title={textBlockedReason ?? undefined}
            className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm transition hover:border-[color:var(--ink)] disabled:opacity-40"
          >
            {texting ? "Sending the draft…" : "Text me the meditation draft"}
          </button>
          {savedNote && (
            <span className="text-xs text-[color:var(--muted-foreground)]">{savedNote}</span>
          )}
        </div>
        {textBlockedReason && (
          <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">{textBlockedReason}</p>
        )}

        {callStatus && (
          <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
            {callStatus.status === "scheduled" && callStatus.voice_enabled && callStatus.scheduled_at
              ? `Call queued for ${new Date(callStatus.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
              : callStatus.status === "sent"
                ? `Last call placed ${callStatus.last_call_at ? new Date(callStatus.last_call_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "recently"}.`
                : callStatus.status === "failed"
                  ? `Last call did not go through. ${callStatus.last_error ?? ""}`
                  : "No call scheduled."}
          </p>
        )}

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

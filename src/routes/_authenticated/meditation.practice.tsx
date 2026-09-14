import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { synthesizeSpeech } from "@/lib/voice";
import {
  cancelMantraCall,
  getMantraCall,
  scheduleMantraCall,
  type MantraCall,
} from "@/lib/mantra-call.functions";

export const Route = createFileRoute("/_authenticated/meditation/practice")({
  head: () => ({
    meta: [
      { title: "Mantra Practice, InwardWise" },
      {
        name: "description",
        content:
          "Write your own prayer or intention and repeat it slowly, as many times as you choose.",
      },
      { property: "og:title", content: "Mantra Practice" },
      {
        property: "og:description",
        content: "Write your own prayer or intention and repeat it slowly, as many times as you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MeditationPractice,
});

const REPEAT_OPTIONS = [5, 12, 21, 33, 54, 108];
/** Gap after a spoken line, and the longest we ever wait for one repetition. */
const PAUSE_MS = 3000;
const MAX_LINE_MS = 30000;

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MeditationPractice() {
  const vault = useAvatarVault();
  const scheduleFn = useServerFn(scheduleMantraCall);
  const statusFn = useServerFn(getMantraCall);
  const cancelFn = useServerFn(cancelMantraCall);

  const [mantraText, setMantraText] = useState("");
  const [mantraRepeats, setMantraRepeats] = useState(12);
  const [mantraRunning, setMantraRunning] = useState(false);
  const [mantraCount, setMantraCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipRef = useRef<{ text: string; url: string } | null>(null);
  const runIdRef = useRef(0);

  // Call scheduling
  const [phone, setPhone] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [saving, setSaving] = useState(false);
  const [callStatus, setCallStatus] = useState<MantraCall | null>(null);

  useEffect(() => setTimeZone(detectTimeZone()), []);

  useEffect(() => {
    if (vault.status !== "unlocked") return;
    let cancelled = false;
    void statusFn({}).then(({ call }) => {
      if (cancelled || !call) return;
      setCallStatus(call);
      setPhone(call.phone_number ?? "");
      if (call.status === "scheduled") setScheduledAt(toLocalInput(call.scheduled_at));
      if (call.mantra_text && !mantraText) setMantraText(call.mantra_text);
      if (call.repeats) setMantraRepeats(call.repeats);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status]);

  function stopAudio() {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
    }
  }

  useEffect(
    () => () => {
      runIdRef.current += 1;
      stopAudio();
      if (clipRef.current) URL.revokeObjectURL(clipRef.current.url);
    },
    [],
  );

  /** Fetch the spoken line once per text, then reuse it for every repetition. */
  async function clipFor(text: string): Promise<string> {
    if (clipRef.current?.text === text) return clipRef.current.url;
    const blob = await synthesizeSpeech(text);
    if (clipRef.current) URL.revokeObjectURL(clipRef.current.url);
    const url = URL.createObjectURL(blob);
    clipRef.current = { text, url };
    return url;
  }

  /** Play one repetition and always resolve, so the count never stalls. */
  function playOnce(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        resolve();
      };
      const guard = setTimeout(done, MAX_LINE_MS);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
  }

  async function runMantra(text: string, repeats: number) {
    const runId = ++runIdRef.current;
    let url: string | null = null;
    try {
      url = await clipFor(text);
    } catch {
      url = null; // read-only fallback, the lines still advance on a timer
    }
    for (let i = 0; i < repeats; i++) {
      if (runIdRef.current !== runId) return;
      setMantraCount(i);
      if (url) await playOnce(url);
      else await new Promise((r) => setTimeout(r, 8000));
      if (runIdRef.current !== runId) return;
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
    if (runIdRef.current !== runId) return;
    setMantraCount(repeats);
    setMantraRunning(false);
    toast.success(`Mantra complete, ${repeats} repetitions.`);
  }

  function startMantra() {
    const text = mantraText.trim();
    if (!text) return;
    stopAudio();
    setMantraCount(0);
    setMantraRunning(true);
    void runMantra(text, mantraRepeats);
  }

  function stopMantra() {
    runIdRef.current += 1;
    stopAudio();
    setMantraRunning(false);
  }

  async function speakOnce(text: string) {
    try {
      stopAudio();
      await playOnce(await clipFor(text));
    } catch {
      /* silent, the practice works read-only too */
    }
  }

  const normalizedPhone = phone.replace(/[\s()-]/g, "").trim();
  const phoneError =
    normalizedPhone.length > 0 && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
      ? "Use the international format, e.g. +14155550123."
      : null;
  const timeError =
    scheduledAt && new Date(scheduledAt).getTime() <= Date.now()
      ? "Choose a time in the future."
      : null;
  const canSchedule =
    !!mantraText.trim() &&
    normalizedPhone.length > 0 &&
    !!scheduledAt &&
    !phoneError &&
    !timeError &&
    !saving;

  async function saveCall() {
    if (!canSchedule) return;
    setSaving(true);
    try {
      await scheduleFn({
        data: {
          phoneNumber: normalizedPhone,
          mantraText: mantraText.trim(),
          repeats: mantraRepeats,
          scheduledAt: new Date(scheduledAt).toISOString(),
          timezone: timeZone || detectTimeZone(),
        },
      });
      const { call } = await statusFn({});
      setCallStatus(call);
      toast.success(
        `We will call ${normalizedPhone} on ${new Date(scheduledAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })} and repeat your mantra ${mantraRepeats} times.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The call could not be scheduled.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelCall() {
    setSaving(true);
    try {
      await cancelFn({});
      const { call } = await statusFn({});
      setCallStatus(call);
      setScheduledAt("");
      toast.success("Scheduled mantra call cancelled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The call could not be cancelled.");
    } finally {
      setSaving(false);
    }
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
          Your mantra practice is built from the answers only you can unlock. They are
          decrypted in your browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(980px,calc(100%-2rem))] py-14 md:py-20">
      <Link
        to="/products/calm-mantra"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Calm &amp; Mantra
      </Link>

      <section className="mt-10 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Your own prayer</span>
        {!mantraRunning ? (
          <>
            <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
              Write a prayer, line or intention in your own words. It will be repeated back to
              you, slowly, as many times as you choose.
            </p>
            <textarea
              value={mantraText}
              onChange={(e) => setMantraText(e.target.value)}
              rows={3}
              placeholder="I am safe, and I let go of what I cannot carry."
              className="mt-5 w-full rounded-lg border border-[color:var(--rule)] bg-transparent p-4 text-base outline-none focus:border-[color:var(--royal)]"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="text-sm text-[color:var(--muted-foreground)]">Repetitions</label>
              <select
                value={mantraRepeats}
                onChange={(e) => setMantraRepeats(Number(e.target.value))}
                className="rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm"
              >
                {REPEAT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} times
                  </option>
                ))}
              </select>
              <button
                onClick={startMantra}
                disabled={!mantraText.trim()}
                className="rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Start Mantra
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="font-mono-cap mt-4 text-[color:var(--muted-foreground)]">
              {Math.min(mantraCount + 1, mantraRepeats)} / {mantraRepeats}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={mantraCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                className="font-display mx-auto mt-6 max-w-2xl text-[clamp(1.4rem,3.2vw,2.2rem)] leading-[1.25] tracking-tight"
              >
                {mantraText}
              </motion.p>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => void speakOnce(mantraText.trim())}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
              >
                Speak this line
              </button>
              <button
                onClick={stopMantra}
                className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-sm text-[color:var(--paper)]"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Hear it on a call</span>
        <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
          We can phone you at a date and time you choose and repeat the mantra above to you, the
          same number of times.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Date and time</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            />
            <span
              className={`text-xs ${timeError ? "text-destructive" : "text-[color:var(--muted-foreground)]"}`}
            >
              {timeError ?? (timeZone ? `Your local time · ${timeZone}` : "Detecting your timezone…")}
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
              className={`text-xs ${phoneError ? "text-destructive" : "text-[color:var(--muted-foreground)]"}`}
            >
              {phoneError ?? "The call may come from a number you don't recognise, please pick up."}
            </span>
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Repetitions</span>
            <p className="rounded-md border border-[color:var(--rule)] px-3 py-2 text-sm">
              {mantraRepeats} times
            </p>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Taken from the choice above.
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={saveCall}
            disabled={!canSchedule}
            className="rounded-full bg-[color:var(--royal)] px-6 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Schedule the call"}
          </button>
          {callStatus?.status === "scheduled" && (
            <button
              onClick={cancelCall}
              disabled={saving}
              className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm transition hover:border-[color:var(--ink)] disabled:opacity-40"
            >
              Cancel the call
            </button>
          )}
        </div>

        {callStatus && (
          <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
            {callStatus.status === "calling"
              ? "Calling you now."
              : callStatus.status === "scheduled" && callStatus.scheduled_at
                ? `Call queued for ${new Date(callStatus.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.${callStatus.last_error ? ` ${callStatus.last_error}` : ""}`
                : callStatus.status === "sent"
                  ? `Last call placed ${callStatus.last_call_at ? new Date(callStatus.last_call_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "recently"}.`
                  : callStatus.status === "failed"
                    ? `Last call did not go through. ${callStatus.last_error ?? ""}`
                    : "No call scheduled."}
          </p>
        )}

        <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
          To place the call, the mantra you schedule is stored on our side until the call is made,
          so keep anything you would rather not store out of that line.
        </p>
      </section>
    </div>
  );
}

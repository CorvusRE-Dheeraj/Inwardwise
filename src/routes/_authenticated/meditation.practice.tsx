import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { synthesizeSpeech } from "@/lib/voice";
import { formatTimeOfDay, pickRandom } from "@/lib/mantra-schedule";
import {
  addMantraSchedule,
  deleteMantra,
  deleteMantraSchedule,
  listMantraSchedules,
  listMantras,
  saveMantra,
  setMantraScheduleActive,
  type MantraItem,
  type MantraSchedule,
} from "@/lib/mantra-call.functions";

export const Route = createFileRoute("/_authenticated/meditation/practice")({
  head: () => ({
    meta: [
      { title: "Mantra Practice, InwardWise" },
      {
        name: "description",
        content:
          "Keep a set of your own prayers, repeat one slowly, and receive them by phone at the times you choose.",
      },
      { property: "og:title", content: "Mantra Practice" },
      {
        property: "og:description",
        content:
          "Keep a set of your own prayers, repeat one slowly, and receive them by phone at the times you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MeditationPractice,
});

/** Gap after a spoken line, and the longest we ever wait for one repetition. */
const PAUSE_MS = 3000;
const FALLBACK_LINE_MS = 12000;

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function MeditationPractice() {
  const vault = useAvatarVault();
  const listFn = useServerFn(listMantras);
  const saveFn = useServerFn(saveMantra);
  const removeFn = useServerFn(deleteMantra);
  const listSchedulesFn = useServerFn(listMantraSchedules);
  const addScheduleFn = useServerFn(addMantraSchedule);
  const toggleScheduleFn = useServerFn(setMantraScheduleActive);
  const removeScheduleFn = useServerFn(deleteMantraSchedule);

  // Library
  const [mantras, setMantras] = useState<MantraItem[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingMantra, setSavingMantra] = useState(false);

  // Practice
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [repeats, setRepeats] = useState(5);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [spokenText, setSpokenText] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipRef = useRef<{ text: string; url: string } | null>(null);
  const runIdRef = useRef(0);
  const startingRef = useRef(false);

  // Call times
  const [phone, setPhone] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("08:00");
  const [perCall, setPerCall] = useState(1);
  const [callRepeats, setCallRepeats] = useState(5);
  const [timeZone, setTimeZone] = useState("");
  const [schedules, setSchedules] = useState<MantraSchedule[]>([]);
  const [savingCall, setSavingCall] = useState(false);

  useEffect(() => setTimeZone(detectTimeZone()), []);

  const refreshSchedules = useCallback(async () => {
    const { schedules: rows } = await listSchedulesFn({});
    setSchedules(rows);
    const withPhone = rows.find((s) => s.phone_number);
    if (withPhone) setPhone((p) => p || withPhone.phone_number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vault.status !== "unlocked") return;
    let cancelled = false;
    void (async () => {
      const { mantras: rows } = await listFn({});
      if (cancelled) return;
      setMantras(rows);
      setSelectedId((id) => id ?? rows[0]?.id ?? null);
      await refreshSchedules();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status]);

  /* ------------------------------- playback ------------------------------- */

  function stopAudio() {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
      a.currentTime = 0;
      audioRef.current = null;
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

  /**
   * Play one repetition to its natural end. The safety timer is derived from
   * the clip's own length, so a long line is never cut off mid-sentence.
   */
  function playOnce(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      stopAudio();
      let settled = false;
      let guard: ReturnType<typeof setTimeout>;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        resolve();
      };
      const audio = new Audio(url);
      audioRef.current = audio;
      // Until the length is known, allow a generous window; then track it.
      guard = setTimeout(done, 120000);
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          clearTimeout(guard);
          guard = setTimeout(done, audio.duration * 1000 + 8000);
        }
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
  }

  async function runMantra(text: string, times: number) {
    const runId = ++runIdRef.current;
    let url: string | null = null;
    try {
      url = await clipFor(text);
    } catch {
      url = null; // read-only fallback, the lines still advance on a timer
    }
    if (runIdRef.current !== runId) return;
    for (let i = 0; i < times; i++) {
      if (runIdRef.current !== runId) return;
      setCount(i);
      if (url) await playOnce(url);
      else await new Promise((r) => setTimeout(r, FALLBACK_LINE_MS));
      if (runIdRef.current !== runId) return;
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
    if (runIdRef.current !== runId) return;
    setCount(times);
    setRunning(false);
    toast.success(`Mantra complete, ${times} repetitions.`);
  }

  async function startMantra() {
    if (running || startingRef.current) return; // a second press never doubles up
    const chosen = mantras.find((m) => m.id === selectedId) ?? mantras[0];
    const text = chosen?.text.trim();
    if (!text) {
      toast.error("Save a mantra first.");
      return;
    }
    startingRef.current = true;
    runIdRef.current += 1;
    stopAudio();
    setSpokenText(text);
    setCount(0);
    setRunning(true);
    try {
      await runMantra(text, repeats);
    } finally {
      startingRef.current = false;
    }
  }

  function stopMantra() {
    runIdRef.current += 1;
    stopAudio();
    setRunning(false);
  }

  async function speakOnce(text: string) {
    try {
      await playOnce(await clipFor(text));
    } catch {
      /* silent, the practice works read-only too */
    }
  }

  /* -------------------------------- library ------------------------------- */

  async function submitMantra() {
    const text = draft.trim();
    if (text.length < 3) return;
    setSavingMantra(true);
    try {
      await saveFn({ data: { id: editingId, text } });
      const { mantras: rows } = await listFn({});
      setMantras(rows);
      setSelectedId((id) => id ?? rows[0]?.id ?? null);
      setDraft("");
      setEditingId(null);
      toast.success(editingId ? "Mantra updated." : "Mantra saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The mantra could not be saved.");
    } finally {
      setSavingMantra(false);
    }
  }

  async function removeMantra(id: string) {
    try {
      await removeFn({ data: { id } });
      const { mantras: rows } = await listFn({});
      setMantras(rows);
      if (selectedId === id) setSelectedId(rows[0]?.id ?? null);
      if (editingId === id) {
        setEditingId(null);
        setDraft("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The mantra could not be removed.");
    }
  }

  /* ------------------------------ call times ------------------------------ */

  const normalizedPhone = phone.replace(/[\s()-]/g, "").trim();
  const phoneError =
    normalizedPhone.length > 0 && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
      ? "Use the international format, e.g. +14155550123."
      : null;
  const canAddCall =
    mantras.length > 0 && normalizedPhone.length > 0 && !phoneError && !!timeOfDay && !savingCall;

  async function addCallTime() {
    if (!canAddCall) return;
    setSavingCall(true);
    try {
      await addScheduleFn({
        data: {
          phoneNumber: normalizedPhone,
          timeOfDay,
          timezone: timeZone || detectTimeZone(),
          repeats: callRepeats,
          mantrasPerCall: perCall,
        },
      });
      await refreshSchedules();
      toast.success(`We will call you every day at ${formatTimeOfDay(timeOfDay)}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The call time could not be saved.");
    } finally {
      setSavingCall(false);
    }
  }

  async function toggleCall(row: MantraSchedule) {
    try {
      await toggleScheduleFn({ data: { id: row.id, active: !row.is_active } });
      await refreshSchedules();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That change could not be saved.");
    }
  }

  async function removeCall(id: string) {
    try {
      await removeScheduleFn({ data: { id } });
      await refreshSchedules();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The call time could not be removed.");
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
          Your mantra practice is built from the answers only you can unlock. They are decrypted in
          your browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  const selected = mantras.find((m) => m.id === selectedId) ?? mantras[0] ?? null;

  return (
    <div className="mx-auto w-[min(980px,calc(100%-2rem))] py-14 md:py-20">
      <Link
        to="/products/calm-mantra"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Calm &amp; Mantra
      </Link>

      {/* ------------------------------ library ------------------------------ */}
      <section className="mt-10 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Your mantras</span>
        <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
          Keep as many prayers, lines or intentions as you like. On a call, one or two are chosen at
          random, so the practice stays fresh.
        </p>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="I am safe, and I let go of what I cannot carry."
          className="mt-5 w-full rounded-lg border border-[color:var(--rule)] bg-transparent p-4 text-base outline-none focus:border-[color:var(--royal)]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={submitMantra}
            disabled={draft.trim().length < 3 || savingMantra}
            className="rounded-full bg-[color:var(--royal)] px-6 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {savingMantra ? "Saving…" : editingId ? "Update this mantra" : "Add to my mantras"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setDraft("");
              }}
              className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {mantras.length > 0 && (
          <ul className="mt-6 divide-y divide-[color:var(--rule)] border-t border-[color:var(--rule)]">
            {mantras.map((m) => (
              <li key={m.id} className="flex flex-wrap items-start gap-3 py-4">
                <input
                  type="radio"
                  name="selected-mantra"
                  checked={selected?.id === m.id}
                  onChange={() => setSelectedId(m.id)}
                  className="mt-1"
                  aria-label="Practise this mantra"
                />
                <p className="min-w-[12rem] flex-1 text-sm">{m.text}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => void speakOnce(m.text)}
                    className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-xs"
                  >
                    Hear
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(m.id);
                      setDraft(m.text);
                    }}
                    className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void removeMantra(m.id)}
                    className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-xs text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ----------------------------- practice ----------------------------- */}
      <section className="mt-8 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Practise now</span>
        {!running ? (
          <>
            <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
              {selected
                ? "The mantra you selected above will be repeated back to you, slowly."
                : "Add a mantra above to begin."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="text-sm text-[color:var(--muted-foreground)]" htmlFor="repeats">
                Repetitions
              </label>
              <input
                id="repeats"
                type="number"
                min={1}
                max={108}
                value={repeats}
                onChange={(e) =>
                  setRepeats(Math.min(108, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-24 rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm"
              />
              <button
                onClick={() => void startMantra()}
                disabled={!selected}
                className="rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Start Mantra
              </button>
              {mantras.length > 1 && (
                <button
                  onClick={() => setSelectedId(pickRandom(mantras, 1)[0]?.id ?? null)}
                  className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
                >
                  Pick one at random
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="font-mono-cap mt-4 text-[color:var(--muted-foreground)]">
              {Math.min(count + 1, repeats)} / {repeats}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={count}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                className="font-display mx-auto mt-6 max-w-2xl text-[clamp(1.4rem,3.2vw,2.2rem)] leading-[1.25] tracking-tight"
              >
                {spokenText}
              </motion.p>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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

      {/* ---------------------------- call times ---------------------------- */}
      <section className="mt-8 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Hear it on a call</span>
        <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
          Add as many times of day as you like. Each one repeats every day, and one or two of your
          mantras are chosen at random for that call.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Time of day</span>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            />
            <span className="text-xs text-[color:var(--muted-foreground)]">
              {timeZone ? `Your local time · ${timeZone}` : "Detecting your timezone…"}
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
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Repetitions</span>
            <input
              type="number"
              min={1}
              max={108}
              value={callRepeats}
              onChange={(e) =>
                setCallRepeats(Math.min(108, Math.max(1, Number(e.target.value) || 1)))
              }
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            />
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Each mantra is repeated this many times.
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">
              Mantras per call
            </span>
            <select
              value={perCall}
              onChange={(e) => setPerCall(Number(e.target.value))}
              className="rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm"
            >
              <option value={1}>One, chosen at random</option>
              <option value={2}>Two, chosen at random</option>
            </select>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Picked freshly for every call.
            </span>
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={addCallTime}
            disabled={!canAddCall}
            className="rounded-full bg-[color:var(--royal)] px-6 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {savingCall ? "Saving…" : "Add this call time"}
          </button>
          {mantras.length === 0 && (
            <span className="ml-3 text-xs text-[color:var(--muted-foreground)]">
              Save at least one mantra first.
            </span>
          )}
        </div>

        {schedules.length > 0 && (
          <ul className="mt-6 divide-y divide-[color:var(--rule)] border-t border-[color:var(--rule)]">
            {schedules.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-4 text-sm">
                <span className="font-display text-lg">{formatTimeOfDay(s.time_of_day)}</span>
                <span className="text-[color:var(--muted-foreground)]">
                  every day · {s.mantras_per_call === 2 ? "two mantras" : "one mantra"} ·{" "}
                  {s.repeats} repetitions · {s.phone_number}
                </span>
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  {!s.is_active
                    ? "Paused."
                    : s.status === "calling"
                      ? "Calling you now."
                      : s.last_error
                        ? s.last_error
                        : s.last_call_at
                          ? `Last call ${new Date(s.last_call_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
                          : "Waiting for the first call."}
                </span>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => void toggleCall(s)}
                    className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-xs"
                  >
                    {s.is_active ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => void removeCall(s.id)}
                    className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-xs text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-[color:var(--muted-foreground)]">
          To place the calls, the mantras you save are stored on our side, so keep anything you
          would rather not store out of them.
        </p>
      </section>
    </div>
  );
}

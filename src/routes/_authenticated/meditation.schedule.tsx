import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { useAvatarVault } from "@/lib/avatar-vault";
import { decryptText } from "@/lib/avatar-crypto";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { SESSION_MINUTE_OPTIONS, linesPerSetFor, type PrayerLine } from "@/lib/meditation";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { buildMeditationPrompt, parseMeditationLines } from "@/lib/meditation-prompt";
import { toast } from "sonner";
import {
  getMeditationSettings,
  getMeditationCallLogs,
  saveMeditationSettings,
  type MeditationCallLog,
  type MeditationSettings,
} from "@/lib/meditation-settings.functions";
import { sendMeditationText } from "@/lib/meditation-sms.functions";
import { ProductName } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/_authenticated/meditation/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule Your Calm Session, InwardWise" },
      {
        name: "description",
        content:
          "Choose when your guided calm session happens, how long it runs, and how it reaches you.",
      },
      { property: "og:title", content: "Schedule Your Calm Session" },
      {
        property: "og:description",
        content: "Pick the time, the length and the voice for tonight's practice.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MeditationSchedule,
});

/** Format an ISO timestamp for a datetime-local input in the user's LOCAL time. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function MeditationSchedule() {
  const chatFn = useServerFn(chatWithAvatar);
  const saveSettingsFn = useServerFn(saveMeditationSettings);
  const statusFn = useServerFn(getMeditationSettings);
  const callLogsFn = useServerFn(getMeditationCallLogs);
  const sendTextFn = useServerFn(sendMeditationText);

  const vault = useAvatarVault();

  const [answers, setAnswers] = useState<AvatarAnswers | null>(null);
  const [name, setName] = useState("");

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [minutes, setMinutes] = useState<number>(10);
  const [timeZone, setTimeZone] = useState<string>("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [texting, setTexting] = useState(false);
  const [callStatus, setCallStatus] = useState<MeditationSettings | null>(null);
  const [callLogs, setCallLogs] = useState<MeditationCallLog[]>([]);
  const [lines, setLines] = useState<PrayerLine[] | null>(null);
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
        hydratedRef.current = false;
        setAnswers({});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status, vault.key, vault.profile?.user_id]);

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

  useEffect(() => {
    if (vault.status !== "unlocked") return;
    let cancelled = false;
    void Promise.all([statusFn({}), callLogsFn({})]).then(([{ settings }, { logs }]) => {
      if (!cancelled) {
        setCallStatus(settings);
        setCallLogs(logs);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.status]);

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

  const normalizedPhone = phone.replace(/[\s()-]/g, "").trim();
  const phoneError =
    normalizedPhone.length > 0 && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
      ? "Use the international format, e.g. +44 7700 900123."
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

  const callAtSameTime =
    !!scheduledAt &&
    voiceEnabled &&
    callStatus?.status === "scheduled" &&
    !!callStatus.voice_enabled &&
    !!callStatus.scheduled_at &&
    new Date(callStatus.scheduled_at).getTime() === new Date(scheduledAt).getTime();
  const textBlockedReason: React.ReactNode =
    answers === null
      ? "Unlocking your answers…"
      : !avatarComplete
        ? <>Finish your <ProductName id="self" /> to receive the written draft ({answeredCount} of {totalQuestions} answered).</>
        : normalizedPhone.length === 0 || phoneError
          ? "Add a valid phone number to receive the draft by text."
          : callAtSameTime
            ? "A call is already scheduled for that exact time, the text cannot be scheduled for the same moment. Turn the call off or pick another time."
            : null;

  const canText = !textBlockedReason && !texting && !saving;

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
      const patch = {
        voice_enabled: voiceEnabled,
        phone_number: normalizedPhone || null,
        scheduled_call_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        timezone: tz,
        session_minutes: minutes,
      };
      await supabase.from("avatar_profiles").update(patch).eq("user_id", vault.profile.user_id);
      vault.setProfile({ ...vault.profile, ...patch } as typeof vault.profile);

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
          ? `Saved, we will call ${normalizedPhone} on ${when} (${tz}) for ${minutes} minutes.`
          : when
            ? `Saved, ${minutes} minutes on ${when} (${tz}). No call: turn voice on to be called.`
            : `Saved, a ${minutes}-minute session, in ${tz} time.`;
      setSavedNote(note);
      toast.success(note);
      const { settings } = await statusFn({});
      setCallStatus(settings);
      const { logs } = await callLogsFn({});
      setCallLogs(logs);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your settings.";
      setSavedNote(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

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

  if (vault.status === "loading") return <div className="min-h-[60vh]" />;

  if (vault.status !== "unlocked") {
    return (
      <>
        <SiteHeader />
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
      </>
    );
  }

  return (
    <div className="mx-auto w-[min(980px,calc(100%-2rem))] py-14 md:py-20">
      <SiteHeader />
      <Link
        to="/products/calm-mantra"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Calm &amp; Mantra
      </Link>

      <header className="mt-6">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">
          Volume III · The Schedule
        </span>
        <h1 className="font-display mt-3 text-[clamp(2rem,5.5vw,3.6rem)] leading-[1.03] tracking-tight">
          Choose when you&apos;ll <em className="italic text-[color:var(--royal)]">be calm</em>
        </h1>
        <p className="mt-5 max-w-xl text-[color:var(--muted-foreground)]">
          Set the time, the length of the session, and how it reaches you. When you are ready to
          practise, start the session itself.
        </p>
      </header>

      <section className="mt-12 rounded-xl border border-[color:var(--rule)] p-6 md:p-8">
        <div className="font-mono-cap text-[color:var(--muted-foreground)]">
          Meditation dashboard
        </div>
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
              Divided into four equal parts, {linesPerSetFor(minutes)} lines per prayer.
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 900123"
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
              {voiceEnabled ? "On, each line is spoken to you." : "Off, read the lines yourself."}
            </span>
            {voiceEnabled && (
              <span className="text-xs text-[color:var(--muted-foreground)]">
                The call may arrive from a number you don't recognise, please pick up.
              </span>
            )}
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
             title={typeof textBlockedReason === "string" ? textBlockedReason : undefined}
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
            {callStatus.status === "calling"
              ? "Calling you now. If it reaches voicemail we hang up and try again in a few minutes."
              : callStatus.status === "scheduled" && callStatus.voice_enabled && callStatus.scheduled_at
              ? `Call queued for ${new Date(callStatus.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.${callStatus.last_error ? ` ${callStatus.last_error}` : ""}`
              : callStatus.status === "sent"
                ? `Last call placed ${callStatus.last_call_at ? new Date(callStatus.last_call_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "recently"}.`
                : callStatus.status === "failed"
                  ? `Last call did not go through. ${callStatus.last_error ?? ""}`
                  : "No call scheduled."}
          </p>
        )}
      </section>

      <section className="mt-10 border-t border-[color:var(--rule)] pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono-cap text-[color:var(--royal)]">Self-Calm call history</div>
            <h2 className="font-display mt-2 text-2xl">Your recent calls</h2>
          </div>
          <button
            type="button"
            onClick={() => void callLogsFn({}).then(({ logs }) => setCallLogs(logs))}
            className="text-sm text-[color:var(--royal)] underline underline-offset-4"
          >
            Refresh
          </button>
        </div>
        {callLogs.length === 0 ? (
          <p className="mt-5 text-sm">No Self-Calm calls have been attempted yet.</p>
        ) : (
          <div className="mt-5 divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
            {callLogs.map((log) => {
              const happenedAt = log.placed_at ?? log.scheduled_at ?? log.created_at;
              const labels: Record<string, string> = {
                queued: "Queued",
                calling: "Calling now",
                completed: "Completed",
                unanswered: "Not answered",
                cancelled: "Cancelled",
                requeued: "Waiting to retry",
                failed: "Failed",
              };
              return (
                <div key={log.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <div className="font-medium">{labels[log.status] ?? log.status}</div>
                    <div className="mt-1 text-sm">
                      {new Date(happenedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      {` · ${log.duration_minutes} minutes · Attempt ${log.attempt_number}`}
                    </div>
                    {log.failure_reason && (
                      <p className="mt-1 text-sm text-[color:var(--royal)]">{log.failure_reason}</p>
                    )}
                  </div>
                  {log.completed_at && (
                    <div className="text-xs text-[color:var(--royal)]">
                      Updated {new Date(log.completed_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-xl border border-[color:var(--rule)] p-8 text-center">
        <p className="mx-auto max-w-md text-[color:var(--muted-foreground)]">
          Prefer to practise right now? Four lines — thank you, please forgive me, I am sorry, I love
          myself — each held for a minute, repeated as many times as you choose.
        </p>
        <Link
          to="/meditation/session"
          className="mt-6 inline-block rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white transition hover:opacity-90"
        >
          Start the session now
        </Link>
      </section>
    </div>
  );
}

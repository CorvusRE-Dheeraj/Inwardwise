import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ProductName } from "@/components/products/ProductChrome";
import {
  cancelConsultCall,
  getConsultCall,
  scheduleConsultCall,
  type ConsultCall,
} from "@/lib/avatar-call.functions";

export const Route = createFileRoute("/_authenticated/avatar/consult-schedule")({
  head: () => ({
    meta: [
      { title: "Schedule a Self Consultation Call, InwardWise" },
      {
        name: "description",
        content:
          "Book a spoken consultation with your InwardWise Self. Choose the time, the length and the focus, and the call comes to you.",
      },
      { property: "og:title", content: "Schedule a Self Consultation Call, InwardWise" },
      {
        property: "og:description",
        content: "A private reflective conversation, by phone, at a time you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConsultSchedule,
});

const MINUTE_OPTIONS = [10, 15, 20, 30];

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

function ConsultSchedule() {
  const loadFn = useServerFn(getConsultCall);
  const saveFn = useServerFn(scheduleConsultCall);
  const cancelFn = useServerFn(cancelConsultCall);

  const [phone, setPhone] = useState("");
  const [focus, setFocus] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [existing, setExisting] = useState<ConsultCall | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadFn({}).then(({ call }) => {
      if (cancelled) return;
      setExisting(call);
      if (call) {
        setPhone(call.phone_number ?? "");
        setFocus(call.focus ?? "");
        setScheduledAt(toLocalInput(call.scheduled_at));
        setMinutes(call.duration_minutes ?? 15);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedPhone = phone.replace(/[\s()-]/g, "").trim();
  const phoneError =
    normalizedPhone.length > 0 && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
      ? "Include your country code, e.g. +91 for India, +1 for the US."
      : null;
  const timeError =
    scheduledAt && new Date(scheduledAt).getTime() <= Date.now()
      ? "Choose a time in the future."
      : null;
  const canSave =
    !saving && !phoneError && !timeError && normalizedPhone.length > 0 && scheduledAt.length > 0;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      await saveFn({
        data: {
          phoneNumber: normalizedPhone,
          focus: focus.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes: minutes,
          timezone: detectTimeZone(),
        },
      });
      const { call } = await loadFn({});
      setExisting(call);
      toast.success("Your consultation call is scheduled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not schedule the call.");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    setSaving(true);
    try {
      await cancelFn({});
      const { call } = await loadFn({});
      setExisting(call);
      setScheduledAt("");
      toast.success("The scheduled call was cancelled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel the call.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-[min(880px,calc(100%-2rem))] px-2 pt-12 pb-16">
      <Link
        to="/avatar/consult"
        className="inline-flex items-center gap-2 font-mono-cap text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Back to consultation
      </Link>

      <header className="mt-6">
        <p className="font-mono-cap text-xs text-muted-foreground">
          Under <ProductName id="self" /> · Scheduled consultation
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Take your consultation as a call
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pick a time and your <ProductName id="self" /> will call you for a spoken reflection
          instead of a typed one. Your encrypted answers stay in your browser, so the call is guided
          by the focus you write below and by what you say during the conversation.
        </p>
      </header>

      <section className="mt-8 space-y-6 rounded-lg border border-[color:var(--rule)] bg-white p-6">
        <div>
          <label className="font-mono-cap text-xs text-muted-foreground" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            className="mt-2 w-full rounded-md border border-[var(--rule)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
          />
          {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
        </div>

        <div>
          <label className="font-mono-cap text-xs text-muted-foreground" htmlFor="when">
            Date and time
          </label>
          <input
            id="when"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-2 w-full rounded-md border border-[var(--rule)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
          />
          {timeError && <p className="mt-1 text-xs text-destructive">{timeError}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Times are in your local time zone ({detectTimeZone()}).
          </p>
        </div>

        <div>
          <span className="font-mono-cap text-xs text-muted-foreground">Length</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {MINUTE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  minutes === m
                    ? "border-royal bg-royal/10 text-foreground"
                    : "border-[var(--rule)] text-muted-foreground hover:text-foreground"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono-cap text-xs text-muted-foreground" htmlFor="focus">
            What should this consultation be about? (optional)
          </label>
          <textarea
            id="focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value.slice(0, 600))}
            rows={4}
            placeholder="In your own words, the situation, the choice, or the feeling you want to think through."
            className="mt-2 w-full resize-none rounded-md border border-[var(--rule)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Only what you type here is shared with the calling service. Nothing from your factor
            answers leaves your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={!canSave}
            className="ink-btn rounded-full px-6 py-2.5 text-sm font-medium hover:ink-btn-hover disabled:opacity-50"
          >
            {existing?.status === "scheduled" ? "Update the call" : "Schedule the call"}
          </button>
          {existing?.status === "scheduled" && (
            <button
              onClick={cancel}
              disabled={saving}
              className="rounded-full border border-[var(--rule)] px-6 py-2.5 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              Cancel it
            </button>
          )}
        </div>

        {loaded && existing && (
          <div className="rounded-md border border-[var(--rule)] bg-secondary/40 px-4 py-3 text-sm">
            {existing.status === "scheduled" && existing.scheduled_at && (
              <p>
                Scheduled for{" "}
                <strong>{new Date(existing.scheduled_at).toLocaleString()}</strong>. The call may
                arrive from a number you don&apos;t recognise, please pick up. Each scheduled
                session rings once.
              </p>
            )}
            {existing.status === "calling" && <p>The call is being placed now.</p>}
            {existing.status === "sent" && <p>Your last consultation call was completed.</p>}
            {existing.status === "cancelled" && <p>No call is currently scheduled.</p>}
            {existing.status === "failed" && (
              <p className="text-destructive">
                {existing.last_error ?? "The last call did not go through."}
              </p>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        A spoken consultation is an AI-assisted reflection, not medical, mental health, legal or
        financial advice, and not emergency support. If you are in crisis, contact a licensed
        professional or your local emergency service.
      </p>
    </div>
  );
}

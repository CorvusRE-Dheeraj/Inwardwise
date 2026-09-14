import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Headphones, Mail, MapPin, MessageSquare, RotateCw } from "lucide-react";
import {
  confirmConnectOnlyRead,
  getConnectOnlyState,
  resendConnectOnlyUnread,
  sendConnectOnlyStoryAudio,
  startConnectOnly,
  suggestConnectOnlyEvents,
  type ConnectOnlyState,
} from "@/lib/connect-only.functions";
import { CONNECT_ONLY_DISCLAIMER } from "@/lib/connect-only";
import { ProductName } from "@/components/products/ProductChrome";

const field =
  "w-full rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[13px] text-[color:var(--muted-foreground)]">{children}</span>;
}

export function ConnectOnly() {
  const start = useServerFn(startConnectOnly);
  const getState = useServerFn(getConnectOnlyState);
  const confirmRead = useServerFn(confirmConnectOnlyRead);
  const resend = useServerFn(resendConnectOnlyUnread);
  const storyAudio = useServerFn(sendConnectOnlyStoryAudio);
  const suggestEvents = useServerFn(suggestConnectOnlyEvents);

  const [prompt, setPrompt] = useState("");
  const [health, setHealth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ConnectOnlyState | null>(null);

  const [audioNote, setAudioNote] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [interests, setInterests] = useState("");
  const [events, setEvents] = useState<string | null>(null);
  const [eventNote, setEventNote] = useState<string | null>(null);

  useEffect(() => {
    getState({})
      .then((s) => {
        if (s.sessionId) {
          setState(s);
          setLocation(s.location ?? "");
          setAvailability(s.availability ?? "");
          setInterests(s.interests ?? "");
        }
      })
      .catch(() => undefined);
  }, [getState]);

  async function run<T>(fn: () => Promise<T>, after: (r: T) => void) {
    setBusy(true);
    setError(null);
    try {
      after(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const started = Boolean(state?.sessionId);

  return (
    <section className="mx-auto mt-14 w-[min(1100px,calc(100%-2rem))]">
      <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          § 00 · Connect only
        </div>
        <h2 className="font-display mt-3 text-2xl sm:text-3xl">
          If you only want to <ProductName id="connect" />
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
          If you do not want to make a decision, do not want a Self consultation, are not looking for
          meditation or mantra, or have not filled out the Self build questionnaire, write what is on
          your mind here. Nothing is shown on this page. What fits you is sent to you in small pieces,
          one at a time, and the next piece only arrives once you confirm you have read the one before.
        </p>

        {!started && (
          <div className="mt-6 space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Write what is going on for you, in your own words…"
              className={`${field} resize-y`}
            />
            <div>
              <Label>Anything about your health or circumstances we should keep in mind (optional)</Label>
              <input value={health} onChange={(e) => setHealth(e.target.value)} className={field} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email to receive the reading</Label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={field}
                />
              </div>
              <div>
                <Label>Phone for text and audio (optional)</Label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14155550123"
                  className={field}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              disabled={busy || prompt.trim().length < 8}
              onClick={() => {
                if (prompt.trim().length < 8) {
                  setError("Please write a little more about what is going on, at least a few words.");
                  return;
                }
                if (!email.trim() && !phone.trim()) {
                  setError("Please add an email address or a phone number so we can send it to you.");
                  return;
                }
                setError(null);
                run(
                  () =>
                    start({
                      data: {
                        prompt: prompt.trim(),
                        healthNotes: health.trim() || undefined,
                        contactEmail: email.trim(),
                        phoneNumber: phone.trim(),
                      },
                    }),
                  (s) => setState(s),
                );
              }}

              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
            >
              {busy ? "Preparing…" : "Send me something to read"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {started && state && (
          <div className="mt-7 space-y-6">
            {state.notes.length > 0 && (
              <ul className="space-y-1 text-[14px] text-[color:var(--royal)]">
                {state.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="rounded-md border border-[color:var(--rule)] p-5">
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                Your reading, one piece at a time
              </div>
              {state.pending ? (
                <>
                  <p className="mt-3 text-[15px] leading-relaxed">
                    Part {state.pending.sequence} has been sent to{" "}
                    {state.pending.channels.includes("email") ? "your email" : ""}
                    {state.pending.channels.length > 1 ? " and " : ""}
                    {state.pending.channels.includes("sms") ? "your phone" : ""}. It takes about{" "}
                    {state.pending.minutes} minute{state.pending.minutes === 1 ? "" : "s"} to read.
                    Nothing further is sent until you confirm.
                    {state.pending.sendCount > 1 && " It has been sent to you again."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      disabled={busy}
                      onClick={() =>
                        run(() => confirmRead({ data: { deliveryId: state.pending!.id } }), (s) => setState(s))
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> I have read it, send the next
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => run(() => resend({}), (s) => setState(s))}
                      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px]"
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Send it to me again
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[15px] leading-relaxed">
                  {state.libraryEmpty
                    ? "There is nothing available to send yet, and nothing has been invented in its place."
                    : "You are up to date. The next piece will be prepared for you shortly."}
                </p>
              )}
              <p className="mt-4 flex flex-wrap gap-4 text-[12px] text-[color:var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> {state.hasEmail ? "Email on" : "No email added"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> {state.hasPhone ? "Text on" : "No phone added"}
                </span>
                <span>
                  {state.delivered} read{state.total ? ` of ${state.total}` : ""}
                </span>
              </p>
            </div>

            <div className="rounded-md border border-[color:var(--rule)] p-5">
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                Hear someone else who has been there
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                A reviewed, anonymous story from another member, read aloud and sent to your phone.
              </p>
              <button
                disabled={busy}
                onClick={() =>
                  run(() => storyAudio({}), (r) => {
                    setAudioNote(r.note);
                    setAudioUrl(r.audioUrl);
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px]"
              >
                <Headphones className="h-3.5 w-3.5" /> Send me a story to listen to
              </button>
              {audioNote && <p className="mt-3 text-[13px] text-[color:var(--royal)]">{audioNote}</p>}
              {audioUrl && <audio controls src={audioUrl} className="mt-3 w-full" />}
            </div>

            <div className="rounded-md border border-[color:var(--rule)] p-5">
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                Something to go to near you
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Town or city</Label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
                </div>
                <div>
                  <Label>When are you free?</Label>
                  <input
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="weekday evenings"
                    className={field}
                  />
                </div>
                <div>
                  <Label>What do you enjoy?</Label>
                  <input
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="walking, books, music"
                    className={field}
                  />
                </div>
              </div>
              <button
                disabled={busy || location.trim().length < 2}
                onClick={() =>
                  run(
                    () =>
                      suggestEvents({
                        data: {
                          location: location.trim(),
                          availability: availability.trim() || undefined,
                          interests: interests.trim() || undefined,
                        },
                      }),
                    (r) => {
                      setEvents(r.suggestions);
                      setEventNote(r.note);
                    },
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px] disabled:opacity-60"
              >
                <MapPin className="h-3.5 w-3.5" /> Find something local
              </button>
              {eventNote && <p className="mt-3 text-[13px] text-[color:var(--royal)]">{eventNote}</p>}
              {events && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{events}</p>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-[12px] leading-relaxed text-[color:var(--muted-foreground)]">
          {CONNECT_ONLY_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

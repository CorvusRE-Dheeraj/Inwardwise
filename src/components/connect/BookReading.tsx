import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpen, CheckCircle2, Mail, MessageSquare, RotateCw } from "lucide-react";
import coverAsset from "@/assets/mind-it-cover.png";
import {
  listBookReads,
  matchBookSection,
  sendBookSection,
  type BookRead,
} from "@/lib/connect-book.functions";

const field =
  "w-full rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30";

/**
 * Connect Book. A prompt is matched to one section of the book, which opens on
 * its own screen and can be sent by email or text. Reading is tracked so an
 * unread section can be sent again.
 */
export function BookReading() {
  const match = useServerFn(matchBookSection);
  const send = useServerFn(sendBookSection);
  const list = useServerFn(listBookReads);


  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [current, setCurrent] = useState<BookRead | null>(null);
  const [history, setHistory] = useState<BookRead[]>([]);

  useEffect(() => {
    list({})
      .then((rows) => {
        setHistory(rows);
        const open = rows.find((r) => !r.readAt);
        if (open) setCurrent(open);
      })
      .catch(() => undefined);
  }, [list]);

  async function refresh() {
    try {
      setHistory(await list({}));
    } catch {
      /* noop */
    }
  }

  async function findSection() {
    const text = prompt.trim();
    if (text.length < 8) {
      setError("Please write a little more about what is going on.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await match({ data: { prompt: text } });
      setCurrent(res.read);
      setNote(res.note);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deliver(readId?: string) {
    const id = readId ?? current?.id;
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await send({
        data: { readId: id, contactEmail: email.trim(), phoneNumber: phone.trim() },
      });
      if (res.read && res.read.id === current?.id) setCurrent(res.read);
      setNote(res.note);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be sent just now.");
    } finally {
      setBusy(false);
    }
  }


  const unread = history.filter((r) => !r.readAt);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Prompt below what is going on, and a matched section is opened for you
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Write what is going on for you, in your own words…"
          className={`mt-4 resize-y ${field}`}
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          onClick={findSection}
          disabled={busy}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
        >
          {busy ? "Matching…" : "Find my section"} <ArrowRight className="h-4 w-4" />
        </button>
        {note && <p className="mt-4 text-[13px] text-[color:var(--royal)]">{note}</p>}
      </div>

      <div className="grid gap-8 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
        <img
          src={coverAsset}
          alt="Cover of the book Mind It! For Health and Happiness by Alex Freeman, Ph.D."
          width={1024}
          height={1536}
          loading="lazy"
          className="w-full max-w-[220px] rounded-md border border-[color:var(--rule)] shadow-sm"
        />
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">
            Mind It! <em className="italic text-[color:var(--royal)]">For Health and Happiness</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
            The habit of reading a whole book you have bought is dwindling. So sections of this book
            are made available to you in bite size, matched to what you write below, small enough to
            finish before the next one arrives.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
            Each section opens on its own screen, where you can also save or print it, and you can
            have it sent to your phone or email. Nothing new is sent until you confirm you have read
            the one you have, and anything left unread is sent to you again.
          </p>
        </div>
      </div>

      {current && (
        <div className="rounded-lg border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/5 p-6 sm:p-8">
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Your section
          </div>
          <h3 className="font-display mt-3 text-xl sm:text-2xl">{current.sectionTitle}</h3>
          <p className="mt-2 text-[13px] text-[color:var(--muted-foreground)]">
            About {current.minutes} minute{current.minutes === 1 ? "" : "s"} to read
            {current.readAt ? " · you marked this as read" : current.openedAt ? " · opened" : ""}
          </p>

          <a
            href={`${import.meta.env.BASE_URL}connect/reading/${current.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)]"
          >
            <BookOpen className="h-3.5 w-3.5" /> Open it on its own screen
          </a>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-[13px] text-[color:var(--muted-foreground)]">
                Email to send it to
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={field}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] text-[color:var(--muted-foreground)]">
                Phone for a text message
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900123"
                className={field}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => deliver()}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 py-2.5 text-[13px] disabled:opacity-60"
            >
              <Mail className="h-3.5 w-3.5" /> Send it to me
            </button>
            {current.sendCount > 0 && (
              <button
                onClick={() => deliver()}
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px] disabled:opacity-60"
              >
                <RotateCw className="h-3.5 w-3.5" /> Send it again
              </button>
            )}
          </div>
          {current.sendCount > 0 && (
            <p className="mt-4 flex flex-wrap gap-4 text-[12px] text-[color:var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3" /> Sent {current.sendCount} time
                {current.sendCount === 1 ? "" : "s"}
              </span>
              {current.lastSentAt && <span>Last sent {new Date(current.lastSentAt).toLocaleString()}</span>}
            </p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            What has been sent, and what you have read
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
            A section counts as read only when you confirm it on its own screen with "I have read
            this". Until you do, it stays open here, no new section is matched over the top of it,
            and you can have the very same section sent to you again with "Send this again" — it
            goes to the email or phone number above.
          </p>
          <ul className="mt-5 divide-y divide-[color:var(--rule)]">
            {history.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-[14px]">{r.sectionTitle}</span>
                <span className="inline-flex flex-wrap items-center gap-3 text-[12px] text-[color:var(--muted-foreground)]">
                  {r.readAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> read{" "}
                      {new Date(r.readAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <>
                      <span>{r.openedAt ? "opened, not confirmed as read" : "not opened yet"}</span>
                      <a
                        href={`${import.meta.env.BASE_URL}connect/reading/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-[color:var(--ink)]"
                      >
                        Open it
                      </a>
                      <button
                        onClick={() => deliver(r.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ink)] px-3 py-1 text-[color:var(--ink)] disabled:opacity-60"
                      >
                        <RotateCw className="h-3 w-3" /> Send this again
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {unread.length > 0 && (
            <p className="mt-4 text-[13px] text-[color:var(--royal)]">
              {unread.length} section{unread.length === 1 ? "" : "s"} still waiting to be read.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

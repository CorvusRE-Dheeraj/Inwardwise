import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  getBookSection,
  markBookSectionRead,
  type BookSection,
} from "@/lib/connect-book.functions";
import { ReflectionNote } from "@/components/connect/ReflectionNote";


export const Route = createFileRoute("/_authenticated/connect/reading/$readId")({
  head: () => ({
    meta: [
      { title: "Your reading | InwardWise Connect" },
      { name: "description", content: "A single section of the book, matched to what you wrote." },
      { property: "og:title", content: "Your reading | InwardWise Connect" },
      { property: "og:description", content: "One short section, small enough to finish." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReadingScreen,
});

function ReadingScreen() {
  const { readId } = useParams({ from: "/_authenticated/connect/reading/$readId" });
  const load = useServerFn(getBookSection);
  const markRead = useServerFn(markBookSectionRead);

  const [section, setSection] = useState<BookSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [readAt, setReadAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load({ data: { readId } })
      .then((s) => {
        setSection(s);
        setReadAt(s?.readAt ?? null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [load, readId]);

  return (
    <AppShell>
      <div className="mx-auto w-[min(760px,calc(100%-2rem))] pt-12 pb-16 md:pt-16">
        <Link
          to="/connect/book"
          className="inline-flex items-center gap-2 font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
        >
          <ArrowLeft className="h-3 w-3" /> Connect Book
        </Link>
        <div className="hairline mt-4" />

        {loading && (
          <p className="mt-10 text-[15px] text-[color:var(--muted-foreground)]">Opening…</p>
        )}

        {!loading && !section && (
          <p className="mt-10 text-[15px] text-[color:var(--muted-foreground)]">
            This section is no longer available. Write your prompt again on Connect Book to be
            matched with another one.
          </p>
        )}

        {section && (
          <>
            <div className="font-mono-cap mt-8 text-[10px] text-[color:var(--muted-foreground)]">
              Mind It! · For Health and Happiness
            </div>
            <h1 className="font-display mt-3 text-[clamp(1.9rem,5vw,3rem)] leading-[1.05] tracking-tight">
              {section.title}
            </h1>
            <p className="mt-3 text-[13px] text-[color:var(--muted-foreground)]">
              About {section.minutes} minute{section.minutes === 1 ? "" : "s"} to read
            </p>

            <article className="mt-8 space-y-5 text-[17px] leading-[1.75]">
              {section.content.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </article>

            <div className="mt-10 flex flex-wrap gap-3 print:hidden">
              <button
                disabled={busy || Boolean(readAt)}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await markRead({ data: { readId } });
                    setReadAt(r.readAt);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {readAt ? "Marked as read" : "I have read this"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-3 text-[13px]"
              >
                <Printer className="h-3.5 w-3.5" /> Save or print as PDF
              </button>
            </div>

            <div className="mt-12 print:hidden">
              <ReflectionNote readId={readId} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

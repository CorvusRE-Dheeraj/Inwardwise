import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Quote, MessageSquarePlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Decision Philosophy" },
      {
        name: "description",
        content:
          "Read what early users are saying about the Decision Philosophy framework.",
      },
      { property: "og:title", content: "Testimonials — Decision Philosophy" },
      { property: "og:description", content: "Authentic feedback from people who used the framework." },
    ],
  }),
  component: Testimonials,
});

type FeedbackRow = {
  id: string;
  author_name: string | null;
  improved: string | null;
  paid: string | null;
  recommend: string | null;
  suggestions: string | null;
  created_at: string;
};

const staticTestimonials = [
  {
    id: "static-1",
    time: "8:31 AM, June 14th, 2026",
    author: "Nar…..",
    quote:
      "Hi Alex Good morning Is it okay if I share this site my friends and family? I am so impressed with the website I thought of sharing with my extended human network",
  },
];

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function Testimonials() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("feedback")
      .select("id, author_name, improved, paid, recommend, suggestions, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (cancelled) return;
        setRows((data as FeedbackRow[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Testimonials</p>
            <h1 className="font-display mt-2 text-4xl md:text-5xl">What people are saying</h1>
          </div>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Share your feedback
          </Link>
        </div>

        <div className="mt-10 space-y-6">
          {staticTestimonials.map((t) => (
            <TestimonialCard key={t.id} time={t.time} author={t.author} quote={t.quote} />
          ))}

          {loading && (
            <div className="text-sm text-muted-foreground">Loading community feedback…</div>
          )}

          {!loading && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-glass-border p-6 text-center text-sm text-muted-foreground">
              No community feedback yet. Be the first to{" "}
              <Link to="/feedback" className="text-accent hover:underline">
                share yours
              </Link>
              .
            </div>
          )}

          {rows.map((row) => (
            <FeedbackCard key={row.id} row={row} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-glass-border p-5 text-center text-sm text-muted-foreground">
          Any and all spelling and grammar mistakes will not be corrected to preserve the authenticity of the feedback.
          It will be reproduced as is.
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/feedback"
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5"
          >
            Give Us Feedback
          </Link>
          <Link
            to="/decision"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Start a decision <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function TestimonialCard({
  time,
  author,
  quote,
}: {
  time: string;
  author: string;
  quote: string;
}) {
  return (
    <article className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground/5">
          <Quote className="h-5 w-5 text-accent" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground">{time}</div>
          <div className="mt-1 font-medium">By {author}</div>
          <blockquote className="mt-3 text-base leading-relaxed text-foreground/90">
            “{quote}”
          </blockquote>
        </div>
      </div>
    </article>
  );
}

function FeedbackCard({ row }: { row: FeedbackRow }) {
  const author = row.author_name?.trim() || "Anonymous";
  const chips = [
    row.improved && { label: "Improved decision", value: row.improved },
    row.paid && { label: "Would pay", value: row.paid },
    row.recommend && { label: "Would recommend", value: row.recommend },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground/5">
          <Quote className="h-5 w-5 text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">{formatTime(row.created_at)}</div>
          <div className="mt-1 font-medium">By {author}</div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c.label}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    c.value === "Yes"
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-glass-border text-muted-foreground"
                  }`}
                >
                  {c.label}: {c.value}
                </span>
              ))}
            </div>
          )}

          {row.suggestions && (
            <blockquote className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              “{row.suggestions}”
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
}

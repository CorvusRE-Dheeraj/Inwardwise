import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Objective Solution Framework" },
      {
        name: "description",
        content:
          "Read what early users are saying about the Objective Solution Framework.",
      },
      { property: "og:title", content: "Testimonials — Objective Solution Framework" },
      { property: "og:description", content: "Authentic feedback from people who used the framework." },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Testimonials</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">What people are saying</h1>

        <div className="mt-10 space-y-6">
          <TestimonialCard
            time="8:31 AM, June 14th, 2026"
            author="Nar….."
            quote="Hi Alex Good morning Is it okay if I share this site my friends and family? I am so impressed with the website I thought of sharing with my extended human network"
          />
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

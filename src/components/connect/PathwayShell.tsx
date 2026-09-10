import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

/**
 * Shared chrome for every Connect AI pathway page (/connect/book, /events, …).
 * Keeps each pathway visually part of Connect AI while giving it its own route.
 */
export function PathwayShell({
  eyebrow,
  title,
  tagline,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  tagline: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="mx-auto w-[min(1100px,calc(100%-2rem))] pt-12 md:pt-16">
          <Link
            to="/connect"
            className="inline-flex items-center gap-2 font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
          >
            <ArrowLeft className="h-3 w-3" /> Connect AI
          </Link>
          <div className="hairline mt-4" />
          <div className="font-mono-cap mt-8 text-[10px] text-[color:var(--muted-foreground)]">
            {eyebrow}
          </div>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.2rem,6vw,4rem)] leading-[1.02] tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl font-display text-[clamp(1.1rem,2.4vw,1.6rem)] italic leading-snug text-[color:var(--royal)]">
            {tagline}
          </p>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            {intro}
          </p>
        </div>
      </section>
      {children}
    </AppShell>
  );
}

export function PathwayCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[color:var(--rule)] p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function PathwaySection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-12 w-[min(1100px,calc(100%-2rem))] pb-16">{children}</section>
  );
}

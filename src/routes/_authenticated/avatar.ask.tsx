import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/avatar/ask")({
  head: () => ({
    meta: [
      { title: "Ask your Avatar — Inwardwise" },
      {
        name: "description",
        content:
          "Send a prompt to your Inner Avatar and receive suggestions drawn from your five dimensions.",
      },
      { property: "og:title", content: "Ask your Avatar — Inwardwise" },
      { property: "og:description", content: "A private mirror that answers in your interest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AvatarAsk,
});

function AvatarAsk() {
  return (
    <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← Avatar Design
      </Link>
      <div className="font-mono-cap mt-8 text-[10px] text-[color:var(--muted-foreground)]">
        § 03 · Avatar Processes
      </div>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
        Ask your <span className="italic text-[color:var(--royal)]">Inner Avatar</span>
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
        Once your five dimensions are complete, your Avatar will process prompts and return
        suggestions drawn from what it knows of you. This chapter is being written.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/avatar/consult"
          className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)]"
        >
          Open the current consultation →
        </Link>
        <Link
          to="/avatar"
          className="rounded-full border border-[color:var(--rule)] px-6 py-2.5 text-[13px]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

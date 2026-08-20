import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/avatar/ask")({
  head: () => ({
    meta: [
      { title: "Ask InwardWise Self — InwardWise" },
      {
        name: "description",
        content:
          "Send a prompt to your InwardWise Self and receive suggestions drawn from your five factors.",
      },
      { property: "og:title", content: "Ask InwardWise Self — InwardWise" },
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
        ← InwardWise Self Design
      </Link>
      <div className="font-mono-cap mt-8 text-[10px] text-[color:var(--muted-foreground)]">
        § 03 · InwardWise Self Processes
      </div>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
        Ask <span className="italic text-[color:var(--royal)]">InwardWise Self</span>
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)] text-justify">
        Your InwardWise Self is ready. Ask it anything that matters to you, about a decision, a
        relationship, a direction, or a recurring pattern. It will answer from the five factors you
        wrote, not from generic advice.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/avatar/consult"
          className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)]"
        >
          Open the current consultation →
        </Link>
        <Link
          to="/meditation"
          className="rounded-full border border-[color:var(--rule)] px-6 py-2.5 text-[13px]"
        >
          Meditation →
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

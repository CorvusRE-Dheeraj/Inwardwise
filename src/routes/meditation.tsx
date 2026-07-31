import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PRAYER_SETS } from "@/lib/meditation";

export const Route = createFileRoute("/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation — Connect to Your Inner Self | Decision Philosophy" },
      {
        name: "description",
        content:
          "A scientifically grounded, AI-guided four-prayer meditation that quiets the mind and connects you to your subconscious.",
      },
      { property: "og:title", content: "Meditation — Connect to Your Inner Self" },
      {
        property: "og:description",
        content: "Four prayers, written from your own answers, spoken before you sleep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Meditation,
});

function Meditation() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1280px,calc(100%-2rem))] py-20 md:py-28">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">
          Volume III · Meditation
        </span>
        <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] leading-[1.02] tracking-tight">
          Meditation — Connect to Your <em className="italic text-[color:var(--royal)]">Inner Self</em>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-[color:var(--muted-foreground)]">
          Scientifically developed meditation to quiet yourself and connect to your subconscious.
          Four prayers — forgiveness and thankfulness combined — completed each night with something
          true about your own life, drawn from the answers you wrote in your five dimensions.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/meditation/practice"
            className="inline-flex items-center gap-3 rounded-full bg-[color:var(--royal)] px-7 py-3.5 text-sm text-white transition hover:opacity-90"
          >
            Start meditation <span>→</span>
          </Link>
          <Link
            to="/avatar"
            className="inline-flex items-center gap-3 rounded-full border border-[color:var(--ink)] px-7 py-3.5 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            Answer your dimensions first <span>→</span>
          </Link>
        </div>

        <div className="mt-20 grid gap-px border-y border-[color:var(--rule)] md:grid-cols-4">
          {PRAYER_SETS.map((s) => (
            <div key={s.key} className="py-8 md:pr-8">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">
                Prayer {s.n}
              </span>
              <div className="font-display mt-3 text-2xl tracking-tight">{s.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                {s.invitation}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            ["Scheduling", "Choose the hour, and let the practice come to you."],
            ["Voice guided", "Each line spoken aloud, so you can close your eyes."],
            ["Private", "Written from answers only your PIN can unlock."],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="font-mono-cap text-[color:var(--muted-foreground)]">{k}</div>
              <p className="mt-2 text-sm text-[color:var(--ink)]">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation — Connect to Your Inner Self | Decision Philosophy" },
      {
        name: "description",
        content:
          "A scientifically developed, AI-guided meditation routine to quiet the mind and connect to your subconscious.",
      },
      { property: "og:title", content: "Meditation — Connect to Your Inner Self" },
      {
        property: "og:description",
        content: "Scientifically developed meditation to quiet yourself and connect to your subconscious.",
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
          The guided routine will be published here shortly.
        </p>
      </div>
    </AppShell>
  );
}

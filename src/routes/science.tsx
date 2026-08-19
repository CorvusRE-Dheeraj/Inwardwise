import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Science and Philosophy — Inwardwise" },
      { name: "description", content: "Science and Philosophy page for Inwardwise." },
      { property: "og:title", content: "Science and Philosophy — Inwardwise" },
      { property: "og:description", content: "Science and Philosophy page for Inwardwise." },
    ],
  }),
  component: Science,
});

function Science() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Science and Philosophy</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Science and Philosophy</h1>
        <p className="mt-8 text-lg text-muted-foreground">Contents on this page will be updated soon.</p>
      </div>
    </AppShell>
  );
}

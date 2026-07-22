import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Examples — Decision Philosophy" },
      { name: "description", content: "Examples of the Objective Solution Framework — content coming soon." },
    ],
  }),
  component: Examples,
});

function Examples() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Examples</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Coming soon</h1>
        <p className="mt-4 text-muted-foreground">
          Contents on this page will be updated soon.
        </p>
      </div>
    </AppShell>
  );
}

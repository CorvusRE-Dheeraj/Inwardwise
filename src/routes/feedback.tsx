import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "User Feedback, InwardWise" },
      {
        name: "description",
        content: "Share your feedback on the InwardWise framework.",
      },
      { property: "og:title", content: "User Feedback, InwardWise" },
      { property: "og:description", content: "Share your feedback on the InwardWise framework." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User Feedback</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Share your feedback</h1>
        <p className="mt-3 text-muted-foreground">
          Our feedback forms are being updated and will be available here soon.
        </p>
      </div>
    </AppShell>
  );
}

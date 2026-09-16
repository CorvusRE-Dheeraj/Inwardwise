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

const FORM_URL =
  "https://docs.google.com/forms/d/1GosZF-drvOFOjz1FFzFLxH3j0Kw0kiqrt2kEvZT4Kx4/viewform?embedded=true";

function Feedback() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1600px,calc(100%-2rem))]">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User Feedback</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Share your feedback</h1>
        <p className="mt-3 text-muted-foreground">
          Tell us what is working and what is not — your answers help us improve InwardWise.
        </p>
        <div className="mt-8 overflow-hidden">
          <iframe
            src={FORM_URL}
            title="InwardWise feedback form"
            className="h-[1150px] w-full rounded-lg border border-[color:var(--rule)] bg-white md:-ml-[10%] md:h-[1000px] md:w-[120%] md:origin-top md:scale-[1.2]"
            loading="lazy"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </AppShell>
  );
}

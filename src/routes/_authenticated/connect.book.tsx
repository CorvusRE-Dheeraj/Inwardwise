import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell, PathwaySection } from "@/components/connect/PathwayShell";
import { BookReading } from "@/components/connect/BookReading";

export const Route = createFileRoute("/_authenticated/connect/book")({
  head: () => ({
    meta: [
      { title: "Connect Book | InwardWise" },
      {
        name: "description",
        content:
          "Sections of Mind It! For Health and Happiness, matched to what you write and sent to you in pieces small enough to finish.",
      },
      { property: "og:title", content: "Connect Book | InwardWise" },
      { property: "og:description", content: "Matched reading, in pieces small enough to finish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookPathway,
});

function BookPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={
        <>
          Connect <em className="italic text-[color:var(--royal)]">Book</em>
        </>
      }
      tagline="Reading that fits what you are living through."
      intro="Book excerpts are made available based on your prompt. These days the habit of reading a purchased book is dwindling, so instead sections are made available to you in bite size, to read and finish before you receive the next one."
    >
      <PathwaySection>
        <BookReading />
      </PathwaySection>
    </PathwayShell>
  );
}

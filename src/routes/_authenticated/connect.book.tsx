import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell, PathwaySection } from "@/components/connect/PathwayShell";
import { BookReading } from "@/components/connect/BookReading";
import { ReflectionNote } from "@/components/connect/ReflectionNote";

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
      intro="Write what is going on and a matched section of the book opens on its own screen, and can be sent to you by email or text. Nothing further arrives until you confirm you have read it, and anything left unread is sent again."
    >
      <PathwaySection>
        <BookReading />
        <div className="mt-10">
          <ReflectionNote />
        </div>
      </PathwaySection>
    </PathwayShell>
  );
}

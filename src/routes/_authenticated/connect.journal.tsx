import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell, PathwaySection } from "@/components/connect/PathwayShell";
import { ReflectionNote } from "@/components/connect/ReflectionNote";

export const Route = createFileRoute("/_authenticated/connect/journal")({
  head: () => ({
    meta: [
      { title: "Connect Journal | InwardWise" },
      {
        name: "description",
        content:
          "Journal your observations and thoughts, written or spoken, kept private to you so InwardWise keeps up with how your outlook shifts.",
      },
      { property: "og:title", content: "Connect Journal | InwardWise" },
      {
        property: "og:description",
        content: "Your thoughts after reading, watching or encountering anything, kept private.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: JournalPathway,
});

function JournalPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={
        <>
          Connect <em className="italic text-[color:var(--royal)]">Journal</em>
        </>
      }
      tagline="Your thoughts, in your own words, kept private to you."
      intro="All of your observations and thoughts after reading, watching or encountering anything, journal them here. Based on that, AI learns your thought processes and your shifted outlook and keeps up with you, with the goal of helping you with a deeper understanding of yourself and your decision making, and wants to see you happier. We would not have it any other way."
    >
      <PathwaySection>
        <ReflectionNote />
      </PathwaySection>
    </PathwayShell>
  );
}

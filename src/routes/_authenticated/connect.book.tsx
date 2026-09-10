import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell } from "@/components/connect/PathwayShell";
import { ConnectOnly } from "@/components/connect/ConnectOnly";

export const Route = createFileRoute("/_authenticated/connect/book")({
  head: () => ({
    meta: [
      { title: "Connect Book | InwardWise" },
      {
        name: "description",
        content:
          "Reading matched to what you describe, sent to you in small pieces, one at a time.",
      },
      { property: "og:title", content: "Connect Book | InwardWise" },
      { property: "og:description", content: "Matched reading, sent in small pieces." },
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
      title={<>Connect <em className="italic text-[color:var(--royal)]">Book</em></>}
      tagline="Reading that fits what you are living through."
      intro="Write what is going on and a matched section is sent to you, by email or text, in a piece short enough to finish. Nothing further arrives until you confirm you have read it, and anything unread is sent again."
    >
      <ConnectOnly />
    </PathwayShell>
  );
}

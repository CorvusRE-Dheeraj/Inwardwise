import { SongForThisMoment } from "@/components/connect/music/SongForThisMoment";
import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import { PathwayPrompt } from "@/components/connect/PathwayPrompt";

export const Route = createFileRoute("/_authenticated/connect/oneness")({
  head: () => ({
    meta: [
      { title: "Connect Oneness | InwardWise" },
      {
        name: "description",
        content:
          "A wider perspective that places your situation inside a larger picture, with one reflection prompt.",
      },
      { property: "og:title", content: "Connect Oneness | InwardWise" },
      { property: "og:description", content: "A wider view of your situation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OnenessPathway,
});

function OnenessPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={<>Connect <em className="italic text-[color:var(--royal)]">Oneness</em></>}
      tagline="You are one of many living the same thing."
      intro="Write what is happening and Connect places it inside a wider picture: what others in the same situation have found, a researched perspective piece, and one question to sit with."
    >
      <PathwaySection>
        <PathwayPrompt
          placeholder="Describe what you are facing, in your own words…"
          cta="Show me the wider view"
        >
          {(r) => (
            <>
              <PathwayCard className="bg-[color:var(--royal)]/[0.04]">
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  {r.category}
                </div>
                <h2 className="font-display mt-3 text-2xl sm:text-3xl">
                  You are <em className="italic text-[color:var(--royal)]">not alone</em>
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                  {r.aggregate ||
                    "This part of the community is still small, so there is no count to share yet."}
                </p>
              </PathwayCard>

              <PathwayCard>
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  {r.reading.eyebrow}
                </div>
                <h3 className="font-display mt-3 text-2xl italic text-[color:var(--royal)]">
                  {r.reading.title}
                </h3>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">
                  {r.reading.summary}
                </p>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">
                  {r.reading.body}
                </p>
              </PathwayCard>

              <PathwayCard>
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  One thing to sit with
                </div>
                <p className="mt-3 max-w-2xl text-[16px] leading-relaxed">{r.reflection}</p>
              </PathwayCard>
            </>
          )}
        </PathwayPrompt>
      </PathwaySection>
      <SongForThisMoment page="oneness" />
    </PathwayShell>
  );
}

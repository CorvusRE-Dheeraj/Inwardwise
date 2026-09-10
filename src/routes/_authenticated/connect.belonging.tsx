import { createFileRoute } from "@tanstack/react-router";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import { PathwayPrompt } from "@/components/connect/PathwayPrompt";

export const Route = createFileRoute("/_authenticated/connect/belonging")({
  head: () => ({
    meta: [
      { title: "Connect Belonging | InwardWise" },
      {
        name: "description",
        content:
          "Gentle, practical ways to feel less isolated, with one small next step you can take this week.",
      },
      { property: "og:title", content: "Connect Belonging | InwardWise" },
      { property: "og:description", content: "Small steps towards feeling at home again." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BelongingPathway,
});

function BelongingPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={<>Connect <em className="italic text-[color:var(--royal)]">Belonging</em></>}
      tagline="Less alone, one small step at a time."
      intro="Write what is going on and Connect suggests gentle ways back into company: someone to talk to, something to do, and one step small enough to actually take this week."
    >
      <PathwaySection>
        <PathwayPrompt
          placeholder="Tell Connect where you feel most alone at the moment…"
          cta="Show me a way in"
        >
          {(r) => (
            <>
              <PathwayCard>
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Talk to someone
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {r.support.map((s) => (
                    <div key={s.title} className="rounded-md border border-[color:var(--rule)] p-4">
                      <div className="text-[15px]">{s.title}</div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </PathwayCard>

              <PathwayCard>
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Something to do, with the same people, more than once
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {r.activities.map((a) => (
                    <div key={a.title} className="rounded-md border border-[color:var(--rule)] p-4">
                      <div className="text-[15px]">{a.title}</div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
                        {a.description}
                      </p>
                    </div>
                  ))}
                </div>
              </PathwayCard>

              <PathwayCard className="bg-[color:var(--royal)]/[0.04]">
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Your next step
                </div>
                <p className="mt-3 max-w-2xl text-[16px] leading-relaxed">{r.reflection}</p>
              </PathwayCard>
            </>
          )}
        </PathwayPrompt>
      </PathwaySection>
    </PathwayShell>
  );
}

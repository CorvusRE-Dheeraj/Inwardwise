import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/people/CharacterAvatar";
import { listPeopleLikeMe, type CharacterCard } from "@/lib/people.functions";

export const Route = createFileRoute("/_authenticated/people-like-me/")({
  head: () => ({
    meta: [
      { title: "People Like Me, fictional stories to explore | InwardWise" },
      {
        name: "description",
        content:
          "Explore fictional stories and situations that may feel familiar, with characters created only to help you reflect.",
      },
      { property: "og:title", content: "People Like Me | InwardWise" },
      {
        property: "og:description",
        content: "Fictional characters and situations you can explore at your own pace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PeopleLikeMePage,
});

function PeopleLikeMePage() {
  const load = useServerFn(listPeopleLikeMe);
  const [cards, setCards] = useState<CharacterCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    load({})
      .then(setCards)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Something went wrong."),
      );
  }, [load]);

  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-12 md:py-16">
        <h1 className="font-display mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] tracking-tight">
          Alex &amp; <em className="italic text-[color:var(--royal)]">Mary</em>
        </h1>

        {error && (
          <p className="mt-6 rounded-lg border border-[color:var(--rule)] p-4 text-sm">{error}</p>
        )}

        {!cards ? (
          <p className="mt-10 text-sm text-[color:var(--muted-foreground)]">Loading stories…</p>
        ) : cards.length === 0 ? (
          <p className="mt-10 text-sm text-[color:var(--muted-foreground)]">
            No stories have been published yet.
          </p>
        ) : (
          <StoryGroups cards={cards} />
        )}
      </div>
    </AppShell>
  );
}

function StoryGroups({ cards }: { cards: CharacterCard[] }) {
  const personalised = cards.filter((c) => c.match && c.scenario);
  const others = cards.filter((c) => !personalised.includes(c));

  return (
    <>
      <div className="mt-10 border-t border-[color:var(--rule)] pt-10">
        <h2 className="font-display mt-3 text-3xl">
          Use their InwardWise Self to <em className="italic text-[color:var(--royal)]">test drive</em>
        </h2>
      </div>
      {personalised.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Personalised for you
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {personalised.map((c) => (
              <StoryCard key={c.slug} card={c} highlight />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-12">
          {personalised.length > 0 && (
            <h2 className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              Other stories
            </h2>
          )}
          <div className="mt-5 grid gap-6 md:grid-cols-2">
          {others.map((c) => (
            <StoryCard key={c.slug} card={c} />
          ))}
          </div>
        </section>
      )}

    </>
  );
}

function StoryCard({ card: c, highlight = false }: { card: CharacterCard; highlight?: boolean }) {
  const isMary = c.slug === "mary";
  const isAlex = c.slug === "alex";
  const testDriveSummary = isMary || isAlex
    ? `${c.name} has completed ${isMary ? "her" : "his"} InwardWise Self build. ${isMary ? "She" : "He"} represents an average American youth. See how a prompt on ${isMary ? "her" : "his"} behalf feels when exploring InwardWise Self Aware.`
    : c.scenario?.summary ?? "A story is being prepared for this character.";

  return (
    <>
      <article
        className={`flex flex-col rounded-2xl border p-6 md:p-7 ${
          highlight
            ? "border-[color:var(--royal)]/40 bg-[color:var(--royal)]/[0.03]"
            : "border-[color:var(--rule)]"
        }`}
      >
                <div className="flex items-center gap-4">
                  <CharacterAvatar avatarKey={c.avatarKey} name={c.name} />
                  <div>
                    <h2 className="font-display text-2xl leading-tight">{c.name}</h2>
                    <div className="font-mono-cap mt-1 text-[10px] text-[color:var(--muted-foreground)]">
                      {c.shortLabel}
                    </div>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-[15px] leading-relaxed">
                  {testDriveSummary}
                </p>

                {c.scenario && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      to="/people-like-me/$slug"
                      params={{ slug: c.slug }}
                       search={{ mode: "story" }}
                      className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90"
                    >
                      Explore {c.name}'s story
                    </Link>
                    {(isMary || isAlex) && (
                      <Link
                        to="/people-like-me/$slug"
                        params={{ slug: c.slug }}
                        search={{ mode: "self-aware" }}
                        className="inline-flex min-h-11 items-center px-2 text-sm text-[color:var(--royal)] underline underline-offset-4"
                      >
                        {c.name}&apos;s Self Aware →
                      </Link>
                    )}
                    {c.progress && (
                      <span className="text-xs text-[color:var(--muted-foreground)]">
                        {c.progress.status === "completed"
                          ? "You have finished this story"
                          : `Scene ${c.progress.currentScene} of ${c.scenario.sceneCount}`}
                      </span>
                    )}
                  </div>
                )}
      </article>
    </>
  );
}

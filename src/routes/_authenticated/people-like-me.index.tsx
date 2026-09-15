import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/people/CharacterAvatar";
import { CharacterOutcomes } from "@/components/people/CharacterOutcomes";

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
        <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">
          My Journey · Illustrative profiles
        </div>
        <h1 className="font-display mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] tracking-tight">
          Alex &amp; <em className="italic text-[color:var(--royal)]">Mary</em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">
          Two fictional people whose situations you can explore, and whose examples show how InwardWise answers them.
        </p>

        <p className="mt-6 max-w-2xl rounded-lg border border-[color:var(--rule)] bg-[color:var(--royal)]/[0.04] p-4 text-sm leading-relaxed">
          Alex and Mary are fictional, illustrative characters. They do not represent real users or customer data.
        </p>

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
      <div className="mt-16 border-t border-[color:var(--rule)] pt-10">
        <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Existing interactive stories</div>
        <h2 className="font-display mt-3 text-3xl">
          Explore their <em className="italic text-[color:var(--royal)]">situations</em>
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">
          The existing stories and personal reflection features remain available below.
        </p>
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

      {cards.map((c) => (
        <div key={c.slug}>
          <CharacterOutcomes slug={c.slug} name={c.name} />
        </div>
      ))}
    </>
  );
}

function StoryCard({ card: c, highlight = false }: { card: CharacterCard; highlight?: boolean }) {
  return (
    <>
      <article
        className={`flex flex-col rounded-2xl border p-6 md:p-7 ${
          highlight
            ? "border-[color:var(--royal)]/40 bg-[color:var(--royal)]/[0.03]"
            : "border-[color:var(--rule)]"
        }`}
      >
                {c.match && (
                  <div className="mb-5 rounded-lg border border-[color:var(--royal)]/30 p-4">
                    <p className="text-sm leading-relaxed">
                      Some themes in this fictional scenario may feel familiar.
                    </p>
                    <div className="font-mono-cap mt-3 text-[10px] text-[color:var(--muted-foreground)]">
                      Shared themes
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {c.match.sharedThemes.map((t) => (
                        <li
                          key={t}
                          className="rounded-full bg-[color:var(--royal)]/10 px-3 py-1 text-xs text-[color:var(--royal)]"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
                      {c.match.recommendationReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <CharacterAvatar avatarKey={c.avatarKey} name={c.name} />
                  <div>
                    <h2 className="font-display text-2xl leading-tight">{c.name}</h2>
                    <div className="font-mono-cap mt-1 text-[10px] text-[color:var(--muted-foreground)]">
                      {c.shortLabel}
                    </div>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
                  {c.scenario?.summary ?? "A story is being prepared for this character."}
                </p>

                {c.themes.length > 0 && (
                  <div className="mt-5">
                    <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                      Themes
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {c.themes.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-xs text-[color:var(--muted-foreground)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {c.scenario && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      to="/people-like-me/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90"
                    >
                      Explore {c.name}'s story
                    </Link>
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

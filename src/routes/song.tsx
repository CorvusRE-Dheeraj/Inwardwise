import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Music } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SongHeading, SongLinks } from "@/components/connect/music/SongLinks";
import { decodeSongShare } from "@/lib/music";

/**
 * What someone sees when a member sends them a song. Public: no account is
 * needed to open it. Everything shown comes from the link itself.
 */
export const Route = createFileRoute("/song")({
  validateSearch: (search: Record<string, unknown>) => ({
    s: typeof search["s"] === "string" ? search["s"] : "",
  }),
  head: () => ({
    meta: [
      { title: "A song for you | InwardWise" },
      { name: "description", content: "Someone sent you a song through InwardWise Connect Music." },
      { property: "og:title", content: "A song for you | InwardWise" },
      {
        property: "og:description",
        content: "Sometimes a song says what we cannot put into words.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReceivedSong,
});

function ReceivedSong() {
  const { s } = Route.useSearch();
  const share = decodeSongShare(s);

  return (
    <AppShell>
      <div className="mx-auto w-[min(720px,calc(100%-2rem))] pt-12 pb-20 md:pt-20">
        <div className="font-mono-cap flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
          <Music className="h-3 w-3" /> InwardWise Connect Music
        </div>
        <div className="hairline mt-4" />

        {!share ? (
          <div className="mt-10">
            <h1 className="font-display text-[clamp(2rem,6vw,3.2rem)] leading-tight">
              This song link is incomplete
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
              Part of the link may have been cut off when it was copied. Ask the person who sent it
              to share it again.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display mt-10 text-[clamp(2rem,6vw,3.2rem)] leading-tight">
              {share.from ? (
                <>
                  <em className="italic text-[color:var(--royal)]">{share.from}</em> sent you a song
                </>
              ) : (
                <>A song for you</>
              )}
            </h1>

            {share.message && (
              <blockquote className="mt-6 border-l-2 border-[color:var(--royal)] pl-5 font-display text-[clamp(1.1rem,2.6vw,1.5rem)] italic leading-snug">
                “{share.message}”
              </blockquote>
            )}

            <div className="mt-8 rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
              <SongHeading song={share} />
              <div className="mt-5">
                <SongLinks song={share} />
              </div>
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
              Take a few minutes with it. Sometimes a song says what someone cannot put into words.
            </p>
          </>
        )}

        <div className="mt-12 border-t border-[color:var(--rule)] pt-8">
          <p className="text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
            InwardWise helps people understand themselves, decide better and feel less alone.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)]"
          >
            Discover InwardWise <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

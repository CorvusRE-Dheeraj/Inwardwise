import { SongForThisMoment } from "@/components/connect/music/SongForThisMoment";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Users } from "lucide-react";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import { PathwayPrompt, type PathwayAnalysis } from "@/components/connect/PathwayPrompt";
import { joinConnectGroupWaitlist } from "@/lib/connect.functions";

export const Route = createFileRoute("/_authenticated/connect/membership")({
  head: () => ({
    meta: [
      { title: "Connect Membership | InwardWise" },
      {
        name: "description",
        content:
          "Small moderated groups you can belong to over time, with what is expected of members and how to join.",
      },
      { property: "og:title", content: "Connect Membership | InwardWise" },
      { property: "og:description", content: "Groups you can be part of over time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MembershipPathway,
});

function Groups({ result }: { result: PathwayAnalysis }) {
  const join = useServerFn(joinConnectGroupWaitlist);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function request() {
    setBusy(true);
    try {
      const res = await join({ data: { category: result.category } });
      setNote(
        res.waitlisted
          ? "You are on the list. You will be told when a moderated group opens on this."
          : "No group is open on this yet. You will be told when one forms.",
      );
    } catch {
      setNote("We could not reach the list just now. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PathwayCard>
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Groups for {result.category}
        </div>
        {result.groups.length === 0 ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
            No group is currently open on this. Nothing has been invented in its place, but you can
            ask to be told when one forms.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {result.groups.map((g) => (
              <div key={g.id} className="rounded-md border border-[color:var(--rule)] p-4">
                <div className="text-[15px]">{g.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
                  {g.description}
                </p>
                <p className="mt-3 text-[12px] text-[color:var(--muted-foreground)]">
                  Up to {g.max_members} members
                  {g.starts_at ? ` · starts ${new Date(g.starts_at).toLocaleDateString()}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={request}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-60"
        >
          <Users className="h-3.5 w-3.5" /> {busy ? "Adding you…" : "Ask to join"}
        </button>
        {note && <p className="mt-3 text-[13px] text-[color:var(--royal)]">{note}</p>}
      </PathwayCard>

      <PathwayCard>
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          What being a member means
        </div>
        <ul className="mt-4 space-y-2 text-[15px] leading-relaxed">
          <li>· One topic, four to eight members, pseudonymous throughout.</li>
          <li>· Guided prompts, a moderator, and a defined start and end.</li>
          <li>· You are asked to turn up, listen first, and keep what is said inside the group.</li>
          <li>· Report, block and leave controls are available at any time.</li>
        </ul>
      </PathwayCard>
    </>
  );
}

function MembershipPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={<>Connect <em className="italic text-[color:var(--royal)]">Membership</em></>}
      tagline="Somewhere to return to, not just read."
      intro="Write what is going on and Connect looks for a moderated group of members working through something similar, tells you what is expected of members, and puts you forward to join."
    >
      <PathwaySection>
        <PathwayPrompt
          placeholder="Describe what you would like to work through with others…"
          cta="Find me a group"
          secondaryAction={
            <Link
              to="/areas/$slug"
              params={{ slug: "special-interest-groups" }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--ink)] px-6 py-3 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
            >
              Find out more <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {(r) => <Groups result={r} />}
        </PathwayPrompt>
      </PathwaySection>
      <SongForThisMoment page="membership" />
    </PathwayShell>
  );
}

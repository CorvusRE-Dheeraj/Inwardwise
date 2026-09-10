import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Compass, Globe2, Heart, Mic, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Pathway = {
  name: string;
  icon: LucideIcon;
  purpose: string;
  output: string;
  to?: string;
  action?: string;
};

const PATHWAYS: Pathway[] = [
  {
    name: "Connect Book",
    icon: BookOpen,
    purpose: "Reading that is relevant to what you described, sent in small pieces.",
    output: "A matched excerpt, why it fits, and one follow-up action.",
  },
  {
    name: "Connect Events",
    icon: CalendarDays,
    purpose: "Local or online gatherings where you can take part rather than read alone.",
    output: "An event that fits your prompt, with details or alternatives.",
  },
  {
    name: "Connect Membership",
    icon: Users,
    purpose: "Groups and networks you can be part of over time.",
    output: "A relevant group, what is expected of members, and how to join.",
  },
  {
    name: "Connect Belonging",
    icon: Heart,
    purpose: "Gentle ways to feel less isolated and more socially at home.",
    output: "A safe belonging experience or community, and a small next step.",
  },
  {
    name: "Connect Oneness",
    icon: Globe2,
    purpose: "A wider view that places your situation inside a larger picture.",
    output: "A researched perspective piece and one reflection prompt.",
  },
  {
    name: "Connect Share",
    icon: Mic,
    purpose: "Record your own experience for someone else, anonymously.",
    output: "A consent-led contribution that is reviewed before anyone hears it.",
  },
  {
    name: "Connect Decision",
    icon: Compass,
    purpose: "For when what you wrote is really a choice you need to make.",
    output: "The Decision flow, carrying your prompt forward.",
    to: "/decision",
    action: "Make Decision",
  },
  {
    name: "Connect Self Aware",
    icon: Sparkles,
    purpose: "Personal reflection using only your own completed Self, never shared.",
    output: "A response written for your Self, kept private to you.",
    to: "/avatar/ask",
    action: "Self Aware",
  },
];

/**
 * The Connect AI pathway map. Connect AI reads a prompt and chooses one of these
 * routes; the list stays visible so anyone can see the options or go direct.
 */
export function ConnectPathways() {
  return (
    <section className="mx-auto mt-14 w-[min(1100px,calc(100%-2rem))]">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        Connect AI · pathways
      </div>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">
        One prompt, <em className="italic text-[color:var(--royal)]">one best next step</em>
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-justify text-[color:var(--muted-foreground)]">
        You do not have to choose first. Write what is going on and Connect AI decides which of these
        is most relevant right now, says why, and gives you the first useful thing along with one clear
        follow-up. The options stay listed here so you can also go straight to one yourself.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PATHWAYS.map((p) => (
          <div
            key={p.name}
            className="flex flex-col rounded-lg border border-[color:var(--rule)] p-5"
          >
            <p.icon className="h-4 w-4 text-[color:var(--royal)]" aria-hidden />
            <h3 className="mt-4 text-[15px] text-[color:var(--ink)]">{p.name}</h3>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
              {p.purpose}
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-[color:var(--muted-foreground)]">
              {p.output}
            </p>
            {p.to && p.action && (
              <Link
                to={p.to}
                className="mt-4 inline-flex min-h-9 items-center gap-2 self-start rounded-full border border-[color:var(--rule)] px-4 py-2 text-[12px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
              >
                {p.action} <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-[color:var(--muted-foreground)]">
        Nothing is invented: books, events, stories and perspectives come from reviewed sources, and
        your private Self is never shown to other members.
      </p>
    </section>
  );
}

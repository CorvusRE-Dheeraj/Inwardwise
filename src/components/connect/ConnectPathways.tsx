import { Link } from "@tanstack/react-router";

type Pathway = {
  name: string;
  accent: string;
  purpose: string;
  to: string;
  action: string;
};

const PATHWAYS: Pathway[] = [
  {
    name: "Connect",
    accent: "Book",
    purpose: "Reading that is relevant to what you described, sent in small pieces, with one follow-up action.",
    to: "/connect/book",
    action: "Open Book",
  },
  {
    name: "Connect",
    accent: "Events",
    purpose: "Local or online gatherings where you can take part rather than read alone.",
    to: "/connect/events",
    action: "Find Events",
  },
  {
    name: "Connect",
    accent: "Membership",
    purpose: "Groups and networks you can be part of over time, and how to join them.",
    to: "/connect/membership",
    action: "See Groups",
  },
  {
    name: "Connect",
    accent: "Belonging",
    purpose: "Gentle ways to feel less isolated and more socially at home, one small step at a time.",
    to: "/connect/belonging",
    action: "Find Belonging",
  },
  {
    name: "Connect",
    accent: "Oneness",
    purpose: "A wider view that places your situation inside a larger picture, with one reflection prompt.",
    to: "/connect/oneness",
    action: "Widen the View",
  },
  {
    name: "Connect",
    accent: "Share",
    purpose: "Record your own experience for someone else, anonymously and consent-led.",
    to: "/connect/share",
    action: "Share Experience",
  },
  {
    name: "Connect",
    accent: "Decision",
    purpose: "For when what you wrote is really a choice you need to make, carried into the Decision flow.",
    to: "/decision",
    action: "Make Decision",
  },
  {
    name: "Connect",
    accent: "Self Aware",
    purpose: "Personal reflection using only your own completed Self, kept private to you.",
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
    <section className="mx-auto mt-14 w-[min(1100px,calc(100%-2rem))] pb-16">
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

      <div className="mt-12 grid gap-x-12 gap-y-14 sm:grid-cols-2">
        {PATHWAYS.map((p, i) => (
          <div key={p.accent} className="border-t border-[color:var(--rule)] pt-6">
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              {String(i + 1).padStart(2, "0")} · InwardWise {p.accent}
            </div>
            <h3 className="font-display mt-5 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] tracking-tight">
              {p.name} <span className="text-[color:var(--royal)]">{p.accent}</span>
            </h3>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
              {p.purpose}
            </p>
            <Link
              to={p.to}
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
            >
              {p.action} <span aria-hidden>→</span>
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-12 text-[12px] leading-relaxed text-[color:var(--muted-foreground)]">
        Nothing is invented: books, events, stories and perspectives come from reviewed sources, and
        your private Self is never shown to other members.
      </p>
    </section>
  );
}

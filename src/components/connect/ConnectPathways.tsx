import { Link } from "@tanstack/react-router";
import { PATHWAYS } from "@/lib/connect-pathways";

/** Pathways currently offered on the Connect page. */
const VISIBLE_PATHWAYS = [
  "book",
  "events",
  "membership",
  "belonging",
  "oneness",
  "share",
];
const visible = PATHWAYS.filter((p) => VISIBLE_PATHWAYS.includes(p.id));

/**
 * The Connect AI pathway map. Connect AI reads a prompt and chooses one of these
 * routes; the list stays visible so anyone can see the options or go direct.
 */
export function ConnectPathways() {
  return (
    <section className="mx-auto mt-14 w-[min(1100px,calc(100%-2rem))] pb-16">


      <div className="mt-12 grid gap-x-12 gap-y-14 sm:grid-cols-2">
        {visible.map((p, i) => (
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

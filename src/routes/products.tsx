import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Decision, Self, Connect | InwardWise" },
      {
        name: "description",
        content:
          "The three InwardWise products: Decision for clear choices, Self for your inner InwardWise Self and calm, and Connect to belong as yourself.",
      },
      { property: "og:title", content: "Products — Decision, Self, Connect | InwardWise" },
      {
        property: "og:description",
        content: "Decision, Self and Connect — three products, one inward practice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Products,
});

const PRODUCTS: {
  n: string;
  eyebrow: string;
  title: string;
  italic: string;
  blurb: string;
  links: { to: string; label: string; primary?: boolean }[];
}[] = [
  {
    n: "§ 01",
    eyebrow: "Product I · Decision",
    title: "Life is About Only",
    italic: "Few Decisions",
    blurb:
      "A seven-stage filter that runs on top of AI, removing bias, fear and ego from the choices that shape a life. Bring a real decision; leave with a reasoned, written record of how you got there.",
    links: [
      { to: "/decision", label: "Start a Decision", primary: true },
      { to: "/examples", label: "Read past sessions" },
    ],
  },
  {
    n: "§ 02",
    eyebrow: "Product II · Self",
    title: "Your Inward Self Working for",
    italic: "Your Happiness",
    blurb:
      "Build an inner InwardWise Self across five private factors, ask it what you cannot ask anyone else, and quiet the mind with an AI-guided meditation built for the modern brain.",
    links: [
      { to: "/avatar", label: "Build Self", primary: true },
      { to: "/avatar/ask", label: "Self Aware" },
      { to: "/meditation", label: "Self Aware · Meditation" },
    ],
  },
  {
    n: "§ 03",
    eyebrow: "Product III · Connect",
    title: "Be Yourself and",
    italic: "Belong",
    blurb:
      "Connect with your InwardWise Self — and, in time, with people whose inner shape fits yours. Conversation grounded in who you actually are, not the version you perform.",
    links: [
      { to: "/connect", label: "Connect", primary: true },
      { to: "/areas", label: "See services" },
    ],
  },
];

function Products() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="mx-auto w-[min(1280px,calc(100%-2rem))] pt-12 md:pt-20">
          <div className="flex items-center justify-between">
            <span className="font-mono-cap">InwardWise · Products</span>
            <span className="hidden font-mono-cap md:inline">Decision · Self · Connect</span>
          </div>
          <div className="hairline mt-4" />
          <h1 className="font-display mt-12 max-w-4xl text-[clamp(2.6rem,8vw,6rem)] leading-[0.98] tracking-tight">
            Three products, one <em className="italic text-[color:var(--royal)]">inward practice</em>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
            Scroll down to Decision, Self and Connect — or jump straight in.
          </p>
        </div>
      </section>

      {PRODUCTS.map((p) => (
        <section key={p.eyebrow} className="rule-top">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto w-[min(1280px,calc(100%-2rem))] py-24 md:py-32"
          >
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">
              {p.n} · {p.eyebrow}
            </span>
            <h2 className="font-display mt-5 max-w-4xl text-[clamp(2.2rem,6vw,4.6rem)] leading-[1.02] tracking-tight">
              {p.title} <em className="italic text-[color:var(--royal)]">{p.italic}</em>
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              {p.blurb}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {p.links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    l.primary
                      ? "inline-flex items-center gap-3 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
                      : "inline-flex items-center gap-3 rounded-full border border-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                  }
                >
                  {l.label} <span>→</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      ))}
    </AppShell>
  );
}

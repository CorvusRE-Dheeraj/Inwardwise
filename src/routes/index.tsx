import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decision Philosophy — Remove Bias, Fear, and Ego From Your Decisions" },
      { name: "description", content: "A quiet, deliberate practice for the few decisions that shape a life. Seven stages to remove bias, fear, and ego from every choice." },
      { property: "og:title", content: "Decision Philosophy" },
      { property: "og:description", content: "Remove bias, fear, and ego from the choices that shape a life." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://decisionphilosophy.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://decisionphilosophy.com/" }],
  }),
  component: Landing,
});

/* ---------- Word-by-word rise ---------- */
function RiseWords({ text, className, delay = 0, italic = false }: { text: string; className?: string; delay?: number; italic?: boolean }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ delay: delay + i * 0.08, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            className={`inline-block ${italic ? "italic" : ""}`}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}


function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), { stiffness: 60, damping: 20 });

  return (
    <AppShell>
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <motion.div style={{ y: heroY }} className="mx-auto w-[min(1280px,calc(100%-2rem))] pt-12 md:pt-24">
          {/* editorial masthead */}
          <div className="flex items-center justify-between">
            <span className="font-mono-cap">Volume I · A Decision Laboratory</span>
            <span className="hidden font-mono-cap md:inline">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="hairline mt-4" />

          {/* Big statement */}
          <div className="mt-16 grid grid-cols-12 gap-6 md:mt-24">
            <div className="col-span-12 md:col-span-1">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">§ 01</span>
            </div>
            <h1 className="col-span-12 font-display text-[13vw] leading-[0.92] tracking-[-0.035em] text-[color:var(--ink)] md:col-span-11 md:text-[9.5rem]">
              <RiseWords text="Life is About" />
              <br />
              <RiseWords text="Only Few Decisions" italic delay={0.35} />
            </h1>
          </div>

          {/* Sub */}
          <div className="mt-14 grid grid-cols-12 gap-6 md:mt-20">
            <div className="col-span-12 md:col-span-6 md:col-start-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="max-w-lg text-lg leading-relaxed text-[color:var(--ink-2)] md:text-xl"
              >
                A quiet, deliberate practice for removing bias, fear, and ego from the choices that shape a life.
              </motion.p>
            </div>
            <div className="col-span-12 flex flex-col items-start gap-6 md:col-span-4 md:items-end md:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.9 }}
                className="flex flex-col items-start gap-4 md:items-end"
              >
                <Link
                  to="/decision"
                  className="group inline-flex items-center gap-4 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm tracking-wide text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
                >
                  Start a Decision
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--ink)]">→</span>
                </Link>
                <Link to="/examples" className="text-sm text-[color:var(--muted-foreground)] underline-offset-4 hover:text-[color:var(--ink)] hover:underline">
                  Or: read past decisions
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-16 grid grid-cols-2 gap-y-6 border-y border-[color:var(--rule)] py-6 md:mt-24 md:grid-cols-4">
            {[
              ["Method", "Seven stages"],
              ["Discipline", "Behavioural science"],
              ["Author", "Alex Freeman, Ph.D"],
              ["Format", "A filter on top of the LLMs"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono-cap text-[color:var(--muted-foreground)]">{k}</span>
                <span className="text-sm text-[color:var(--ink)]">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============ VOLUME II — AVATAR ============ */}
      <Volume
        eyebrow="Volume II · Create and Connect with Your Inner Avatar"
        title={
          <>
            Your Avatar Working for Your{" "}
            <em className="italic text-[color:var(--royal)]">Happiness</em>
          </>
        }
        blurb="Create and connect with your inner Avatar that is participating and helping you in your evolution over time."
        actions={
          <>
            <Link
              to="/avatar"
              className="inline-flex items-center gap-3 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
            >
              Build Your Avatar <span>→</span>
            </Link>
            <Link
              to="/avatar/consult"
              className="inline-flex items-center gap-3 rounded-full border border-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
            >
              Connect to Avatar <span>→</span>
            </Link>
          </>
        }
        meta={[
          ["Method", "5 Dimensions of Inner You"],
          ["Discipline", "Inner Psychology and Philosophy"],
          ["Author", "Alex Freeman, Ph.D"],
          ["Format", "Voice based Conversational"],
        ]}
      />

      {/* ============ VOLUME III — MEDITATION ============ */}
      <Volume
        eyebrow="Volume III · Quiet your mind and connect to your inner self"
        title={
          <>
            Meditation — Connect to Your{" "}
            <em className="italic text-[color:var(--royal)]">Inner Self</em>
          </>
        }
        blurb="Scientifically developed meditation to quiet yourself and connect to your subconscious."
        actions={
          <Link
            to="/meditation"
            className="inline-flex items-center gap-3 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
          >
            Meditation Routine <span>→</span>
          </Link>
        }
        meta={[
          ["Method", "Scientifically Developed and Referenced"],
          ["Discipline", "Meditation"],
          ["Author", "Alex Freeman, Ph.D"],
          ["Format", "AI Guided"],
        ]}
      />
    </AppShell>
  );
}

/* ---------- Volume block ---------- */
function Volume({
  eyebrow,
  title,
  blurb,
  actions,
  meta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb: string;
  actions: React.ReactNode;
  meta: string[][];
}) {
  return (
    <section className="rule-top">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
        className="mx-auto w-[min(1280px,calc(100%-2rem))] py-24 md:py-32"
      >
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">{eyebrow}</span>
        <h2 className="font-display mt-5 max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.02] tracking-tight">
          {title}
        </h2>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
          {blurb}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">{actions}</div>
        <div className="mt-16 grid grid-cols-2 gap-y-6 border-y border-[color:var(--rule)] py-6 md:grid-cols-4">
          {meta.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">{k}</span>
              <span className="text-sm text-[color:var(--ink)]">{v}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


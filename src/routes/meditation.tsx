import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PRAYER_SETS } from "@/lib/meditation";

export const Route = createFileRoute("/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation — Connect to Your Inner Self | Decision Philosophy" },
      {
        name: "description",
        content:
          "Scientifically developed meditation to quiet your mind and connect to your subconscious.",
      },
      { property: "og:title", content: "Meditation — Connect to Your Inner Self" },
      {
        property: "og:description",
        content: "Scientifically developed meditation to quiet yourself and connect to your subconscious.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Meditation,
});

function Meditation() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="mx-auto w-[min(1280px,calc(100%-2rem))] pt-12 md:pt-24"
        >
          {/* editorial masthead */}
          <div className="flex items-center justify-between">
            <span className="font-mono-cap">Volume III · Meditation</span>
            <span className="hidden font-mono-cap md:inline">Meditation</span>
          </div>
          <div className="hairline mt-4" />

          {/* Big statement */}
          <div className="mt-16 grid grid-cols-12 gap-6 md:mt-24">
            <div className="col-span-12 md:col-span-1">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">§ 01</span>
            </div>
            <h1 className="col-span-12 font-display text-[13vw] leading-[0.92] tracking-[-0.035em] text-[color:var(--ink)] md:col-span-11 md:text-[8.5rem]">
              Meditation — Connect to Your{" "}
              <em className="italic text-[color:var(--royal)]">Inner Self</em>
            </h1>
          </div>

          {/* Sub */}
          <div className="mt-14 grid grid-cols-12 gap-6 md:mt-20">
            <div className="col-span-12 md:col-span-6 md:col-start-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="max-w-lg text-lg leading-relaxed text-[color:var(--ink-2)] md:text-xl"
              >
                Scientifically developed meditation to quiet yourself and connect to your
                subconscious.
              </motion.p>
            </div>
            <div className="col-span-12 flex flex-col items-start gap-6 md:col-span-4 md:items-end md:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.9 }}
                className="flex flex-col items-start gap-4 md:items-end"
              >
                <Link
                  to="/meditation/practice"
                  className="group inline-flex items-center gap-4 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm tracking-wide text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
                >
                  Meditation Routine
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--ink)]">→</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-16 grid grid-cols-2 gap-y-6 border-y border-[color:var(--rule)] py-6 md:mt-24 md:grid-cols-4">
            {[
              ["Method", "Scientifically Developed and Referenced"],
              ["Discipline", "Meditation"],
              ["Author", "Alex Freeman, Ph.D."],
              ["Format", "AI Guided"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono-cap text-[color:var(--muted-foreground)]">{k}</span>
                <span className="text-sm text-[color:var(--ink)]">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Four prayers overview */}
      <section className="rule-top">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="mx-auto w-[min(1280px,calc(100%-2rem))] py-24 md:py-32"
        >
          <span className="font-mono-cap text-[color:var(--muted-foreground)]">
            § 02 · The Four Prayers
          </span>
          <h2 className="font-display mt-5 max-w-4xl text-[clamp(2.4rem,7vw,5rem)] leading-[1.02] tracking-tight">
            Four prayers, in <em className="italic text-[color:var(--royal)]">your own words</em>
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
            A modified Ho'oponopono practice — each prayer completed with something true about your
            life, drawn from the answers you wrote across your five dimensions.
          </p>

          <div className="mt-16 grid gap-px border-y border-[color:var(--rule)] md:grid-cols-4">
            {PRAYER_SETS.map((s) => (
              <div key={s.key} className="py-8 md:pr-8">
                <span className="font-mono-cap text-[color:var(--muted-foreground)]">
                  Prayer {s.n}
                </span>
                <div className="font-display mt-3 text-2xl tracking-tight">{s.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {s.invitation}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PRAYER_SETS } from "@/lib/meditation";

export const Route = createFileRoute("/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation — Connect to Your Inner Self | InwardWise" },
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

      {/* A practice designed for the modern mind */}
      <section className="rule-top">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="mx-auto w-[min(1280px,calc(100%-2rem))] py-24 md:py-32"
        >
          <span className="font-mono-cap text-[color:var(--muted-foreground)]">
            § 02 · Why this practice
          </span>
          <h2 className="font-display mt-5 max-w-4xl text-[clamp(2.2rem,6vw,4.6rem)] leading-[1.02] tracking-tight">
            A meditation practice designed for the{" "}
            <em className="italic text-[color:var(--royal)]">modern mind</em>
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl space-y-5 text-[16px] leading-[1.75] text-[color:var(--ink-2)]">
              <p>
                The founder has been exposed to many types of meditation and is a staunch believer in
                the scientific method of evaluating everything. This practice is his scientific
                understanding of meditation, defined plainly.
              </p>
              <p>
                Throughout the day, the brain processes a constant stream of thoughts, emotions,
                decisions and sensory information. This ongoing mental activity can leave us feeling
                overstimulated, distracted or emotionally drained. Sleep helps the brain recover, but
                many people also benefit from learning how to create moments of calm while they are
                awake. Instead, people often use alcohol as a way to quiet the mind. Many mental
                illnesses carry over-stimulation of the brain as an underlying cause, which stresses
                the importance of quieting the mind down.
              </p>
              <p>
                Meditation offers a practical way to slow the pace of thought, reduce mental noise and
                redirect attention. Rather than forcing the mind to become completely silent, this
                technique guides you into a calmer and more receptive state.
              </p>
              <p>
                As external distractions begin to fade, you may become more aware of thoughts,
                feelings and ideas that are usually overlooked. This quieter state can create space
                for reflection, greater self-awareness, creative insight and the occasional “aha”
                moment.
              </p>
              <p>
                Research into meditation suggests that these practices can influence stress responses,
                emotional regulation and patterns of brain activity. A calm or thankful frame of mind
                may further support relaxation and help shift attention away from worry and mental
                overload.
              </p>
              <p>
                This meditation and autosuggestion method was developed by combining traditional
                contemplative ideas with modern insights into neuronal activity, mental disorders, the
                thought process and how it influences the mind–body connection, and neuronal imaging
                techniques used to study mental activity under different thought patterns. AI guides
                you with the suggestions so you can follow along easily.
              </p>
              <p>
                You do not need previous meditation experience, special beliefs or hours of free time.
                You only need a willingness to pause, listen and become more present. This is not
                about escaping your thoughts. It is about learning to relate to them with greater
                calm, clarity and intention.
              </p>
              <p className="font-display text-xl text-[color:var(--ink)]">
                Quiet the noise. Reconnect with yourself. Discover what becomes possible when the mind
                is given space to settle — and let AI make meditation a routine habit for you.
              </p>
            </div>

            <div className="paper-card h-fit rounded-3xl p-6">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">
                With regular practice
              </span>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[color:var(--ink-2)]">
                {[
                  "Reduce mental clutter and everyday stress",
                  "Feel calmer and more emotionally balanced",
                  "Improve focus and self-awareness",
                  "Create time for meaningful reflection",
                  "Become more receptive to new perspectives and personal insights",
                ].map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--royal)]" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/meditation/practice"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5"
              >
                Start Meditation <span>→</span>
              </Link>
            </div>
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
            § 03 · The Four Prayers
          </span>
          <h2 className="font-display mt-5 max-w-4xl text-[clamp(2.4rem,7vw,5rem)] leading-[1.02] tracking-tight">
            Four prayers, in <em className="italic text-[color:var(--royal)]">your own words</em>
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
            A modified Ho'oponopono practice — each prayer completed with something true about your
            life, drawn from the answers you wrote across your five factors.
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

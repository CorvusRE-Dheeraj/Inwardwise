import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Compass, Filter, Layers, ScissorsLineDashed, ShieldAlert, Sparkles, Edit3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { STEPS } from "@/lib/ooi-framework";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Think Better. Decide Better. — OOOI" },
      { name: "description", content: "Objective Oriented Out-In: an AI decision engine that refuses to answer until your real objective is defined, challenged, and bounded." },
      { property: "og:title", content: "Think Better. Decide Better. — OOOI" },
      { property: "og:description", content: "Spend 50% of the time refining the objective. Then the answer is inside the boundary." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <AppShell>
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Not a chatbot. A decision engine.
          </div>
          <h1 className="font-display mt-6 text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
            <span className="text-gradient">Think Better.</span>
            <br />
            <em className="italic text-muted-foreground">Decide Better.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            The Objective Oriented Out-In framework. Refine the objective, cast a wide boundary,
            then work inwards. The answer is always inside the net.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/decision"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-[var(--shadow-elev)] transition hover:opacity-90"
            >
              Start Decision <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/examples"
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-foreground transition hover:bg-foreground/5"
            >
              View Examples
            </Link>
          </div>
        </motion.div>

        <div className="pointer-events-none relative mx-auto mt-14 hidden h-[260px] max-w-4xl md:block">
          {[
            { i: Compass, t: "Situation", x: "5%", y: "10%" },
            { i: Edit3, t: "Objective", x: "78%", y: "0%" },
            { i: ShieldAlert, t: "Bias & Fear", x: "60%", y: "60%" },
            { i: Filter, t: "Boundary", x: "20%", y: "55%" },
            { i: ScissorsLineDashed, t: "Out-In", x: "42%", y: "10%" },
          ].map(({ i: Icon, t, x, y }, idx) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08, duration: 0.6 }}
              style={{ left: x, top: y }}
              className="glass absolute flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs animate-float"
            >
              <Icon className="h-3.5 w-3.5 text-accent" />
              {t}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7-step map */}
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">The OOOI Method</p>
            <h2 className="font-display mt-2 text-3xl md:text-4xl">Seven steps from situation to solution</h2>
          </div>
          <Link to="/decision" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline">
            Begin →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4"
            >
              <div className="text-xs text-muted-foreground">Step {s.index}</div>
              <div className="mt-1 font-medium">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.short}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mt-20 grid gap-4 md:grid-cols-3">
        {[
          { i: Brain, t: "Refines the objective", d: "The AI won't answer until you've abstracted the objective one level higher." },
          { i: ShieldAlert, t: "Faces bias & fear", d: "Confirmation, loss aversion, ego, sunk cost — named before they steer you." },
          { i: Layers, t: "Bounds then solves", d: "Cast a wide net first. Break each word of the boundary into an answer." },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="glass-strong rounded-3xl p-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground/5">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-medium">{t}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="mx-auto flex max-w-md items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" /> The rule
          </div>
          <h3 className="font-display mt-3 text-3xl md:text-4xl">
            Spend 50% of the time on the question. The answer will be inside the boundary.
          </h3>
          <Link
            to="/decision"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Start Decision <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

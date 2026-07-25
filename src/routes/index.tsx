import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { STAGES } from "@/lib/ooi-stages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decision Philosophy" },
      { name: "description", content: "Remove Bias, Fear, and Ego out of Your Decisions." },
      { property: "og:title", content: "Decision Philosophy" },
      { property: "og:description", content: "Remove Bias, Fear, and Ego out of Your Decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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

/* ---------- Decision Universe (mouse-reactive node graph) ---------- */
type Node = { id: string; x: number; y: number; label: string; kind: "core" | "n" };
const UNIVERSE_NODES: Node[] = [
  { id: "core", x: 50, y: 50, label: "Decision", kind: "core" },
  { id: "goals", x: 18, y: 22, label: "Goals", kind: "n" },
  { id: "bias", x: 82, y: 26, label: "Biases", kind: "n" },
  { id: "trade", x: 12, y: 58, label: "Tradeoffs", kind: "n" },
  { id: "evid", x: 88, y: 62, label: "Evidence", kind: "n" },
  { id: "alt", x: 28, y: 84, label: "Alternatives", kind: "n" },
  { id: "cons", x: 72, y: 86, label: "Consequences", kind: "n" },
  { id: "val", x: 50, y: 14, label: "Values", kind: "n" },
  { id: "risk", x: 50, y: 92, label: "Risk", kind: "n" },
];

function DecisionUniverse() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const dx = (mouse.x - 0.5) * 2; // -1..1
  const dy = (mouse.y - 0.5) * 2;

  return (
    <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden">
      {/* faint dotted axes */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="0.4" cy="0.4" r="0.25" fill="rgba(20,23,26,0.10)" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dots)" />
        {UNIVERSE_NODES.filter((n) => n.kind !== "core").map((n, i) => {
          const offX = dx * (1.2 + (i % 3) * 0.4);
          const offY = dy * (1.2 + (i % 2) * 0.5);
          return (
            <motion.line
              key={n.id}
              x1={50}
              y1={50}
              x2={n.x + offX}
              y2={n.y + offY}
              stroke="rgba(20,23,26,0.35)"
              strokeWidth="0.12"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.1 + i * 0.08, ease: [0.6, 0.05, 0.2, 1] }}
            />
          );
        })}
      </svg>

      {UNIVERSE_NODES.map((n, i) => {
        const isCore = n.kind === "core";
        const offX = isCore ? 0 : dx * (1.5 + (i % 3) * 0.6);
        const offY = isCore ? 0 : dy * (1.5 + (i % 2) * 0.8);
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ left: `${n.x + offX}%`, top: `${n.y + offY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {isCore ? (
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--ink)] bg-[color:var(--paper)] px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--royal)]" />
                <span className="font-display text-base tracking-tight">Decision</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="h-2 w-2 rounded-full border border-[color:var(--ink)] bg-[color:var(--paper)]" />
                <span className="font-mono-cap text-[color:var(--ink)]">{n.label}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------- Scroll-revealed insight ---------- */
function Insight({ small, big, index }: { small: string; big: string; index: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
      className="mx-auto grid w-[min(1100px,calc(100%-2rem))] grid-cols-12 items-start gap-6 py-24 md:py-36"
    >
      <div className="col-span-12 md:col-span-3">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">{index} · Insight</span>
        <div className="hairline mt-4 hidden md:block" />
      </div>
      <div className="col-span-12 md:col-span-9">
        <p className="font-mono-cap mb-4 text-[color:var(--royal)]">{small}</p>
        <h3 className="font-display text-4xl leading-[1.05] tracking-tight text-[color:var(--ink)] md:text-6xl">
          {big}
        </h3>
      </div>
    </motion.div>
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
                  Open the journey
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
              ["Format", "Conversational"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono-cap text-[color:var(--muted-foreground)]">{k}</span>
                <span className="text-sm text-[color:var(--ink)]">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============ EMOTIONAL JOURNEY ============ */}
      <section className="mx-auto w-[min(1280px,calc(100%-2rem))] py-28 md:py-40">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <span className="font-mono-cap">§ 02 — The Journey</span>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] tracking-tight md:text-5xl">
              From <em className="italic text-[color:var(--royal)]">confusion</em> to <em className="italic text-[color:var(--forest)]">confidence</em>.
            </h2>
          </div>
          <ol className="col-span-12 md:col-span-7 md:col-start-6">
            {[
              ["Confusion", "Every life-changing decision begins in fog."],
              ["Curiosity", "What if uncertainty could become structure?"],
              ["Discovery", "Objectivity is not talent. It is a process."],
              ["Confidence", "The right question makes the answer inevitable."],
            ].map(([k, v], i) => (
              <motion.li
                key={k}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-[color:var(--rule)] py-6 last:border-b-0"
              >
                <span className="font-mono-cap w-10">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="font-display text-2xl md:text-3xl">{k}</div>
                  <div className="mt-1 text-[color:var(--muted-foreground)]">{v}</div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ DECISION UNIVERSE ============ */}
      <section className="rule-top rule-bottom bg-[color:var(--paper-2)]/40">
        <div className="mx-auto w-[min(1280px,calc(100%-2rem))] py-24 md:py-32">
          <div className="mb-14 grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-6">
              <span className="font-mono-cap">§ 03 — The Decision Universe</span>
              <h2 className="font-display mt-4 text-4xl leading-[1.05] md:text-6xl">
                Every choice is a <em className="italic">constellation</em>.
              </h2>
            </div>
            <p className="col-span-12 max-w-md text-[color:var(--muted-foreground)] md:col-span-5 md:col-start-8">
              Move your cursor. Watch the map breathe. Behind every decision lies a quiet system of goals, biases, evidence, and consequence — waiting to be seen.
            </p>
          </div>
          <div className="paper-card rounded-2xl p-6 md:p-10">
            <DecisionUniverse />
          </div>
        </div>
      </section>

      {/* ============ SCROLL INSIGHTS ============ */}
      <Insight index="§ 04" small="Observation" big="Every life-changing decision begins with uncertainty." />
      <Insight index="§ 05" small="Reframe" big="What if uncertainty could become structure?" />
      <Insight index="§ 06" small="Principle" big="Objectivity is not talent. It is a process." />

      {/* ============ SEVEN STAGES — editorial index ============ */}
      <section className="mx-auto w-[min(1280px,calc(100%-2rem))] py-28 md:py-36">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="font-mono-cap">§ 07 — The Method</span>
            <h2 className="font-display mt-4 text-4xl leading-[1.05] md:text-6xl">
              Seven stages,<br />one clear mind.
            </h2>
          </div>
          <Link to="/decision" className="hidden text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)] md:inline">
            Begin the process →
          </Link>
        </div>
        <ol className="divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
          {STAGES.slice(0, 7).map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.7 }}
              className="grid grid-cols-12 items-baseline gap-4 py-6 md:py-8"
            >
              <div className="col-span-2 md:col-span-1">
                <span className="font-mono-cap text-[color:var(--muted-foreground)]">
                  {String(s.n).padStart(2, "0")}
                </span>
              </div>
              <div className="col-span-10 md:col-span-4">
                <div className="font-display text-2xl md:text-3xl">{s.name}</div>
              </div>
              <div className="col-span-12 text-[color:var(--muted-foreground)] md:col-span-6 md:col-start-6">
                {s.purpose}
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ============ THE RULE ============ */}
      <section className="mx-auto w-[min(1280px,calc(100%-2rem))] pb-28 md:pb-40">
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rule)] bg-[color:var(--ink)] px-8 py-20 text-[color:var(--paper)] md:px-16 md:py-32">
          {/* subtle line pattern */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 400 240" preserveAspectRatio="none">
            {Array.from({ length: 12 }).map((_, i) => (
              <path
                key={i}
                d={`M 0 ${i * 24} Q 200 ${i * 24 + (i % 2 ? 30 : -30)} 400 ${i * 24}`}
                stroke="white"
                strokeWidth="0.4"
                fill="none"
              />
            ))}
          </svg>
          <span className="font-mono-cap text-[color:var(--gold)]">§ 08 — The Rule</span>
          <h3 className="font-display mt-6 max-w-4xl text-4xl leading-[1.05] md:text-7xl">
            Spend half the time on the <em className="italic text-[color:var(--gold)]">question</em>. The answer lives inside the boundary.
          </h3>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              to="/decision"
              className="inline-flex items-center gap-3 rounded-full bg-[color:var(--paper)] px-6 py-3.5 text-sm text-[color:var(--ink)] transition hover:bg-white"
            >
              Begin your first decision <span>→</span>
            </Link>
            <Link to="/science" className="text-sm text-[color:var(--paper)]/70 underline-offset-4 hover:underline">
              Read the philosophy
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

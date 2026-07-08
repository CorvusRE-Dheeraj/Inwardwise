import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Compass, Edit3,
  Filter, Layers, ShieldAlert, Sparkles, ScissorsLineDashed, ListChecks, Download,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  CATEGORIES, STEPS, abstractObjective, combineAnswers, detectBiases,
  extractObjective, generateBoundary, generateSolutions, newDecision, saveDecision,
  splitBoundary, suggestPieceAnswer, suggestTimeframe,
  type DecisionState, type StepId,
} from "@/lib/ooi-framework";

export const Route = createFileRoute("/decision")({
  head: () => ({
    meta: [
      { title: "New Decision — OOOI" },
      { name: "description", content: "Walk through the 7-step OOOI decision workflow — from raw situation to a boundary-driven solution." },
    ],
  }),
  component: DecisionWizard,
});

const SITUATION_EXAMPLES = ["Marriage", "Career", "Business", "Friendship", "Finance", "Parenting"];

function DecisionWizard() {
  const [state, setState] = useState<DecisionState>(() => newDecision());
  const stepIdx = STEPS.findIndex((s) => s.id === state.step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  useEffect(() => {
    const t = setTimeout(() => saveDecision(state), 500);
    return () => clearTimeout(t);
  }, [state]);

  const update = (patch: Partial<DecisionState>) => setState((s) => ({ ...s, ...patch }));
  const go = (dir: 1 | -1) => {
    const next = STEPS[stepIdx + dir];
    if (next) update({ step: next.id });
  };

  // Progressive generation on entry
  useEffect(() => {
    if (state.step === "objective" && !state.objective)
      update({ objective: extractObjective(state.situation) });
    if (state.step === "solutions" && state.solutions.length === 0)
      update({ solutions: generateSolutions(state.situation, state.objective) });
    if (state.step === "refine" && state.refine.biases.length === 0)
      update({ refine: { ...state.refine, biases: detectBiases(state) } });
    if (state.step === "abstracted" && !state.abstracted)
      update({
        abstracted: abstractObjective(state.objective, state.situation),
        timeframe: state.timeframe || suggestTimeframe(state.situation),
      });
    if (state.step === "boundary" && !state.boundary)
      update({ boundary: generateBoundary(state.abstracted, state.timeframe) });
    if (state.step === "outin" && state.pieces.length === 0)
      update({ pieces: splitBoundary(state.boundary) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  const canAdvance = useMemo(() => {
    switch (state.step) {
      case "situation":  return state.situation.trim().length > 10;
      case "objective":  return state.objective.trim().length > 3;
      case "solutions":  return state.chosenSolutionOutcome !== null;
      case "refine":     return state.refine.negativeOutcomes.trim().length > 4;
      case "abstracted": return state.abstracted.trim().length > 5;
      case "boundary":   return state.boundary.trim().length > 10;
      case "outin":      return state.pieces.some((p) => p.answer.trim().length > 0);
    }
  }, [state]);

  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <StepRail current={state.step} onSelect={(s) => update({ step: s })} />

        <div>
          <ProgressBar value={progress} step={state.step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              {state.step === "situation"  && <SituationStep  state={state} update={update} />}
              {state.step === "objective"  && <ObjectiveStep  state={state} update={update} />}
              {state.step === "solutions"  && <SolutionsStep  state={state} update={update} />}
              {state.step === "refine"     && <RefineStep     state={state} update={update} />}
              {state.step === "abstracted" && <AbstractedStep state={state} update={update} />}
              {state.step === "boundary"   && <BoundaryStep   state={state} update={update} />}
              {state.step === "outin"      && <OutInStep      state={state} update={update} />}
            </motion.div>
          </AnimatePresence>

          <NavBar
            stepIdx={stepIdx}
            canAdvance={!!canAdvance}
            onBack={() => go(-1)}
            onNext={() => go(1)}
          />
        </div>
      </div>
    </AppShell>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────

function ProgressBar({ value, step }: { value: number; step: StepId }) {
  const current = STEPS.find((s) => s.id === step)!;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {current.index} of {STEPS.length} · {current.label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/5">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function StepRail({ current, onSelect }: { current: StepId; onSelect: (s: StepId) => void }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="glass rounded-3xl p-4">
        <div className="px-2 pb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          OOOI · 7 steps
        </div>
        <ol className="space-y-0.5">
          {STEPS.map((s) => {
            const idx = STEPS.findIndex((x) => x.id === s.id);
            const currentIdx = STEPS.findIndex((x) => x.id === current);
            const done = idx < currentIdx;
            const active = s.id === current;
            return (
              <li key={s.id}>
                <button
                  onClick={() => onSelect(s.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                      active ? "border-foreground bg-foreground text-background"
                        : done ? "border-accent text-accent" : "border-glass-border"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.index}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="glass mt-3 rounded-3xl p-4 text-xs text-muted-foreground">
        <div className="mb-1.5 flex items-center gap-1.5 text-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Spend 50% here</span>
        </div>
        The framework insists you spend as much time defining the objective and boundary
        as you spend solving. Steps 1–6 refine the question; step 7 finally answers it.
      </div>
    </aside>
  );
}

function NavBar({
  stepIdx, canAdvance, onBack, onNext,
}: { stepIdx: number; canAdvance: boolean; onBack: () => void; onNext: () => void }) {
  const last = stepIdx === STEPS.length - 1;
  return (
    <div className="mt-8 flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={stepIdx === 0}
        className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition hover:bg-foreground/5 disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {!last ? (
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
        >
          Finish & Save <CheckCircle2 className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function StepCard({
  icon: Icon, eyebrow, title, subtitle, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-strong rounded-3xl p-7 md:p-10">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" /> {eyebrow}
      </div>
      <h2 className="font-display mt-3 text-3xl md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

interface StepProps { state: DecisionState; update: (p: Partial<DecisionState>) => void }

// ─── Step 1 · Situation ───────────────────────────────────────────────────

function SituationStep({ state, update }: StepProps) {
  return (
    <StepCard
      icon={Compass}
      eyebrow={STEPS[0].eyebrow}
      title="Declare your need"
      subtitle="Situation, event, or pseudo-objective. Loosely defined is fine — this is raw input."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Category:</span>
        <CategoryPicker value={state.category} onChange={(v) => update({ category: v })} />
      </div>
      <textarea
        value={state.situation}
        onChange={(e) => update({ situation: e.target.value })}
        rows={8}
        placeholder="My spouse and I have been arguing for years. We have two children and I am considering divorce, but I don't want to hurt the kids. What should I do?"
        className="w-full resize-none rounded-2xl border border-glass-border bg-background/40 p-4 text-base outline-none transition focus:border-accent"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Common contexts:</span>
        {SITUATION_EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => update({ category: e === "Marriage" ? "Marriage" : e })}
            className="glass rounded-full px-3 py-1 text-xs transition hover:bg-foreground/5"
          >
            {e}
          </button>
        ))}
      </div>
    </StepCard>
  );
}

function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
        {value} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="glass-strong absolute z-20 mt-2 grid max-h-72 w-64 grid-cols-2 gap-1 overflow-auto rounded-2xl p-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-foreground/5 ${
                value === c ? "bg-foreground text-background" : ""
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2 · Objective ───────────────────────────────────────────────────

function ObjectiveStep({ state, update }: StepProps) {
  return (
    <StepCard
      icon={Edit3}
      eyebrow={STEPS[1].eyebrow}
      title="What exactly do you want?"
      subtitle="Not the situation, not a complaint — the concrete thing you want. This is still low-level; we will abstract it later."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Situation</div>
          <div className="mt-2 max-h-64 overflow-auto rounded-2xl bg-foreground/[0.03] p-4 text-sm leading-relaxed">
            {state.situation}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Objective</div>
          <textarea
            rows={5}
            value={state.objective}
            onChange={(e) => update({ objective: e.target.value })}
            placeholder="I want to…"
            className="mt-2 w-full resize-none rounded-2xl border border-glass-border bg-background/40 p-4 text-base outline-none focus:border-accent"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Warning: the objective almost always changes by step 5. Don't over-attach.
          </p>
        </div>
      </div>
    </StepCard>
  );
}

// ─── Step 3 · Solutions ───────────────────────────────────────────────────

function SolutionsStep({ state, update }: StepProps) {
  return (
    <StepCard
      icon={Layers}
      eyebrow={STEPS[2].eyebrow}
      title="What outcomes are actually on offer?"
      subtitle="A solution is the final outcome — not the objective, not the tactic. Pick the outcome you are aiming for."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {state.solutions.map((s, i) => {
          const chosen = state.chosenSolutionOutcome === i;
          return (
            <button
              key={s.label}
              onClick={() => update({ chosenSolutionOutcome: i })}
              className={`glass rounded-2xl p-5 text-left transition ${
                chosen ? "ring-2 ring-accent" : "hover:bg-foreground/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs text-background">{s.label}</span>
                  <div className="font-medium">{s.title}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    s.desirable ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
                  }`}
                >
                  {s.desirable ? "Acceptable" : "Avoid"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.detail}</p>
            </button>
          );
        })}
      </div>
    </StepCard>
  );
}

// ─── Step 4 · Refine (Bias & Fear) ────────────────────────────────────────

function RefineStep({ state, update }: StepProps) {
  const setRefine = (patch: Partial<DecisionState["refine"]>) =>
    update({ refine: { ...state.refine, ...patch } });

  return (
    <StepCard
      icon={ShieldAlert}
      eyebrow={STEPS[3].eyebrow}
      title="Face what you don't want to look at"
      subtitle="This is the step most people skip. Say the negative outcomes out loud. Then decide what you'd do if they happen."
    >
      <div className="grid gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Negative outcomes you've been avoiding thinking about
          </div>
          <textarea
            rows={4}
            value={state.refine.negativeOutcomes}
            onChange={(e) => setRefine({ negativeOutcomes: e.target.value })}
            placeholder="Kids affected by separation. Financial stress. Social stigma. Wasted years if I stay."
            className="mt-2 w-full resize-none rounded-xl bg-background/40 p-3 text-sm outline-none focus:bg-background/60"
          />
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            What you'd actually do if the worst outcome happened
          </div>
          <textarea
            rows={3}
            value={state.refine.fearsFaced}
            onChange={(e) => setRefine({ fearsFaced: e.target.value })}
            placeholder="Build a 6-month savings cushion. Line up a lawyer. Talk to the kids' school counselor."
            className="mt-2 w-full resize-none rounded-xl bg-background/40 p-3 text-sm outline-none focus:bg-background/60"
          />
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Ego check
          </div>
          <textarea
            rows={2}
            value={state.refine.egoCheck}
            onChange={(e) => setRefine({ egoCheck: e.target.value })}
            placeholder="Is any part of this driven by wanting to be right, wanting to win, or wanting to be seen a certain way?"
            className="mt-2 w-full resize-none rounded-xl bg-background/40 p-3 text-sm outline-none focus:bg-background/60"
          />
        </div>

        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Biases likely at work
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {state.refine.biases.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground">{Math.round(b.weight * 100)}%</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{b.reason}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/5">
                  <div className="h-full bg-accent" style={{ width: `${b.weight * 100}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </StepCard>
  );
}

// ─── Step 5 · Abstracted Objective ────────────────────────────────────────

function AbstractedStep({ state, update }: StepProps) {
  return (
    <StepCard
      icon={Sparkles}
      eyebrow={STEPS[4].eyebrow}
      title="One level higher"
      subtitle="Strip low-level words. Reframe upward. Make it measurable and time-bound."
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Original objective</div>
          <div className="mt-2 text-sm">{state.objective || "—"}</div>
        </div>
        <div className="grid place-items-center text-muted-foreground">→</div>
        <div className="glass-strong rounded-2xl border-2 border-accent/40 p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-accent">Abstracted objective</div>
          <textarea
            rows={5}
            value={state.abstracted}
            onChange={(e) => update({ abstracted: e.target.value })}
            className="mt-2 w-full resize-none rounded-xl bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Timeframe</div>
        <div className="flex gap-2">
          {["1 month", "3 months", "6 months", "12 months"].map((t) => (
            <button
              key={t}
              onClick={() => update({ timeframe: t })}
              className={`rounded-full px-3 py-1 text-xs transition ${
                state.timeframe === t
                  ? "bg-foreground text-background"
                  : "glass hover:bg-foreground/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </StepCard>
  );
}

// ─── Step 6 · Boundary ────────────────────────────────────────────────────

function BoundaryStep({ state, update }: StepProps) {
  return (
    <StepCard
      icon={Filter}
      eyebrow={STEPS[5].eyebrow}
      title="Cast the net"
      subtitle="A 1–3 sentence boundary that CONTAINS the solution. Every word matters — you'll answer each in the next step."
    >
      <div className="rounded-3xl border-2 border-dashed border-accent/40 bg-accent/5 p-6">
        <div className="text-[10px] uppercase tracking-[0.16em] text-accent">Boundary statement</div>
        <textarea
          rows={5}
          value={state.boundary}
          onChange={(e) => {
            const boundary = e.target.value;
            update({ boundary, pieces: splitBoundary(boundary) });
          }}
          className="mt-3 w-full resize-none rounded-xl bg-transparent text-base leading-relaxed outline-none"
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="glass rounded-2xl p-4 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">Wider net</div>
          The broader (and higher) your boundary, the safer that the answer lies inside it — but the longer it takes to find.
        </div>
        <div className="glass rounded-2xl p-4 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">Watch the words</div>
          If a word (like "monitor" or "compatible") doesn't earn its place, cut it. Every word becomes work in step 7.
        </div>
      </div>
    </StepCard>
  );
}

// ─── Step 7 · Out-In ──────────────────────────────────────────────────────

function OutInStep({ state, update }: StepProps) {
  const setPiece = (i: number, answer: string) => {
    const pieces = state.pieces.map((p, idx) => (idx === i ? { ...p, answer } : p));
    update({ pieces, combinedSolution: combineAnswers(pieces) });
  };
  const fillSuggested = () => {
    const pieces = state.pieces.map((p) =>
      p.answer.trim() ? p : { ...p, answer: suggestPieceAnswer(p.fragment) },
    );
    update({ pieces, combinedSolution: combineAnswers(pieces) });
  };

  return (
    <StepCard
      icon={ScissorsLineDashed}
      eyebrow={STEPS[6].eyebrow}
      title="Break the boundary. Answer each piece."
      subtitle="Split the boundary into fragments. Solve each fragment inwards without introducing new words. Combine into the final solution."
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="glass rounded-full px-3 py-1 text-xs text-muted-foreground">
          {state.pieces.length} fragments extracted from your boundary
        </div>
        <button
          onClick={fillSuggested}
          className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition hover:bg-foreground/5"
        >
          <Sparkles className="h-3 w-3 text-accent" /> Suggest answers
        </button>
      </div>

      <ol className="space-y-3">
        {state.pieces.map((p, i) => (
          <li key={i} className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[10px] text-background">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1">
                <div className="text-sm italic text-foreground/90">"{p.fragment}"</div>
                <textarea
                  rows={2}
                  value={p.answer}
                  onChange={(e) => setPiece(i, e.target.value)}
                  placeholder="Answer inwards — concrete action, measurement, deadline."
                  className="mt-2 w-full resize-none rounded-xl bg-background/40 p-3 text-sm outline-none focus:bg-background/60"
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-3xl border border-accent/30 bg-accent/5 p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-accent">
          <ListChecks className="h-3.5 w-3.5" /> Combined solution
        </div>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {state.combinedSolution || "Fill the fragments above — your combined solution appears here."}
        </pre>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["Decision Summary PDF", "Action Plan", "30-Day Checklist"].map((t) => (
          <button
            key={t}
            onClick={() => window.print()}
            className="glass inline-flex items-center justify-between rounded-2xl p-4 text-left text-sm transition hover:bg-foreground/5"
          >
            <span>{t}</span>
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </StepCard>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Compass, Download, Edit3,
  Filter, Goal as GoalIcon, Layers, Sparkles, Telescope, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  CATEGORIES, CHALLENGE_QUESTIONS, STAGES, detectBiases, extractPseudoObjective,
  generateBoundary, generateGoals, generateHigherObjective, generateOptions, newDecision,
  saveDecision, scoreConfidence, scoreRegret, simulate, type DecisionState, type StageId,
} from "@/lib/ooi-framework";

export const Route = createFileRoute("/decision")({
  head: () => ({
    meta: [
      { title: "New Decision — OOOI" },
      { name: "description", content: "Walk through the 10-stage OOOI decision workflow." },
    ],
  }),
  component: DecisionWizard,
});

const SITUATION_EXAMPLES = ["Divorce", "Career", "Business", "Parenting", "Finance", "Health"];

function DecisionWizard() {
  const [state, setState] = useState<DecisionState>(() => newDecision());
  const stageIdx = STAGES.findIndex((s) => s.id === state.stage);
  const progress = ((stageIdx + 1) / STAGES.length) * 100;

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => saveDecision(state), 500);
    return () => clearTimeout(t);
  }, [state]);

  const update = (patch: Partial<DecisionState>) => setState((s) => ({ ...s, ...patch }));
  const go = (dir: 1 | -1) => {
    const next = STAGES[stageIdx + dir];
    if (next) update({ stage: next.id });
  };

  // Lazy generation when entering a stage
  useEffect(() => {
    if (state.stage === "pseudo" && !state.pseudoObjective)
      update({ pseudoObjective: extractPseudoObjective(state.situation) });
    if (state.stage === "biases" && state.biases.length === 0)
      update({ biases: detectBiases(state) });
    if (state.stage === "higher" && !state.higherObjective)
      update({ higherObjective: generateHigherObjective(state.pseudoObjective) });
    if (state.stage === "boundary" && !state.boundary)
      update({ boundary: generateBoundary(state.higherObjective) });
    if (state.stage === "goals" && state.goals.length === 0)
      update({ goals: generateGoals(state.higherObjective) });
    if (state.stage === "options" && state.options.length === 0)
      update({ options: generateOptions(state.higherObjective) });
    if (state.stage === "simulation" && state.chosenOption !== null && state.simulations.length === 0) {
      const opt = state.options[state.chosenOption];
      update({
        simulations: simulate(opt, state.higherObjective),
        regret: scoreRegret(opt),
        confidence: scoreConfidence(opt),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  const canAdvance = useMemo(() => {
    switch (state.stage) {
      case "situation": return state.situation.trim().length > 10;
      case "pseudo": return !!state.pseudoObjective.trim();
      case "challenge": return Object.values(state.challengeAnswers).filter((v) => v?.trim()).length >= 2;
      case "biases": return state.biases.length > 0;
      case "higher": return !!state.higherObjective.trim();
      case "boundary": return !!state.boundary.trim();
      case "goals": return state.goals.length > 0;
      case "options": return state.chosenOption !== null;
      case "simulation": return state.simulations.length > 0;
      case "commit": return state.commitment.trim().length > 5;
    }
  }, [state]);

  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <StageRail current={state.stage} onSelect={(s) => update({ stage: s })} state={state} />

        <div>
          <ProgressBar value={progress} stage={state.stage} />

          <AnimatePresence mode="wait">
            <motion.div
              key={state.stage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              {state.stage === "situation" && <SituationStep state={state} update={update} />}
              {state.stage === "pseudo" && <PseudoStep state={state} update={update} />}
              {state.stage === "challenge" && <ChallengeStep state={state} update={update} />}
              {state.stage === "biases" && <BiasesStep state={state} update={update} />}
              {state.stage === "higher" && <HigherStep state={state} update={update} />}
              {state.stage === "boundary" && <BoundaryStep state={state} update={update} />}
              {state.stage === "goals" && <GoalsStep state={state} update={update} />}
              {state.stage === "options" && <OptionsStep state={state} update={update} />}
              {state.stage === "simulation" && <SimulationStep state={state} update={update} />}
              {state.stage === "commit" && <CommitStep state={state} update={update} />}
            </motion.div>
          </AnimatePresence>

          <NavBar
            stageIdx={stageIdx}
            canAdvance={!!canAdvance}
            onBack={() => go(-1)}
            onNext={() => go(1)}
          />
        </div>
      </div>
    </AppShell>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────

function ProgressBar({ value, stage }: { value: number; stage: StageId }) {
  const current = STAGES.find((s) => s.id === stage)!;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Stage {current.index} of {STAGES.length} · {current.label}</span>
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

function StageRail({
  current, onSelect, state,
}: { current: StageId; onSelect: (s: StageId) => void; state: DecisionState }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="glass rounded-3xl p-4">
        <div className="px-2 pb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Decision Flow
        </div>
        <ol className="space-y-0.5">
          {STAGES.map((s) => {
            const idx = STAGES.findIndex((x) => x.id === s.id);
            const currentIdx = STAGES.findIndex((x) => x.id === current);
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
          <span className="text-xs font-medium">Why this works</span>
        </div>
        The AI refuses to answer your question until your real objective is named, challenged,
        and bounded.
      </div>
    </aside>
  );
}

function NavBar({
  stageIdx, canAdvance, onBack, onNext,
}: { stageIdx: number; canAdvance: boolean; onBack: () => void; onNext: () => void }) {
  const last = stageIdx === STAGES.length - 1;
  return (
    <div className="mt-8 flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={stageIdx === 0}
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

function StageCard({
  icon: Icon, eyebrow, title, children,
}: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-3xl p-7 md:p-10">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {eyebrow}
      </div>
      <h2 className="font-display mt-3 text-3xl md:text-4xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

// ─── Stage 1: Situation ───────────────────────────────────────────────────

function SituationStep({ state, update }: StepProps) {
  return (
    <StageCard icon={Compass} eyebrow="Stage 1 · Raw situation" title="What happened?">
      <p className="mb-4 text-sm text-muted-foreground">
        Describe the situation as it is — facts, feelings, friction. This is the raw input, not yet an objective.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Category:</span>
        <CategoryPicker value={state.category} onChange={(v) => update({ category: v })} />
      </div>
      <textarea
        value={state.situation}
        onChange={(e) => update({ situation: e.target.value })}
        rows={8}
        placeholder="Three months ago I…"
        className="w-full resize-none rounded-2xl border border-glass-border bg-background/40 p-4 text-base outline-none transition focus:border-accent"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Common contexts:</span>
        {SITUATION_EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => update({ situation: state.situation + (state.situation ? "\n" : "") + `Context: ${e}. ` })}
            className="glass rounded-full px-3 py-1 text-xs transition hover:bg-foreground/5"
          >
            {e}
          </button>
        ))}
      </div>
    </StageCard>
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

// ─── Stage 2: Pseudo Objective ────────────────────────────────────────────

function PseudoStep({ state, update }: StepProps) {
  return (
    <StageCard icon={Edit3} eyebrow="Stage 2 · Surface intent" title="The pseudo-objective hiding inside the situation">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Situation</div>
          <div className="mt-2 max-h-48 overflow-auto rounded-2xl bg-foreground/[0.03] p-4 text-sm leading-relaxed">
            {state.situation}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Pseudo Objective</div>
          <textarea
            rows={4}
            value={state.pseudoObjective}
            onChange={(e) => update({ pseudoObjective: e.target.value })}
            className="mt-2 w-full resize-none rounded-2xl border border-glass-border bg-background/40 p-4 text-base outline-none focus:border-accent"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            This is not your real objective yet — it's the first surface phrasing. We'll challenge it next.
          </p>
        </div>
      </div>
    </StageCard>
  );
}

// ─── Stage 3: Challenge ───────────────────────────────────────────────────

function ChallengeStep({ state, update }: StepProps) {
  return (
    <StageCard icon={AlertTriangle} eyebrow="Stage 3 · Challenge the objective" title="The AI refuses to accept this objective at face value">
      <div className="space-y-3">
        {CHALLENGE_QUESTIONS.map((q, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="text-sm font-medium">{q}</div>
            <textarea
              rows={2}
              placeholder="Your honest answer…"
              value={state.challengeAnswers[q] ?? ""}
              onChange={(e) => update({ challengeAnswers: { ...state.challengeAnswers, [q]: e.target.value } })}
              className="mt-2 w-full resize-none rounded-xl bg-background/40 p-3 text-sm outline-none transition focus:bg-background/60"
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Answer at least two. Skipping all of them defeats the framework.
      </p>
    </StageCard>
  );
}

// ─── Stage 4: Biases ──────────────────────────────────────────────────────

function BiasesStep({ state }: StepProps) {
  return (
    <StageCard icon={ShieldCheck} eyebrow="Stage 4 · Hidden biases" title="What may be steering this without your knowing">
      <div className="grid gap-3 sm:grid-cols-2">
        {state.biases.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass relative overflow-hidden rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Bias detected</div>
                <div className="mt-1 font-medium">{b.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">Likelihood</div>
                <div className="text-sm font-medium">{Math.round(b.weight * 100)}%</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{b.reason}</p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-foreground/5">
              <div className="h-full bg-accent" style={{ width: `${b.weight * 100}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </StageCard>
  );
}

// ─── Stage 5: Higher Objective ────────────────────────────────────────────

function HigherStep({ state, update }: StepProps) {
  return (
    <StageCard icon={Sparkles} eyebrow="Stage 5 · Reframe upward" title="The higher-level objective behind this">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Original</div>
          <div className="mt-2 text-sm">{state.pseudoObjective}</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="glass-strong rounded-2xl border-2 border-accent/40 p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-accent">Higher Objective</div>
          <textarea
            rows={4}
            value={state.higherObjective}
            onChange={(e) => update({ higherObjective: e.target.value })}
            className="mt-2 w-full resize-none rounded-xl bg-transparent text-sm outline-none"
          />
        </div>
      </div>
    </StageCard>
  );
}

// ─── Stage 6: Boundary ────────────────────────────────────────────────────

function BoundaryStep({ state, update }: StepProps) {
  return (
    <StageCard icon={Filter} eyebrow="Stage 6 · Boundary" title="The objective boundary you'll evaluate inside">
      <div className="rounded-3xl border-2 border-dashed border-accent/40 bg-accent/5 p-6">
        <div className="text-[10px] uppercase tracking-[0.16em] text-accent">Boundary Statement</div>
        <textarea
          rows={4}
          value={state.boundary}
          onChange={(e) => update({ boundary: e.target.value })}
          className="mt-3 w-full resize-none rounded-xl bg-transparent text-base outline-none"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A clear boundary makes the decision tractable. Edit until it feels honest.
      </p>
    </StageCard>
  );
}

// ─── Stage 7: Goals ───────────────────────────────────────────────────────

function GoalsStep({ state }: StepProps) {
  return (
    <StageCard icon={GoalIcon} eyebrow="Stage 7 · Break into goals" title="Five goals to make the objective testable">
      <div className="grid gap-3">
        {state.goals.map((g, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs text-background">{i + 1}</span>
              <div className="font-medium">{g.title}</div>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
              <Field label="Purpose">{g.purpose}</Field>
              <Field label="Success Criteria">{g.criteria}</Field>
              <Field label="Measurement">{g.measurement}</Field>
              <Field label="Timeframe">{g.timeframe}</Field>
            </div>
          </div>
        ))}
      </div>
    </StageCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-muted-foreground">{children}</div>
    </div>
  );
}

// ─── Stage 8: Options ─────────────────────────────────────────────────────

function OptionsStep({ state, update }: StepProps) {
  return (
    <StageCard icon={Layers} eyebrow="Stage 8 · Decision paths" title="Not one answer — four branches to weigh">
      <div className="grid gap-3 md:grid-cols-2">
        {state.options.map((o, i) => {
          const chosen = state.chosenOption === i;
          return (
            <button
              key={o.label}
              onClick={() => update({ chosenOption: i, simulations: [] })}
              className={`glass rounded-2xl p-5 text-left transition ${
                chosen ? "ring-2 ring-accent" : "hover:bg-foreground/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs text-background">{o.label}</span>
                  <div className="font-medium">{o.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">P {Math.round(o.probability * 100)}%</div>
              </div>
              <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                <ListBlock label="Advantages" items={o.advantages} tone="pos" />
                <ListBlock label="Disadvantages" items={o.disadvantages} tone="neg" />
                <ListBlock label="Risks" items={o.risks} tone="warn" />
                <ListBlock label="Stakeholders" items={o.stakeholders} tone="muted" />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Select one path to simulate.</p>
    </StageCard>
  );
}

function ListBlock({ label, items, tone }: { label: string; items: string[]; tone: "pos" | "neg" | "warn" | "muted" }) {
  const dot = { pos: "bg-emerald-400", neg: "bg-rose-400", warn: "bg-amber-400", muted: "bg-foreground/40" }[tone];
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <ul className="mt-1.5 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dot}`} /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Stage 9: Simulation ──────────────────────────────────────────────────

function SimulationStep({ state }: StepProps) {
  const opt = state.chosenOption !== null ? state.options[state.chosenOption] : null;
  return (
    <StageCard icon={Telescope} eyebrow="Stage 9 · Decision simulation" title={`Project Option ${opt?.label ?? ""} forward`}>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <Meter label="Confidence" value={state.confidence} tone="pos" />
        <Meter label="Regret Probability" value={state.regret} tone="warn" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {state.simulations.map((s) => (
          <div key={s.horizon} className="glass rounded-2xl p-5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">After</div>
            <div className="font-display mt-1 text-2xl">{s.horizon}</div>
            <div className="mt-4 space-y-2 text-sm">
              <Row k="Emotion" v={s.emotion} />
              <Row k="Financial" v={s.financial} />
              <Row k="Relationships" v={s.relationships} />
              <Row k="Career" v={s.career} />
              <Row k="Health" v={s.health} />
            </div>
          </div>
        ))}
      </div>
    </StageCard>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-glass-border pt-2 first:border-0 first:pt-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right text-foreground/90">{v}</span>
    </div>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "pos" | "warn" }) {
  const bar = tone === "pos" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl">{value}%</div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/5">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7 }} className={`h-full ${bar}`} />
      </div>
    </div>
  );
}

// ─── Stage 10: Commit ─────────────────────────────────────────────────────

function CommitStep({ state, update }: StepProps) {
  const opt = state.chosenOption !== null ? state.options[state.chosenOption] : null;
  return (
    <StageCard icon={CheckCircle2} eyebrow="Stage 10 · Opt-in commitment" title="I consciously choose…">
      <textarea
        rows={5}
        placeholder={`I consciously choose Option ${opt?.label ?? "X"} — ${opt?.title ?? ""} — because…`}
        value={state.commitment}
        onChange={(e) => update({ commitment: e.target.value })}
        className="w-full resize-none rounded-2xl border border-glass-border bg-background/40 p-5 text-base outline-none focus:border-accent"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {["Decision Summary PDF", "Action Plan", "Reflection Journal", "30-Day Checklist"].map((t) => (
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
    </StageCard>
  );
}

interface StepProps { state: DecisionState; update: (p: Partial<DecisionState>) => void }

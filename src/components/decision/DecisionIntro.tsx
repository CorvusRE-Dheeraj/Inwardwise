import { useState } from "react";
import { ArrowRight, Clock, Save } from "lucide-react";
import { JOURNEY, TOTAL_STAGES } from "@/lib/decision-journey";
import type { DecisionSession } from "@/lib/ooi-storage";

export interface DecisionIntroProps {
  onStart: () => void;
  /** An earlier, unfinished journey the person can pick up again. */
  resumable?: DecisionSession | null;
  onResume?: (session: DecisionSession) => void;
}

/**
 * Pre-decision orientation screen. Purely informational: nothing here changes
 * the decision process, it only explains it before the conversation begins.
 */
export function DecisionIntro({ onStart, resumable, onResume }: DecisionIntroProps) {
  const [showStages, setShowStages] = useState(false);

  return (
    <div className="mx-auto max-w-2xl py-6">
      {resumable && onResume && (
        <div className="glass mb-6 rounded-2xl border border-accent/40 p-4">
          <h3 className="font-display text-lg">Continue Your Decision</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            You've completed {Math.max(0, Math.min(resumable.stage, TOTAL_STAGES) - 1)} of{" "}
            {TOTAL_STAGES} stages. Continue where you left off.
          </p>
          <p className="mt-1 truncate text-xs text-foreground/80">{resumable.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => onResume(resumable)}
              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-background transition hover:opacity-90"
            >
              Continue Decision
            </button>
            <button
              onClick={onStart}
              className="glass rounded-full px-4 py-2 text-xs text-foreground transition hover:bg-foreground/5"
            >
              Start a New Decision
            </button>
          </div>
        </div>
      )}

      <h2 className="font-display text-2xl md:text-3xl">
        Let's work through your decision together
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-justify text-muted-foreground">
        This process is designed to help you understand your decision before jumping to a solution.
        We'll gradually clarify what is happening, what you want, what matters to you, and what
        options you have.
      </p>

      <button
        type="button"
        onClick={() => setShowStages((v) => !v)}
        aria-expanded={showStages}
        className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline md:hidden"
      >
        {showStages ? "Hide the stages" : "Learn How It Works"}
      </button>

      <ol className={`mt-5 space-y-3 ${showStages ? "" : "hidden md:block"}`}>
        {JOURNEY.map((s) => (
          <li key={s.n} className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-glass-border text-[11px] text-muted-foreground">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.blurb}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="glass mt-6 rounded-2xl p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="text-foreground">There are no right or wrong answers.</p>
        <p className="mt-1">
          Answer honestly. The process works best when you describe your situation in your own
          words.
        </p>
        <p className="mt-2 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Usually takes about 5–10 minutes.
        </p>
        <p className="mt-1 flex items-center gap-1.5">
          <Save className="h-3.5 w-3.5" /> You can save your progress and continue later.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={onStart}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Start My Decision <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowStages(true)}
          className="glass min-h-11 rounded-full px-5 py-2.5 text-sm text-foreground transition hover:bg-foreground/5"
        >
          Learn How It Works
        </button>
      </div>
    </div>
  );
}

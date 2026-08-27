import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { JOURNEY, TOTAL_STAGES, journeyPercent, journeyStage } from "@/lib/decision-journey";

/**
 * Persistent, calm progress header for the Decision window.
 * Presentation only — the current stage is passed in from the existing logic.
 */
export function JourneyProgress({ current }: { current: number }) {
  const [showWhy, setShowWhy] = useState(false);
  const stage = journeyStage(Math.min(current, TOTAL_STAGES));
  const percent = journeyPercent(current);

  return (
    <div className="border-b border-glass-border px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Decision Journey
        </p>
        <p className="text-[10px] text-muted-foreground">{percent}% complete</p>
      </div>

      <ol
        role="list"
        aria-label={`Decision journey, step ${stage.n} of ${TOTAL_STAGES}: ${stage.label}`}
        className="mt-2 flex items-center gap-1"
      >
        {JOURNEY.map((s) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-1">
              <span
                title={`Step ${s.n} · ${s.label}`}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${s.n}, ${s.label}${done ? ", completed" : active ? ", current" : ""}`}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] transition ${
                  done
                    ? "bg-accent text-background"
                    : active
                      ? "bg-foreground text-background"
                      : "border border-glass-border bg-transparent text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : s.n}
              </span>
              {s.n < TOTAL_STAGES && (
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${done ? "bg-accent/60" : "bg-glass-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-xs font-medium text-foreground">
          Step {Math.min(current, TOTAL_STAGES)} of {TOTAL_STAGES} · {stage.label}
        </p>
        <p className="text-[11px] text-muted-foreground">{stage.blurb}</p>
        {stage.why && (
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            aria-expanded={showWhy}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <HelpCircle className="h-3 w-3" /> Why are we asking this?
          </button>
        )}
      </div>

      {showWhy && stage.why && (
        <p className="mt-2 rounded-xl border border-glass-border bg-foreground/[0.02] p-3 text-[11px] leading-relaxed text-muted-foreground">
          {stage.why}
        </p>
      )}
    </div>
  );
}

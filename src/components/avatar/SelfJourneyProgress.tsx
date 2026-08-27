import { SELF_JOURNEY, TOTAL_JOURNEY_STAGES, stageIndex } from "@/lib/self-journey";

export interface SelfJourneyProgressProps {
  /** Internal factor number currently being worked on. */
  current: number;
  /** Internal factor numbers already completed. */
  completed?: number[];
  compact?: boolean;
}

/**
 * Presentation-only five-stage indicator. Displays neutral UX labels and never
 * exposes the internal factor names or categories.
 */
export function SelfJourneyProgress({
  current,
  completed = [],
  compact = false,
}: SelfJourneyProgressProps) {
  const idx = stageIndex(current);
  const stage = SELF_JOURNEY[idx];

  return (
    <div
      role="group"
      aria-label={`Your Self Journey, stage ${idx + 1} of ${TOTAL_JOURNEY_STAGES}: ${stage.label}`}
      className="w-full"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Your Self Journey
        </span>
        <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Stage {idx + 1} of {TOTAL_JOURNEY_STAGES} · {stage.label}
        </span>
      </div>

      <ol className="mt-3 flex items-center gap-1.5" aria-hidden="true">
        {SELF_JOURNEY.map((s, i) => {
          const done = completed.includes(s.n) || i < idx;
          const isCurrent = i === idx;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-1.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full transition ${
                  isCurrent
                    ? "bg-[color:var(--royal)] ring-4 ring-[color:var(--royal)]/15"
                    : done
                      ? "bg-[color:var(--ink)]"
                      : "bg-[color:var(--rule)]"
                }`}
              />
              {i < TOTAL_JOURNEY_STAGES - 1 && (
                <span
                  className={`h-px flex-1 ${
                    done ? "bg-[color:var(--ink)]" : "bg-[color:var(--rule)]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {!compact && (
        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{stage.orientation}</p>
      )}
    </div>
  );
}

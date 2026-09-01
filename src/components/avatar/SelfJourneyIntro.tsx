import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { SELF_JOURNEY, TOTAL_JOURNEY_STAGES } from "@/lib/self-journey";

export interface SelfJourneyIntroProps {
  /** Internal factor numbers already complete. */
  completed: number[];
  /** Internal factor number to start or continue with. */
  nextStage: number;
}

/**
 * Pre-consultation orientation for the Self Journey. Presentation only:
 * nothing here changes the underlying methodology, questions or AI behaviour.
 */
export function SelfJourneyIntro({ completed, nextStage }: SelfJourneyIntroProps) {
  const [showHow, setShowHow] = useState(false);
  const started = completed.length > 0;

  return (
    <section className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
      {started ? (
        <>
          <h2 className="font-display text-2xl sm:text-3xl">Continue InwardWise Self Journey</h2>
          <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
            You've completed {completed.length} of {TOTAL_JOURNEY_STAGES} stages. Continue where you
            left off.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl sm:text-3xl">Start Your InwardWise Self Journey</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            Your InwardWise Self is built through a guided conversation designed to understand
            different aspects of who you are, the experiences that have shaped you, your patterns,
            strengths, interests, and what makes your journey unique.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            This is a conversation, not a test. There are no right or wrong answers. Share only what
            you are comfortable sharing.
          </p>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to="/avatar/dimension/$n"
          params={{ n: String(nextStage) }}
          className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)]"
        >
          {started ? "Continue InwardWise Self Journey" : "Start My Self Journey"}
        </Link>
        <button
          type="button"
          onClick={() => setShowHow((v) => !v)}
          aria-expanded={showHow}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px]"
        >
          How It Works
          <ChevronDown className={`h-3.5 w-3.5 transition ${showHow ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showHow && (
        <div className="mt-8 grid gap-8 border-t border-[color:var(--rule)] pt-8 md:grid-cols-2">
          <div>
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              Your Self Journey
            </div>
            <ol className="mt-4 space-y-4">
              {SELF_JOURNEY.map((s, i) => {
                const done = completed.includes(s.n);
                return (
                  <li key={s.n} className="flex gap-3">
                    <span
                      className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                        done
                          ? "border-[color:var(--ink)] bg-[color:var(--ink)]"
                          : "border-[color:var(--rule)]"
                      }`}
                    >
                      {done && <Check className="h-2.5 w-2.5 text-[color:var(--paper)]" />}
                    </span>
                    <div>
                      <div className="text-sm">
                        Stage {i + 1} · {s.label}
                      </div>
                      <p className="mt-0.5 text-sm text-[color:var(--muted-foreground)]">
                        {s.blurb}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="font-mono-cap mt-6 text-[10px] text-[color:var(--muted-foreground)]">
              → Your InwardWise Self
            </p>
          </div>

          <div className="space-y-6 text-sm text-[color:var(--muted-foreground)]">
            <div>
              <div className="text-[color:var(--ink)]">Why build your InwardWise Self?</div>
              <p className="mt-2 leading-relaxed text-justify">
                The goal is not to label you. It is to build a richer understanding of you that can
                become more useful as you continue using the platform. Your responses help create a
                more personalised picture of you and can make future conversations more relevant.
              </p>
            </div>
            <div>
              <div className="text-[color:var(--ink)]">You are in control.</div>
              <p className="mt-2 leading-relaxed">
                Share only what you are comfortable sharing. You can choose not to answer a
                question, and you can save and continue later.
              </p>
            </div>
            <div>
              <div className="text-[color:var(--ink)]">How long it takes</div>
              <p className="mt-2 leading-relaxed">
                This is a guided conversation and may take several minutes.
              </p>
              <p className="mt-1">5 stages · We'll explore them one at a time.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

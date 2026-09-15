import { CharacterAvatar } from "@/components/people/CharacterAvatar";
import { Button } from "@/components/ui/button";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import {
  assessmentFor,
  demonstrationType,
  type DemonstrationCharacterId,
} from "@/lib/people-assessments";
import { cn } from "@/lib/utils";

export type AssessmentView = DemonstrationCharacterId | "compare";

export function CharacterAssessment({
  view,
  onViewChange,
}: {
  view: AssessmentView;
  onViewChange: (view: AssessmentView) => void;
}) {
  return (
    <section className="mt-12" aria-labelledby="assessment-heading">
      <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Illustrative Self assessment</div>
      <h2 id="assessment-heading" className="font-display mt-3 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-tight">
        Same questions. <em className="italic text-[color:var(--royal)]">Different profiles.</em>
      </h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed">
        Alex and Mary answer the existing five-factor Self assessment directly. Their answers are fixed, fictional and psychologically consistent, showing how different answers shape different profiles.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Choose a character or comparison">
        {([
          ["alex", "Alex"],
          ["mary", "Mary"],
          ["compare", "Compare Alex & Mary"],
        ] as const).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            variant={view === id ? "default" : "outline"}
            onClick={() => onViewChange(id)}
            role="tab"
            aria-selected={view === id}
            className={cn(
              "min-h-11 rounded-full px-5",
              view === id
                ? "bg-[color:var(--royal)] text-[color:var(--paper)]"
                : "border-[color:var(--rule)] bg-[color:var(--paper)] text-[color:var(--ink)] hover:bg-[color:var(--royal)]/[0.06] hover:text-[color:var(--ink)]",
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-8" role="tabpanel">
        {view === "compare" ? <ComparisonView /> : <CharacterView id={view} />}
      </div>
    </section>
  );
}

function CharacterView({ id }: { id: DemonstrationCharacterId }) {
  const character = assessmentFor(id);
  return (
    <div>
      <CharacterProfile id={id} />
      <div className="mt-8 space-y-6">
        {AVATAR_DIMENSIONS.map((dimension) => (
          <article key={dimension.n} className="rounded-lg border border-[color:var(--rule)] p-5 md:p-7">
            <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">{dimension.section}</div>
            <h3 className="font-display mt-2 text-2xl">
              {dimension.title} <em className="italic text-[color:var(--royal)]">{dimension.italic}</em>
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{dimension.oneLine}</p>
            <div className="mt-6 space-y-6">
              {dimension.questions.map((question) => (
                <div key={question.key} className="border-t border-[color:var(--rule)] pt-5 first:border-0 first:pt-0">
                  <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Assessment question</div>
                  <p className="mt-2 text-[15px] font-medium leading-relaxed">{question.prompt}</p>
                  <div className="mt-4 border-l-2 border-[color:var(--royal)] pl-4">
                    <div className="font-mono-cap text-[10px]">{character.name}&apos;s response</div>
                    <p className="mt-2 text-[15px] leading-relaxed">{character.answers[question.key]}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-[color:var(--royal)]/[0.06] p-4">
              <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Resulting characteristic</div>
              <p className="mt-2 text-[14px] leading-relaxed">{character.factorResults[dimension.n]}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CharacterProfile({ id }: { id: DemonstrationCharacterId }) {
  const character = assessmentFor(id);
  return (
    <article className="border-y border-[color:var(--rule)] py-6 md:py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <CharacterAvatar avatarKey={character.avatarKey} name={character.name} size={96} />
        <div className="min-w-0 flex-1">
          <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Hypothetical character · {demonstrationType(id)}</div>
          <h3 className="font-display mt-2 text-3xl">{character.name}</h3>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed">{character.situation}</p>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileList label="Main motivations" values={character.motivations} />
            <ProfileList label="Major concerns" values={character.concerns} />
            <ProfileList label="Strengths" values={character.strengths} />
            <ProfileList label="Weaknesses" values={character.weaknesses} />
            <div className="sm:col-span-2">
              <dt className="font-mono-cap text-[10px] text-[color:var(--royal)]">Decision-making tendency</dt>
              <dd className="mt-2 text-sm leading-relaxed">{character.decisionStyle}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function ProfileList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <dt className="font-mono-cap text-[10px] text-[color:var(--royal)]">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed">{values.join(" · ")}</dd>
    </div>
  );
}

function ComparisonView() {
  const alex = assessmentFor("alex");
  const mary = assessmentFor("mary");
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        <CharacterProfile id="alex" />
        <CharacterProfile id="mary" />
      </div>
      <div className="mt-10 space-y-8">
        {AVATAR_DIMENSIONS.map((dimension) => (
          <section key={dimension.n}>
            <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">{dimension.section}</div>
            <h3 className="font-display mt-2 text-2xl">
              {dimension.title} <em className="italic text-[color:var(--royal)]">{dimension.italic}</em>
            </h3>
            <div className="mt-4 overflow-x-auto border border-[color:var(--rule)]">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[color:var(--rule)]">
                    <th className="w-[34%] p-4 text-xs font-semibold">Assessment question</th>
                    <th className="w-[33%] border-l border-[color:var(--rule)] p-4 text-xs font-semibold text-[color:var(--royal)]">Alex</th>
                    <th className="w-[33%] border-l border-[color:var(--rule)] p-4 text-xs font-semibold text-[color:var(--royal)]">Mary</th>
                  </tr>
                </thead>
                <tbody>
                  {dimension.questions.map((question) => (
                    <tr key={question.key} className="border-b border-[color:var(--rule)] last:border-b-0">
                      <th scope="row" className="p-4 align-top text-sm font-medium leading-relaxed">{question.prompt}</th>
                      <td className="border-l border-[color:var(--rule)] p-4 align-top text-sm leading-relaxed">{alex.answers[question.key]}</td>
                      <td className="border-l border-[color:var(--rule)] p-4 align-top text-sm leading-relaxed">{mary.answers[question.key]}</td>
                    </tr>
                  ))}
                  <tr className="bg-[color:var(--royal)]/[0.06]">
                    <th scope="row" className="p-4 align-top text-xs font-semibold text-[color:var(--royal)]">Resulting characteristic</th>
                    <td className="border-l border-[color:var(--rule)] p-4 align-top text-sm leading-relaxed">{alex.factorResults[dimension.n]}</td>
                    <td className="border-l border-[color:var(--rule)] p-4 align-top text-sm leading-relaxed">{mary.factorResults[dimension.n]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
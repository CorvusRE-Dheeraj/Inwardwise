import { outcomesFor } from "@/lib/people-outcomes";

/**
 * Shows how a fictional character's results look once their Self build is
 * complete: Decision, Self Aware and Connect, side by side.
 */
export function CharacterOutcomes({ slug, name }: { slug: string; name: string }) {
  const outcomes = outcomesFor(slug);
  if (!outcomes) return null;

  return (
    <section className="mt-10">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        How {name}&apos;s results look
      </div>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
        {outcomes.intro}
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {outcomes.blocks.map((b) => (
          <article
            key={b.product}
            className="flex flex-col rounded-2xl border border-[color:var(--rule)] p-5 md:p-6"
          >
            <h3 className="font-display text-xl leading-tight">
              {name}&apos;s{" "}
              <em className="italic text-[color:var(--royal)]">{b.product}</em>
            </h3>

            <p className="mt-4 text-[14px] leading-relaxed">{b.situation}</p>

            <div className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
              From their Self build
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
              {b.selfInsight}
            </p>

            <div className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
              What InwardWise says back
            </div>
            <ul className="mt-2 space-y-2">
              {b.response.map((line) => (
                <li
                  key={line}
                  className="rounded-lg bg-[color:var(--royal)]/[0.05] px-3 py-2 text-[14px] leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

import { personalityFor } from "@/lib/people-personalities";

/**
 * Authored personality card for a fictional character. Illustrative only.
 */
export function PersonalityProfile({ slug, name }: { slug: string; name: string }) {
  const p = personalityFor(slug);
  if (!p) return null;

  return (
    <section className="mt-8 rounded-2xl border border-[color:var(--rule)] p-6 md:p-7">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        Who {name} is
      </div>
      <h3 className="font-display mt-2 text-2xl leading-tight">
        {p.type} <em className="italic text-[color:var(--royal)]">personality</em>
      </h3>
      <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{p.typeWords}</p>
      <p className="mt-4 text-[15px] leading-relaxed">{p.summary}</p>
      <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">{p.typeNote}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            How {name} behaves
          </div>
          <ul className="mt-2 space-y-2">
            {p.traits.map((t) => (
              <li key={t} className="text-[14px] leading-relaxed">
                {t}
              </li>
            ))}
          </ul>

          <div className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
            House · {p.house.name}
          </div>
          <ul className="mt-2 space-y-2">
            {p.house.traits.map((t) => (
              <li
                key={t}
                className="text-[14px] leading-relaxed text-[color:var(--muted-foreground)]"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Five traits
          </div>
          <ul className="mt-2 space-y-2">
            {p.ocean.map((o) => (
              <li key={o.label} className="flex flex-wrap items-baseline gap-2 text-[14px]">
                <span className="min-w-[9rem]">{o.label}</span>
                <span className="rounded-full bg-[color:var(--royal)]/10 px-3 py-0.5 text-xs text-[color:var(--royal)]">
                  {o.level}
                </span>
                <span className="text-[13px] text-[color:var(--muted-foreground)]">{o.note}</span>
              </li>
            ))}
          </ul>

          <div className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
            Background
          </div>
          <ul className="mt-2 space-y-1 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
            {p.background.map((b) => (
              <li key={b}>{b}</li>
            ))}
            <li>Studied {p.major}.</li>
            <li>Politically {p.politics.toLowerCase()}.</li>
            <li>Listens to {p.music}.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

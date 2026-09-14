import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProductName, ProductText } from "@/components/products/ProductChrome";
import {
  COMPARISONS,
  COMPARISON_SUMMARY,
  INWARDWISE_DESCRIPTION,
  WISE_OWL_DESCRIPTION,
  WISE_OWL_FOUNDATIONS,
  WISE_OWL_LIMITS,
} from "@/lib/compare-models";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Models, conventional advice vs InwardWise Decision" },
      {
        name: "description",
        content:
          "Five identical decisions answered twice: once by a public-knowledge advisor, once by the objective-first InwardWise Decision framework. Then try your own.",
      },
      {
        property: "og:title",
        content: "Compare Models, conventional advice vs InwardWise Decision",
      },
      {
        property: "og:description",
        content:
          "The same difficult decision answered two ways, side by side, and why the conclusions differ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompareModels,
});

function CompareModels() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-12 md:py-16">
        <header className="max-w-3xl border-b border-[color:var(--rule)] pb-10">
          <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Compare models
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.05]">
            WiseOwl, conventional wisdom
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--muted-foreground)]">
            We have taken the conventional wisdom below and compared it with our model. The final
            output is set side by side, so you can clearly see where our model holds an advantage
            over the others.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--muted-foreground)]">
            A public-knowledge advisor tells you what most people would do. <ProductName id="decision" />{" "}
            asks whether you are solving the right problem in the first place. Below, five identical
            prompts run through both, with the conclusions set side by side.
          </p>
        </header>


        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--rule)] p-6">
            <h2 className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              Wise Owl, public knowledge filter
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              {WISE_OWL_DESCRIPTION}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/[0.04] p-6">
            <h2 className="font-mono-cap text-[10px] text-[color:var(--royal)]">
              <ProductName id="decision" />, objective first
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              <ProductText>{INWARDWISE_DESCRIPTION}</ProductText>
            </p>
          </div>
        </section>

        <h2 className="font-display mt-14 text-2xl md:text-3xl">Five worked comparisons</h2>

        {/* Table on wide screens */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[color:var(--rule)] md:block">
          <table className="w-full border-collapse text-left align-top text-sm">
            <thead>
              <tr className="bg-[color:var(--ink)]/[0.03]">
                <th className="w-[22%] p-4 font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  The prompt
                </th>
                <th className="w-[26%] p-4 font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Wise Owl concludes
                </th>
                <th className="w-[30%] p-4 font-mono-cap text-[10px] text-[color:var(--royal)]">
                  InwardWise concludes
                </th>
                <th className="w-[22%] p-4 font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Why they differ
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((c) => (
                <tr key={c.n} className="border-t border-[color:var(--rule)] align-top">
                  <td className="p-4">
                    <span className="font-mono-cap block text-[10px] text-[color:var(--muted-foreground)]">
                      {c.n} · {c.category}
                    </span>
                    <span className="mt-2 block leading-relaxed text-[color:var(--ink)]">
                      <ProductText>{c.prompt}</ProductText>
                    </span>
                  </td>
                  <td className="p-4 leading-relaxed text-[color:var(--muted-foreground)]">
                    <ProductText>{c.wiseOwl}</ProductText>
                  </td>
                  <td className="p-4 leading-relaxed text-[color:var(--ink)]"><ProductText>{c.inwardWise}</ProductText></td>
                  <td className="p-4 leading-relaxed text-[color:var(--muted-foreground)]">
                    <ProductText>{c.divergence}</ProductText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stacked cards on small screens */}
        <ol className="mt-6 space-y-6 md:hidden">
          {COMPARISONS.map((c) => (
            <li key={c.n} className="rounded-2xl border border-[color:var(--rule)] p-5">
              <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                {c.n} · {c.category}
              </span>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[color:var(--ink)]">
                <ProductText>{c.prompt}</ProductText>
              </p>
              <p className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
                Wise Owl concludes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                <ProductText>{c.wiseOwl}</ProductText>
              </p>
              <p className="font-mono-cap mt-4 text-[10px] text-[color:var(--royal)]">
                InwardWise concludes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink)]"><ProductText>{c.inwardWise}</ProductText></p>
              <p className="font-mono-cap mt-4 text-[10px] text-[color:var(--muted-foreground)]">
                Why they differ
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                <ProductText>{c.divergence}</ProductText>
              </p>
            </li>
          ))}
        </ol>

        <ul className="mt-8 space-y-2">
          {COMPARISON_SUMMARY.map((line) => (
            <li key={line} className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
               — <ProductText>{line}</ProductText>
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-2xl border border-[color:var(--rule)] p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl">
            What Wise Owl wisdom rests on
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            Traditional wisdom is not arbitrary. Wise Owl reasons through ten established filters,
            each sound within its own limits.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {WISE_OWL_FOUNDATIONS.map((f, i) => (
              <div key={f.title} className="rounded-xl border border-[color:var(--rule)] p-5">
                <p className="font-mono-cap text-[10px] text-[color:var(--royal)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[0.95rem] text-[color:var(--ink)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {f.body}
                </p>
                <p className="mt-3 text-xs italic leading-relaxed text-[color:var(--muted-foreground)]">
                  Based on {f.source}
                </p>
              </div>
            ))}
          </div>

          <p className="font-mono-cap mt-8 text-[10px] text-[color:var(--royal)]">
            Where it stops short
          </p>
          <ul className="mt-3 space-y-2">
            {WISE_OWL_LIMITS.map((line) => (
              <li
                key={line}
                className="text-sm leading-relaxed text-[color:var(--muted-foreground)]"
              >
                — {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

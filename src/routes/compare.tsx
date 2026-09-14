import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductName } from "@/components/products/ProductChrome";
import {
  COMPARISONS,
  COMPARISON_SUMMARY,
  INWARDWISE_DESCRIPTION,
  WISE_OWL_DESCRIPTION,
} from "@/lib/compare-models";
import { compareDecisionModels } from "@/lib/compare-models.functions";

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
  const [decision, setDecision] = useState("");
  const run = useServerFn(compareDecisionModels);
  const compare = useMutation({
    mutationFn: (text: string) => run({ data: { decision: text } }),
  });

  const canRun = decision.trim().length >= 15 && !compare.isPending;

  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-12 md:py-16">
        <header className="max-w-3xl border-b border-[color:var(--rule)] pb-10">
          <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Compare models
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.05]">
            The same decision, answered two ways
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--muted-foreground)]">
            A public-knowledge advisor tells you what most people would do. <ProductName id="decision" />{" "}
            asks whether you are solving the right problem in the first place. Below, five identical
            prompts run through both, then a box where you can try your own.
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
              InwardWise Decision, objective first
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              {INWARDWISE_DESCRIPTION}
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
                      {c.prompt}
                    </span>
                  </td>
                  <td className="p-4 leading-relaxed text-[color:var(--muted-foreground)]">
                    {c.wiseOwl}
                  </td>
                  <td className="p-4 leading-relaxed text-[color:var(--ink)]">{c.inwardWise}</td>
                  <td className="p-4 leading-relaxed text-[color:var(--muted-foreground)]">
                    {c.divergence}
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
                {c.prompt}
              </p>
              <p className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
                Wise Owl concludes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                {c.wiseOwl}
              </p>
              <p className="font-mono-cap mt-4 text-[10px] text-[color:var(--royal)]">
                InwardWise concludes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink)]">{c.inwardWise}</p>
              <p className="font-mono-cap mt-4 text-[10px] text-[color:var(--muted-foreground)]">
                Why they differ
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                {c.divergence}
              </p>
            </li>
          ))}
        </ol>

        <ul className="mt-8 space-y-2">
          {COMPARISON_SUMMARY.map((line) => (
            <li key={line} className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              — {line}
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-2xl border border-[color:var(--rule)] p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl">Try your own decision</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            Describe a decision in a few sentences and see both answers side by side. This is a
            preview, not a full session, and nothing here is saved.
          </p>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={4}
            maxLength={1200}
            placeholder="e.g. I have been offered a role in another city, but my parents depend on me being close by."
            className="mt-5 w-full rounded-xl border border-[color:var(--rule)] bg-transparent p-4 text-sm leading-relaxed outline-none focus-visible:border-[color:var(--royal)]"
          />
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!canRun}
              onClick={() => compare.mutate(decision.trim())}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] transition hover:opacity-90 disabled:opacity-40"
            >
              {compare.isPending ? "Comparing…" : "Compare both models"}
            </button>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              A few sentences works best.
            </span>
          </div>

          {compare.isError && (
            <p className="mt-4 text-sm text-[color:var(--royal)]">
              {(compare.error as Error).message}
            </p>
          )}

          {compare.data && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-[color:var(--rule)] p-5">
                <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Wise Owl concludes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {compare.data.wiseOwl}
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/[0.04] p-5">
                <p className="font-mono-cap text-[10px] text-[color:var(--royal)]">
                  InwardWise concludes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]">
                  {compare.data.inwardWise}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Why they differ
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink)]">
                  {compare.data.divergence}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

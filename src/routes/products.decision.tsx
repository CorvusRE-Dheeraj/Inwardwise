import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CtaRow, ProductHeader } from "@/components/products/ProductChrome";
import { getProduct, OOOI_PROMISE, OOOI_STAGES } from "@/lib/products";

const product = getProduct("decision");

export const Route = createFileRoute("/products/decision")({
  head: () => ({
    meta: [
      { title: "InwardWise Decision — Ask the right question | InwardWise" },
      { name: "description", content: product.tagline },
      { property: "og:title", content: "InwardWise Decision | InwardWise" },
      { property: "og:description", content: product.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DecisionProduct,
});

function DecisionProduct() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader
          eyebrow="Product I · Decision"
          name={product.name}
          tagline={product.tagline}
        />

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
          {product.summary}
        </p>

        <CtaRow actions={[product.cta, { label: "Read past sessions", to: "/examples" }]} />

        <section className="mt-16">
          <h2 className="font-display text-3xl tracking-tight">
            The seven-stage Objective-Oriented Out-In framework
          </h2>
          <ol className="mt-8 border-t border-[color:var(--rule)]">
            {OOOI_STAGES.map((stage, i) => (
              <li
                key={stage}
                className="grid gap-2 border-b border-[color:var(--rule)] py-5 sm:grid-cols-[90px_1fr] sm:items-baseline"
              >
                <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Stage {i + 1}
                </span>
                <span className="text-lg">{stage}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
            {OOOI_PROMISE}
          </p>
        </section>

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">What a session gives you</h2>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              InwardWise Decision is for choices that carry real weight: career moves, financial
              trade-offs, relationship transitions, health decisions, or any situation where the
              answer feels unclear because the question itself is unclear.
            </p>
            <p>
              You work through the seven stages in conversation with an AI guide. At each stage the
              guide asks one focused question, reflects back what it hears, and only moves forward
              once the answer is solid enough to build on. You can type or speak your responses, and
              you can pause, go back, or revise at any point.
            </p>
            <p>
              By the end you leave with a clarified objective, the assumptions and fears that were
              distorting it, a set of viable solutions, and a concrete boundary that tells you which
              option actually fits.
            </p>
            <p>
              Everything you share is private to your account. Sessions are saved so you can return,
              compare, and build a personal decision history over time.
            </p>
          </div>
        </section>

        <div className="mt-14">
          <CtaRow actions={[product.cta]} />
        </div>
      </div>
    </AppShell>
  );
}

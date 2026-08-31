import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products — Decision, Self, Connect | InwardWise" },
      {
        name: "description",
        content:
          "The three InwardWise products: Decision for asking the right question, Self for understanding your inner world, and Connect for finding where you belong.",
      },
      { property: "og:title", content: "Products — Decision, Self, Connect | InwardWise" },
      {
        property: "og:description",
        content: "Decision, Self and Connect — three products, one inward practice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsOverview,
});

function ProductsOverview() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="mx-auto w-[min(1280px,calc(100%-2rem))] pt-12 md:pt-20">
          <div className="flex items-center justify-between">
            <span className="font-mono-cap">InwardWise · Products</span>
            <span className="hidden font-mono-cap md:inline">Decision · Self · Connect</span>
          </div>
          <div className="hairline mt-4" />
          <h1 className="font-display mt-12 max-w-4xl text-[clamp(2.6rem,8vw,6rem)] leading-[0.98] tracking-tight">
            Three products, one <em className="italic text-[color:var(--royal)]">inward practice</em>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
            Choose the one that matches what you are carrying today.
          </p>
        </div>
      </section>

      <section className="mx-auto w-[min(1280px,calc(100%-2rem))] py-16 md:py-24">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <motion.li
              key={p.id}
              id={p.anchor}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              className="scroll-mt-28"
            >
              <article className="flex h-full flex-col rounded-2xl border border-[color:var(--rule)] p-7 target:border-[color:var(--royal)] md:p-8">
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  § 0{i + 1}
                </div>
                <h2 className="font-display mt-4 text-[1.9rem] leading-tight tracking-tight">
                  {p.name}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[color:var(--ink)]">
                  {p.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-justify text-[color:var(--muted-foreground)]">
                  {p.summary}
                </p>
                <div className="mt-auto pt-8">
                  <Link
                    to={p.href}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--royal)]"
                  >
                    Explore {p.shortName} <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </motion.li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

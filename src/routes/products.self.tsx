import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ApprovedCopyPlaceholder,
  CtaRow,
  Disclaimer,
  ProductHeader,
} from "@/components/products/ProductChrome";
import { getProduct, SELF_DISCLAIMER, SELF_SUB_PRODUCTS } from "@/lib/products";

const product = getProduct("self");

export const Route = createFileRoute("/products/self")({
  head: () => ({
    meta: [
      { title: "InwardWise Self — Understand your inner self | InwardWise" },
      { name: "description", content: product.tagline },
      { property: "og:title", content: "InwardWise Self | InwardWise" },
      { property: "og:description", content: product.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelfProduct,
});

function SelfProduct() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader eyebrow="Product II · Self" name={product.name} tagline={product.tagline} />

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
          {product.summary}
        </p>

        <CtaRow
          actions={[
            { label: "Build My Self", to: "/avatar", primary: true },
            { label: "Use Self Aware", to: "/avatar/ask" },
          ]}
        />

        <Disclaimer>{SELF_DISCLAIMER}</Disclaimer>

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">In depth</h2>
          <ApprovedCopyPlaceholder section="Full InwardWise Self narrative from the approved Website Edits document: what the Self is, how the guided conversation works, privacy, and how the Self is used afterwards." />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-3xl tracking-tight">Also under Self</h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {SELF_SUB_PRODUCTS.map((s) => (
              <li key={s.id}>
                <article className="flex h-full flex-col rounded-2xl border border-[color:var(--rule)] p-7">
                  <h3 className="font-display text-2xl tracking-tight">{s.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-justify text-[color:var(--muted-foreground)]">
                    {s.summary}
                  </p>
                  <div className="mt-auto pt-6">
                    <Link
                      to="/products/calm-mantra"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 py-2.5 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                    >
                      Learn more <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

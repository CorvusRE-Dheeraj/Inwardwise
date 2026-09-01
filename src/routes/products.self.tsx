import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
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
          <h2 className="font-display text-3xl tracking-tight">What the InwardWise Self is</h2>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              The InwardWise Self is a private, structured reflection of who you are across five
              factors. It is not a diagnostic label, a personality score, or a public profile. It is
              a working map you build yourself, one question at a time, so the system can advise
              you in a way that actually fits your life.
            </p>
            <p>
              The interview uses a guided, conversational style. Each question is designed to
              help you notice patterns, values, and history without forcing you into categories you
              do not recognise. You answer only what you want to answer, and you can stop and resume
              at any point.
            </p>
            <p>
              Your Self is encrypted behind a PIN that never leaves your browser. We cannot read it,
              sell it, or use it to target you. It exists only to make your own decisions and
              reflections more grounded.
            </p>
            <p>
              Once built, your Self can be used in InwardWise Decision, InwardWise Connect, or the
              Self Aware consultation chat to give answers that feel like they came from someone who
              knows you, because the model is reading from your own words.
            </p>
          </div>
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

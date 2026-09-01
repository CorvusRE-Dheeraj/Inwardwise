import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CtaRow, ProductHeader } from "@/components/products/ProductChrome";
import { getProduct } from "@/lib/products";

const product = getProduct("connect");

export const Route = createFileRoute("/products/connect")({
  head: () => ({
    meta: [
      { title: "InwardWise Connect — Find where you belong | InwardWise" },
      { name: "description", content: product.tagline },
      { property: "og:title", content: "InwardWise Connect | InwardWise" },
      { property: "og:description", content: product.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectProduct,
});

function ConnectProduct() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader
          eyebrow="Product III · Connect"
          name={product.name}
          tagline={product.tagline}
        />

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
          {product.summary}
        </p>

        <CtaRow actions={[product.cta]} />

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">How Connect works</h2>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              Connect starts with whatever is on your mind. You describe a situation, a feeling, or a
              question, and choose how you want to work with it: make a clear decision, consult your
              built InwardWise Self, or simply connect with material that matches what you are
              going through.
            </p>
            <p>
              If you have already built your Self, the response is shaped by your own factors and
              history. If you have not, or if you prefer to stay anonymous, Connect draws from a
              curated library of excerpts, guided reflections, and anonymised stories from people who
              have faced similar territory.
            </p>
            <p>
              Material is chosen for relevance, not shock value. Every story is reviewed and published
              anonymously, with identifying details removed. You can choose to record your own story
              for the library, or keep the conversation entirely private.
            </p>
            <p>
              Nothing you type in Connect is shared with other users without explicit consent. If you
              contribute a story, it is separated from your account before publication.
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

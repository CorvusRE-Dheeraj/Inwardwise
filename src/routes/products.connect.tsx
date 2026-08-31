import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ApprovedCopyPlaceholder,
  CtaRow,
  ProductHeader,
} from "@/components/products/ProductChrome";
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
          <h2 className="font-display text-3xl tracking-tight">In depth</h2>
          <ApprovedCopyPlaceholder section="Full InwardWise Connect narrative from the approved Website Edits document: what Connect is for, how material and stories are chosen, and what stays private." />
        </section>

        <div className="mt-14">
          <CtaRow actions={[product.cta]} />
        </div>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ApprovedCopyPlaceholder,
  CtaRow,
  Disclaimer,
  ProductHeader,
} from "@/components/products/ProductChrome";
import { SELF_DISCLAIMER } from "@/lib/products";

export const Route = createFileRoute("/products/calm-mantra")({
  head: () => ({
    meta: [
      { title: "InwardWise Calm & Mantra — Quiet the mind | InwardWise" },
      {
        name: "description",
        content:
          "InwardWise Calm and InwardWise Mantra sit under Self: guided calm practice, and a personal phrase built from your own words.",
      },
      { property: "og:title", content: "InwardWise Calm & Mantra | InwardWise" },
      {
        property: "og:description",
        content: "Guided calm practice, and a personal mantra built from your own words.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalmMantra,
});

function CalmMantra() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader
          eyebrow="Under Self · Calm & Mantra"
          name="InwardWise Calm & Mantra"
          tagline="Two quiet practices that sit under InwardWise Self."
        />

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">InwardWise Calm</h2>
          <p className="max-w-2xl text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            Short, spoken calm practice shaped around what you brought with you today, rather than a
            generic recording.
          </p>
          <ApprovedCopyPlaceholder section="Full InwardWise Calm copy from the approved Website Edits document." />
          <CtaRow actions={[{ label: "Start Calm", to: "/meditation", primary: true }]} />
        </section>

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">InwardWise Mantra</h2>
          <p className="max-w-2xl text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            A personal phrase you can return to, built from your own words rather than borrowed from
            someone else's tradition.
          </p>
          <ApprovedCopyPlaceholder section="Full InwardWise Mantra copy from the approved Website Edits document (single passage only — the duplicate Mantra passage in the source is intentionally omitted)." />
          <CtaRow actions={[{ label: "Create My Mantra", to: "/meditation", primary: true }]} />
        </section>

        <Disclaimer>{SELF_DISCLAIMER}</Disclaimer>
      </div>
    </AppShell>
  );
}

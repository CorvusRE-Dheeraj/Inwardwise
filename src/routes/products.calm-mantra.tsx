import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
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
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              Calm is a short, spoken meditation built around what you brought with you today. It
              does not ask you to clear your mind or follow a generic recording. Instead, you describe
              what is happening, and the guide shapes a calm practice around that situation.
            </p>
            <p>
              You can listen in your browser, receive it as a text message to read or share, or
              connect it to a phone call for a fully guided experience. Each session is private
              and generated fresh.
            </p>
          </div>
          <CtaRow actions={[{ label: "Start Calm", to: "/meditation", primary: true }]} />
        </section>

        <section className="mt-16 space-y-6">
          <h2 className="font-display text-3xl tracking-tight">InwardWise Mantra</h2>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              Mantra creates a single phrase you can return to when you need to steady yourself. It
              is built from your own words and values, not borrowed from a tradition that does not
              belong to you.
            </p>
            <p>
              The guide draws on what you have shared about your situation and your Self, then
              offers a few candidates. You pick the one that lands, refine it, and keep it available
              for whenever you need to come back to center.
            </p>
          </div>
          <CtaRow actions={[{ label: "Create My Mantra", to: "/meditation", primary: true }]} />
        </section>

        <Disclaimer>{SELF_DISCLAIMER}</Disclaimer>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { CtaRow, Disclaimer, ProductHeader, ProductName } from "@/components/products/ProductChrome";
import { getProduct } from "@/lib/products";

const product = getProduct("self");

export const Route = createFileRoute("/products/self")({
  head: () => ({
    meta: [
      { title: "InwardWise Self, Understand your inner self | InwardWise" },
      { name: "description", content: product.tagline },
      { property: "og:title", content: "InwardWise Self | InwardWise" },
      { property: "og:description", content: product.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelfProduct,
});

function Volume({
  n,
  children,
  className = "",
}: {
  n: ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-20 first:mt-0 ${className}`}>
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">{n}</div>
      <div className="hairline mt-4" />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function SelfProduct() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader
          eyebrow="Product II · Self"
          name={<ProductName id="self" />}
          tagline="Understand your inner self. Use that understanding to navigate the outer world."
        />

        <Volume n={<>V01 · <ProductName id="self" /></>}>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
            <p>
              <ProductName id="self" /> grew from more than five years of the founder&apos;s interdisciplinary
              research into human happiness, stress physiology, psychology, behavior, and the
              underlying factors that shape us as individuals. Through scientific literature,
              observation, and repeated refinement, asking whether an observed characteristic is
              fundamental or can be explained by something deeper, this work evolved into{" "}
              <strong className="font-medium text-[color:var(--ink)]">
                five dimensions of the inner self
              </strong>
              . The framework is an InwardWise synthesis rather than a clinical psychological model:
              its purpose is not to label you, but to create a structured and evolving understanding
              of who you are.
            </p>
            <p>
              With{" "}
              <strong className="font-medium text-[color:var(--ink)]"><ProductName id="self" /> Build</strong>,
              you explore these five dimensions through thoughtful, sometimes deeply personal
              questions. Once built,{" "}
              <strong className="font-medium text-[color:var(--ink)]"><ProductName id="self" /> Aware</strong>{" "}
              lets you ask questions, share feelings, examine recurring patterns, and explore your
              experiences with AI that can consider the personal context you have chosen to provide.
              That understanding can also make <ProductName id="decision" />,{" "}
              <ProductName id="calm" />, and <ProductName id="connect" /> more
              personally relevant, helping you examine how your motivations, experiences, fears,
              strengths, relationships, and patterns may influence your decisions and wellbeing.
            </p>
            <p>
              Your inner self is deeply personal, so you build it at your own pace and remain in
              control of what you share. The objective isn&apos;t for AI to define who you are or tell
              you how to live.{" "}
              <strong className="font-medium text-[color:var(--ink)]">
                You tell InwardWise who you are; AI helps you examine what that may mean.
              </strong>{" "}
              As you change through life, your <ProductName id="self" /> can evolve with you, helping you
              understand your patterns, adapt deliberately, make clearer decisions, and live more
              intentionally.
            </p>
          </div>

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
            Know yourself → Understand your patterns → Adapt deliberately → Decide with greater
            clarity → Live more intentionally
          </p>

          <p className="mt-6 max-w-2xl font-display text-[clamp(1.15rem,2.4vw,1.6rem)] italic leading-snug text-[color:var(--royal)]">
            Explore your five dimensions. Create a private, evolving understanding of yourself. Then
            see what changes when AI doesn&apos;t just consider your question, it can also consider the
            person asking it.
          </p>

          <Disclaimer>
            <ProductName id="self" /> is designed for self-reflection, personal development, and decision
            support. Its five-dimensional framework is an InwardWise synthesis and should not be
            interpreted as a clinical psychological assessment or diagnostic model. InwardWise does
            not replace qualified medical or mental health professionals.
          </Disclaimer>

          <CtaRow
            actions={[
              { label: "Self Build", to: "/avatar", primary: true },
              { label: "Self Aware", to: "/avatar/ask" },
            ]}
          />
        </Volume>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          <Volume n={<>V02 · <ProductName id="calm" /></>}>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] tracking-tight">
              <ProductName id="calm" />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              Quiet the mental noise. Create space to reconnect with yourself.
            </p>
            <CtaRow actions={[{ label: "Calm", to: "/products/calm-mantra" }]} />
          </Volume>

          <Volume n={<>V03 · <ProductName id="mantra" /></>}>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] tracking-tight">
              <ProductName id="mantra" />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              The messages you repeatedly tell yourself can influence how you approach your day. Make
              them worth repeating.
            </p>
            <CtaRow actions={[{ label: "Mantra", to: "/products/calm-mantra" }]} />
          </Volume>
        </div>
      </div>
    </AppShell>
  );
}

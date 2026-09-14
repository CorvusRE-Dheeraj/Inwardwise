import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CtaRow, ProductHeader, ProductName } from "@/components/products/ProductChrome";
import { getProduct, OOOI_PROMISE } from "@/lib/products";

const product = getProduct("decision");

export const Route = createFileRoute("/products/decision")({
  head: () => ({
    meta: [
      { title: "InwardWise Decision, Ask the right question | InwardWise" },
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
          name={<ProductName id="decision" />}
          tagline="Before searching for the right answer, make sure you are solving the right problem."
        />

        <div className="mt-10 max-w-2xl space-y-5 text-base leading-relaxed text-[color:var(--muted-foreground)]">
          <p>
            <ProductName id="decision" /> is built around the founder&apos;s{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              seven-stage Objective-Oriented Out-In (OOOI) framework
            </strong>
            , originally developed during his Ph.D. years and refined through repeated application
            to real decisions. The framework starts from a simple observation: we often spend
            enormous effort searching for solutions without spending enough time defining what we
            are actually trying to achieve. Instead of rushing from problem to solution, OOOI
            repeatedly examines the objective, challenging assumptions, bias, fear, ego, social
            conditioning, and short-term thinking, before defining a broader decision boundary and
            working inward toward possible solutions.
          </p>
          <p>
            What once required a lengthy paper-and-pencil exercise can now become an interactive
            AI-guided process. <ProductName id="decision" /> takes you through{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              Situation → Objective → Solutions → Remove Bias &amp; Fear → Abstract the Objective →
              Define the Boundary → Work Out-In.
            </strong>{" "}
            At every stage, you can question the reasoning, modify the objective, add information,
            examine alternatives, and consider consequences. AI makes the process faster and easier
            to explore, while the framework provides the structure and discipline to keep the
            conversation focused on the objective rather than prematurely settling on an answer.
          </p>
          <p>
            Most importantly,{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              <ProductName id="decision" /> does not make the decision for you.
            </strong>{" "}
            It helps you step above the immediate problem, see your assumptions and alternatives
            from a wider perspective, and then return to the decision with greater clarity.{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              The technology provides speed. The framework provides discipline. You provide the
              judgment.
            </strong>
          </p>
        </div>

        <p className="mt-10 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
          {OOOI_PROMISE}
        </p>

        <p className="mt-6 max-w-2xl font-display text-[clamp(1.2rem,2.6vw,1.7rem)] italic leading-snug text-[color:var(--royal)]">
          Bring us a difficult decision. Be your own judge.
        </p>

        <CtaRow
          actions={[
            { label: "Start My Decision", to: "/decision", primary: true },
            { label: "Read Example Decisions", to: "/examples" },
            { label: "Compare Models", to: "/compare" },
          ]}
        />
      </div>
    </AppShell>
  );
}

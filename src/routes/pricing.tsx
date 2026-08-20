import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — InwardWise" },
      { name: "description", content: "Free during beta. Corporate pricing available on request." },
      { property: "og:title", content: "Pricing — InwardWise" },
      { property: "og:description", content: "Free during beta. Corporate plans on request." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl">Free while we&rsquo;re in beta.</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          We&rsquo;re actively refining InwardWise with early users. During this period, the
          full framework is available at no cost.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Beta
            </div>
            <div className="font-display mt-3 text-4xl">Free</div>
            <p className="mt-1 text-sm text-muted-foreground">For individuals during our beta phase.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Full 7-stage decision facilitator",
                "Voice input & playback",
                "Private session history",
                "PDF export of complete sessions",
                "Access to every Area",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
            >
              Get started
            </Link>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Corporate</div>
            <div className="font-display mt-3 text-4xl">Custom</div>
            <p className="mt-1 text-sm text-muted-foreground">
              For teams, organizations and institutions.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Team seats & admin controls",
                "Custom facilitator personas",
                "Private deployment options",
                "SSO & compliance support",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/feedback"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-glass-border px-5 py-2.5 text-sm"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

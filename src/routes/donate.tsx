import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — InwardWise" },
      { name: "description", content: "Support InwardWise's non-profit projects — suicide, depression and anxiety prevention." },
      { property: "og:title", content: "Donate — InwardWise" },
      { property: "og:description", content: "Donated funds are earmarked 100% for non-profit projects." },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Donate</p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl">Fund the non-profit side of this work.</h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            We are not a non-profit organization. But given the world&rsquo;s race to profits, we believe
            a socially conscious organization can do both — use commercial development and innovation
            for social good, while accepting that, as a for-profit, success is not guaranteed given
            the intense competition for investment dollars.
          </p>
          <p>
            At this early stage, we seek donations earmarked for social and individual wellbeing
            causes rather than commercial ones. Some projects will be for profit, some will be
            non-profit. Rather than shut the non-profit projects down, we plan to continue developing
            them as long as social benefits accrue.
          </p>
          <p className="text-foreground">
            <strong>100% of donated funds go to non-profit projects.</strong>
          </p>
        </div>

        <div className="mt-10 glass rounded-3xl p-6">
          <h2 className="font-display text-2xl">Ways to give</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&rsquo;re finalising direct payment options. Until then, please reach out and we&rsquo;ll set
            up a secure transfer through your preferred platform.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {["Card", "Bank transfer", "PayPal", "Stripe", "Crypto"].map((m) => (
              <span key={m} className="glass rounded-full px-3 py-1">{m}</span>
            ))}
          </div>
          <button
            disabled
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background opacity-60"
            title="Donation portal coming soon"
          >
            <Heart className="h-4 w-4" /> Donate (coming soon)
          </button>
        </div>
      </div>
    </AppShell>
  );
}

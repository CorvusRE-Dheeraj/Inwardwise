import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductName } from "@/components/products/ProductChrome";
import { ConnectPathways } from "@/components/connect/ConnectPathways";
import { ConnectAiSuggest } from "@/components/connect/ConnectAiSuggest";

export const Route = createFileRoute("/_authenticated/connect/")({
  head: () => ({
    meta: [
      { title: "Connect, Be Yourself and Belong | InwardWise" },
      {
        name: "description",
        content:
          "Share what is on your mind and find relevant perspectives, anonymous experiences and constructive ways to connect, while your private Self stays private.",
      },
      { property: "og:title", content: "Connect, Be Yourself and Belong | InwardWise" },
      {
        property: "og:description",
        content: "A private, AI-mediated way to discover that you are not alone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="mx-auto w-[min(1100px,calc(100%-2rem))] pt-12 md:pt-20">
          <div className="flex items-center justify-between">
            <span className="font-mono-cap"><ProductName id="connect" /></span>
            <span className="hidden font-mono-cap md:inline">Be Yourself and Belong</span>
          </div>
          <div className="hairline mt-4" />

          <h1 className="font-display mt-12 max-w-3xl text-[clamp(2.6rem,8vw,5.2rem)] leading-[0.98] tracking-tight">
            Connect <em className="italic text-[color:var(--royal)]">AI</em>
          </h1>
          <p className="mt-6 max-w-2xl font-display text-[clamp(1.3rem,3vw,2rem)] italic leading-snug text-[color:var(--royal)]">
            Be yourself. Discover that you are not alone.
          </p>
        </div>
      </section>

      <ConnectAiSuggest />
      <ConnectPathways />
    </AppShell>
  );
}

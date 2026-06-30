import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/examples")({
  head: () => ({ meta: [{ title: "Examples — OOOI" }] }),
  component: Examples,
});

const SAMPLES = [
  {
    category: "Career",
    pseudo: "I want to leave my job.",
    higher: "I want work that funds the life I value and uses what I'm good at — without trading my health for it.",
    boundary: "Identify whether the conditions exist to make a sustainable career move while protecting income stability for the next 12 months.",
  },
  {
    category: "Marriage",
    pseudo: "I want a divorce.",
    higher: "I want a healthy, stable life where both adults and children can thrive emotionally.",
    boundary: "Identify whether both partners are willing to rebuild trust while protecting children's wellbeing and financial stability.",
  },
  {
    category: "Business",
    pseudo: "I want to launch my startup full-time.",
    higher: "I want meaningful, self-directed work that compounds into financial and creative freedom.",
    boundary: "Identify whether the market signal and runway exist to commit full-time without putting family finances at risk.",
  },
  {
    category: "Finance",
    pseudo: "I want to invest in real estate.",
    higher: "I want long-term financial security that lets me make decisions from strength, not pressure.",
    boundary: "Identify whether this asset class fits my risk tolerance and liquidity needs over a 10-year horizon.",
  },
];

function Examples() {
  return (
    <AppShell>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Examples</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">From rushed answer to right objective</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A few situations and how the OOOI framework reframes them before any advice is given.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {SAMPLES.map((s) => (
          <article key={s.category} className="glass-strong rounded-3xl p-6">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.category}</span>
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pseudo objective</div>
              <div className="mt-1 text-sm text-muted-foreground">"{s.pseudo}"</div>
            </div>
            <div className="mt-4 rounded-2xl bg-accent/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-accent">Higher objective</div>
              <div className="mt-1 text-sm">{s.higher}</div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Boundary</div>
              <div className="mt-1 text-sm">{s.boundary}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/decision" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm text-background">
          Try it with your own situation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AppShell>
  );
}

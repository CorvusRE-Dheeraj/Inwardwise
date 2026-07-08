import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Clock, CheckCircle2, BarChart3, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  loadDecisions, decisionTitle, isComplete, STEPS,
  type DecisionState,
} from "@/lib/ooi-framework";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OOOI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [decisions, setDecisions] = useState<DecisionState[]>([]);
  useEffect(() => { setDecisions(loadDecisions()); }, []);

  const completed = decisions.filter(isComplete);
  const inProgress = decisions.filter((d) => !isComplete(d));

  const biasCounts: Record<string, number> = {};
  decisions.forEach((d) => d.refine?.biases?.forEach((b) => {
    biasCounts[b.name] = (biasCounts[b.name] ?? 0) + 1;
  }));
  const topBiases = Object.entries(biasCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const categoryCounts: Record<string, number> = {};
  decisions.forEach((d) => { categoryCounts[d.category] = (categoryCounts[d.category] ?? 0) + 1; });
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
          <h1 className="font-display mt-2 text-4xl">Your decisions</h1>
        </div>
        <Link to="/decision" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
          <Plus className="h-4 w-4" /> New decision
        </Link>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        <Stat icon={BarChart3} label="Total" value={decisions.length} />
        <Stat icon={CheckCircle2} label="Completed" value={completed.length} />
        <Stat icon={Clock} label="In progress" value={inProgress.length} />
        <Stat icon={Sparkles} label="Steps averaged" value={decisions.length ? Math.round(decisions.reduce((a, d) => a + (STEPS.findIndex((s) => s.id === d.step) + 1), 0) / decisions.length) : 0} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent decisions</h2>
          {decisions.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3">
              {decisions.slice(0, 10).map((d) => (
                <DecisionRow key={d.id} d={d} />
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-medium">Biases most frequently detected</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {topBiases.length === 0 && <li className="text-xs text-muted-foreground">No data yet.</li>}
              {topBiases.map(([name, n]) => (
                <li key={name} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="text-xs">{n}×</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-medium">Decision categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.length === 0 && <span className="text-xs text-muted-foreground">No data yet.</span>}
              {categories.map(([c, n]) => (
                <span key={c} className="glass rounded-full px-3 py-1 text-xs">
                  {c} <span className="text-muted-foreground">· {n}</span>
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-display mt-2 text-3xl">{value}</div>
    </div>
  );
}

function DecisionRow({ d }: { d: DecisionState }) {
  const step = STEPS.find((s) => s.id === d.step)!;
  const pct = Math.round((step.index / STEPS.length) * 100);
  return (
    <li className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{d.category}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{new Date(d.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-1 truncate font-medium">
            {decisionTitle(d)}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Step {step.index} · {step.label}</span>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-foreground/5">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <button className="text-muted-foreground transition hover:text-foreground" aria-label="Favorite">
          <Star className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="glass-strong rounded-3xl p-10 text-center">
      <div className="font-display text-2xl">Nothing here yet</div>
      <p className="mt-2 text-sm text-muted-foreground">Run your first structured decision to see it appear here.</p>
      <Link to="/decision" className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
        Start decision
      </Link>
    </div>
  );
}

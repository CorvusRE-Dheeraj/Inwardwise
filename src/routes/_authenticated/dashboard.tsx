import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, Search, Trash2, CheckCircle2, XCircle, CircleSlash, HelpCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { STAGES } from "@/lib/ooi-stages";
import {
  deleteSession,
  loadSessions,
  searchSessions,
  setOutcome,
  type DecisionOutcome,
  type DecisionSession,
} from "@/lib/ooi-storage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard, Objective Solution Framework" }] }),
  component: Dashboard,
});

const OUTCOMES: { id: DecisionOutcome; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "successful", label: "Worked out", icon: CheckCircle2 },
  { id: "failed", label: "Did not work", icon: XCircle },
  { id: "not_attempted", label: "Never acted on", icon: CircleSlash },
];

function outcomeOf(s: DecisionSession): DecisionOutcome {
  return s.outcome ?? "unmarked";
}

function Dashboard() {
  const [sessions, setSessions] = useState<DecisionSession[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { setSessions(loadSessions()); }, []);

  const counts = {
    successful: sessions.filter((s) => outcomeOf(s) === "successful").length,
    failed: sessions.filter((s) => outcomeOf(s) === "failed").length,
    not_attempted: sessions.filter((s) => outcomeOf(s) === "not_attempted").length,
    unmarked: sessions.filter((s) => outcomeOf(s) === "unmarked").length,
  };

  const categoryCounts: Record<string, number> = {};
  sessions.forEach((s) => { categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1; });
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const results = useMemo(() => searchSessions(query, sessions), [query, sessions]);

  const remove = (id: string) => {
    deleteSession(id);
    setSessions(loadSessions());
  };

  const mark = (id: string, outcome: DecisionOutcome) => {
    setOutcome(id, outcome);
    setSessions(loadSessions());
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
          <h1 className="font-display mt-2 text-3xl sm:text-4xl">Your decisions</h1>
        </div>
        <Link to="/decision" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
          <Plus className="h-4 w-4" /> New decision
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <Stat icon={BarChart3} label="Total" value={sessions.length} />
        <Stat icon={CheckCircle2} label="Worked out" value={counts.successful} />
        <Stat icon={XCircle} label="Did not work" value={counts.failed} />
        <Stat icon={CircleSlash} label="Never acted on" value={counts.not_attempted} />
        <Stat icon={HelpCircle} label="Not marked yet" value={counts.unmarked} />
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search every session you have ever run"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {query ? `${results.length} matching sessions` : "All sessions"}
          </h2>
          {results.length === 0 ? (
            query ? (
              <div className="glass rounded-2xl p-8 text-sm text-muted-foreground">Nothing matches that search.</div>
            ) : (
              <EmptyState />
            )
          ) : (
            <ul className="space-y-3">
              {results.map((s) => (
                <SessionRow key={s.id} s={s} onDelete={() => remove(s.id)} onMark={(o) => mark(s.id, o)} />
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.length === 0 && <span className="text-xs text-muted-foreground">No data yet.</span>}
              {categories.map(([c, n]) => (
                <span key={c} className="glass rounded-full px-3 py-1 text-xs">
                  {c} <span className="text-muted-foreground">· {n}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="text-sm font-medium">Stage distribution</h3>
            <ul className="mt-3 space-y-1.5 text-xs">
              {STAGES.map((st) => {
                const n = sessions.filter((s) => s.stage === st.n).length;
                const pct = sessions.length ? (n / sessions.length) * 100 : 0;
                return (
                  <li key={st.id} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-muted-foreground">{st.n}. {st.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{n}</span>
                  </li>
                );
              })}
            </ul>
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

function SessionRow({
  s,
  onDelete,
  onMark,
}: {
  s: DecisionSession;
  onDelete: () => void;
  onMark: (o: DecisionOutcome) => void;
}) {
  const stage = STAGES.find((x) => x.n === s.stage) ?? STAGES[0];
  const pct = Math.round((stage.n / STAGES.length) * 100);
  const current = outcomeOf(s);
  return (
    <li className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/decision"
          search={{ id: s.id }}
          className="min-w-0 flex-1 group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.category}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-1 truncate font-medium group-hover:text-accent">{s.title}</div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Stage {stage.n} · {stage.name}</span>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-foreground/5">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Link>
        <button
          onClick={onDelete}
          className="text-muted-foreground transition hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-foreground/5 pt-3">
        <span className="text-[11px] text-muted-foreground">How did it turn out?</span>
        {OUTCOMES.map((o) => {
          const Icon = o.icon;
          const active = current === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onMark(active ? "unmarked" : o.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition ${
                active
                  ? "border-transparent bg-foreground text-background"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {o.label}
            </button>
          );
        })}
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="glass-strong rounded-3xl p-10 text-center">
      <div className="font-display text-2xl">Nothing here yet</div>
      <p className="mt-2 text-sm text-muted-foreground">Start your first facilitated decision session.</p>
      <Link to="/decision" className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
        Start decision
      </Link>
    </div>
  );
}

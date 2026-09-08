import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, Search, Trash2, CheckCircle2, XCircle, CircleSlash } from "lucide-react";
import { STAGES } from "@/lib/ooi-stages";
import {
  deleteSession,
  loadSessions,
  searchSessions,
  setOutcome,
  type DecisionOutcome,
  type DecisionSession,
} from "@/lib/ooi-storage";

export const Route = createFileRoute("/_authenticated/account/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [sessions, setSessions] = useState<DecisionSession[]>([]);
  useEffect(() => { setSessions(loadSessions()); }, []);

  const completed = sessions.filter((s) => s.stage >= 7);
  const inProgress = sessions.filter((s) => s.stage < 7);
  const avgStage = sessions.length ? (sessions.reduce((a, s) => a + s.stage, 0) / sessions.length).toFixed(1) : "0";

  const remove = (id: string) => { deleteSession(id); setSessions(loadSessions()); };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Your decisions</h1>
          <p className="mt-1 text-sm text-muted-foreground">A summary of every session you&rsquo;ve run.</p>
        </div>
        <Link to="/decision" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
          <Plus className="h-4 w-4" /> New decision
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Stat icon={BarChart3} label="Total" value={sessions.length} />
        <Stat icon={CheckCircle2} label="Completed" value={completed.length} />
        <Stat icon={Clock} label="In progress" value={inProgress.length} />
        <Stat icon={Sparkles} label="Avg. stage" value={avgStage} />
      </div>

      <h2 className="mt-8 text-sm font-medium text-muted-foreground">Recent sessions</h2>
      {sessions.length === 0 ? (
        <div className="glass-strong mt-3 rounded-3xl p-10 text-center">
          <div className="font-display text-2xl">Nothing here yet</div>
          <p className="mt-2 text-sm text-muted-foreground">Start your first facilitated decision session.</p>
          <Link to="/decision" className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background">Start decision</Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {sessions.slice(0, 20).map((s) => {
            const stage = STAGES.find((x) => x.n === s.stage) ?? STAGES[0];
            const pct = Math.round((stage.n / STAGES.length) * 100);
            return (
              <li key={s.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <Link to="/decision" search={{ id: s.id }} className="min-w-0 flex-1 group">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <span>{s.category}</span><span>·</span><span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 truncate font-medium group-hover:text-accent">{s.title}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Stage {stage.n} · {stage.name}</span>
                      <div className="h-1 w-32 overflow-hidden rounded-full bg-foreground/5">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>
                  <button onClick={() => remove(s.id)} className="text-muted-foreground transition hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-display mt-2 text-3xl">{value}</div>
    </div>
  );
}

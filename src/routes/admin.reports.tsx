import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adb } from "@/lib/admin-db";
import { AdminShell } from "@/components/admin/AdminShell";
import { labelOf, LEAD_STATUSES, OPPORTUNITY_STAGES, TASK_STATUSES, type Option } from "@/lib/admin-portal";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports, InwardWise Admin" },
      { name: "description", content: "Pipeline conversion, deal value and task throughput." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Reports, InwardWise Admin" },
      { property: "og:description", content: "Pipeline conversion, deal value and task throughput." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reports,
});

function Breakdown({
  title,
  rows,
  options,
  total,
}: {
  title: string;
  rows: Record<string, number>;
  options: Option[];
  total: number;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-3 space-y-2">
        {options.map((o) => {
          const value = rows[o.value] ?? 0;
          const pct = total ? Math.round((value / total) * 100) : 0;
          return (
            <div key={o.value}>
              <div className="flex justify-between text-xs">
                <span>{o.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {value} ({pct}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Reports() {
  const { data } = useQuery({
    queryKey: ["admin-portal", "reports"],
    queryFn: async () => {
      const [leads, opps, tasks] = await Promise.all([
        adb.from("leads").select("status").limit(2000),
        adb.from("opportunities").select("stage,value").limit(2000),
        adb.from("tasks").select("status").limit(2000),
      ]);
      const tally = (rows: Record<string, unknown>[], key: string) =>
        rows.reduce<Record<string, number>>((acc, r) => {
          const k = String(r[key] ?? "unknown");
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {});
      const oppRows = (opps.data ?? []) as { stage: string; value: number | null }[];
      return {
        leads: tally((leads.data ?? []) as Record<string, unknown>[], "status"),
        leadTotal: (leads.data ?? []).length,
        opps: tally(oppRows as unknown as Record<string, unknown>[], "stage"),
        oppTotal: oppRows.length,
        pipelineValue: oppRows
          .filter((o) => o.stage !== "lost")
          .reduce((sum, o) => sum + Number(o.value ?? 0), 0),
        wonValue: oppRows.filter((o) => o.stage === "won").reduce((sum, o) => sum + Number(o.value ?? 0), 0),
        tasks: tally((tasks.data ?? []) as Record<string, unknown>[], "status"),
        taskTotal: (tasks.data ?? []).length,
      };
    },
  });

  const money = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <AdminShell
      title="Reports"
      description="Live conversion and throughput across the pipeline."
      requirePermission="reports.view"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Open pipeline</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{money(data?.pipelineValue ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Won value</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{money(data?.wonValue ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Leads</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{data?.leadTotal ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversion</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {data?.leadTotal ? Math.round(((data.leads["converted"] ?? 0) / data.leadTotal) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Breakdown title="Leads by status" rows={data?.leads ?? {}} options={LEAD_STATUSES} total={data?.leadTotal ?? 0} />
        <Breakdown title="Opportunities by stage" rows={data?.opps ?? {}} options={OPPORTUNITY_STAGES} total={data?.oppTotal ?? 0} />
        <Breakdown title="Tasks by status" rows={data?.tasks ?? {}} options={TASK_STATUSES} total={data?.taskTotal ?? 0} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Figures reflect the records you are permitted to see: {labelOf(LEAD_STATUSES, "converted")} counts drive the
        conversion rate.
      </p>
    </AdminShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adb } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { labelOf, TASK_STATUSES, PRIORITIES } from "@/lib/admin-portal";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard, InwardWise Admin" },
      { name: "description", content: "Pipeline, tasks and team activity at a glance." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Dashboard, InwardWise Admin" },
      { property: "og:description", content: "Pipeline, tasks and team activity at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

async function countOf(table: string, filter?: [string, string]) {
  let q = adb.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

function Stat({ label, value, to }: { label: string; value: number | string; to?: string }) {
  const inner = (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
  return to ? (
    <Link to={to} className="transition hover:opacity-80">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Dashboard() {
  const { context, can } = useAdmin();

  const { data: stats } = useQuery({
    queryKey: ["admin-portal", "dashboard-stats"],
    enabled: !!context,
    queryFn: async () => ({
      leads: await countOf("leads"),
      openLeads: await countOf("leads", ["status", "new"]),
      contacts: await countOf("contacts"),
      companies: await countOf("companies"),
      opportunities: await countOf("opportunities"),
      openTasks: await countOf("tasks", ["status", "in_progress"]),
    }),
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ["admin-portal", "my-tasks", context?.employee_id],
    enabled: !!context,
    queryFn: async () => {
      const { data } = await adb
        .from("tasks")
        .select("id,title,status,priority,due_date")
        .eq("assigned_employee_id", context!.employee_id)
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(8);
      return (data ?? []) as { id: string; title: string; status: string; priority: string; due_date: string | null }[];
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ["admin-portal", "recent-activities"],
    enabled: !!context && can("crm.view"),
    queryFn: async () => {
      const { data } = await adb
        .from("activities")
        .select("id,subject,activity_type,occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(8);
      return (data ?? []) as { id: string; subject: string; activity_type: string; occurred_at: string }[];
    },
  });

  return (
    <AdminShell title={`Welcome, ${context?.name?.split(" ")[0] ?? "there"}`} description="Your workspace at a glance.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Leads" value={stats?.leads ?? " "} to="/admin/leads" />
        <Stat label="New leads" value={stats?.openLeads ?? " "} to="/admin/leads" />
        <Stat label="Contacts" value={stats?.contacts ?? " "} to="/admin/contacts" />
        <Stat label="Companies" value={stats?.companies ?? " "} to="/admin/companies" />
        <Stat label="Opportunities" value={stats?.opportunities ?? " "} to="/admin/opportunities" />
        <Stat label="Tasks in progress" value={stats?.openTasks ?? " "} to="/admin/tasks" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-medium">My open tasks</h2>
          <ul className="divide-y divide-border">
            {myTasks.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground">Nothing assigned to you.</li>
            ) : (
              myTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {labelOf(PRIORITIES, t.priority)} · {labelOf(TASK_STATUSES, t.status)}
                    {t.due_date ? ` · ${new Date(t.due_date).toLocaleDateString()}` : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-medium">Recent activity</h2>
          <ul className="divide-y divide-border">
            {recent.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground">No activity logged yet.</li>
            ) : (
              recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="truncate">{a.subject}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.occurred_at).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}

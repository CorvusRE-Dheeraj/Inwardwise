import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adb } from "@/lib/admin-db";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit logs, InwardWise Admin" },
      { name: "description", content: "Every create, update and delete performed inside the staff portal." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Audit logs, InwardWise Admin" },
      { property: "og:description", content: "Every action performed inside the staff portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditLogs,
});

type Log = {
  id: string;
  actor_email: string | null;
  action: string;
  module: string;
  record_id: string | null;
  created_at: string;
};

function AuditLogs() {
  const [term, setTerm] = useState("");
  const { data = [] } = useQuery<Log[]>({
    queryKey: ["admin-portal", "audit-logs", term],
    queryFn: async () => {
      let q = adb.from("audit_logs").select("id,actor_email,action,module,record_id,created_at");
      if (term.trim()) q = q.ilike("module", `%${term.trim()}%`);
      const { data } = await q.order("created_at", { ascending: false }).limit(200);
      return (data ?? []) as Log[];
    },
  });

  return (
    <AdminShell title="Audit logs" description="Read-only record of staff actions." requirePermission="audit.view">
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Filter by module…"
        className="mb-4 h-9 w-full sm:w-64"
      />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Module</th>
              <th className="px-3 py-2 font-medium">Record</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No entries yet.
                </td>
              </tr>
            ) : (
              data.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{l.actor_email ?? " "}</td>
                  <td className="px-3 py-2">{l.action}</td>
                  <td className="px-3 py-2">{l.module}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{l.record_id ?? " "}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

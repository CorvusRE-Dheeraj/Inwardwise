import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adb } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings, InwardWise Admin" },
      { name: "description", content: "Workspace configuration and integration readiness for the staff portal." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Settings, InwardWise Admin" },
      { property: "og:description", content: "Workspace configuration for the staff portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { context } = useAdmin();

  const { data: counts } = useQuery({
    queryKey: ["admin-portal", "settings-counts"],
    queryFn: async () => {
      const [emp, roles] = await Promise.all([
        adb.from("employees").select("id", { count: "exact", head: true }),
        adb.from("admin_roles").select("id", { count: "exact", head: true }),
      ]);
      return { employees: emp.count ?? 0, roles: roles.count ?? 0 };
    },
  });

  return (
    <AdminShell title="Settings" description="Workspace configuration." requirePermission="settings.view">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Your access</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{context?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{context?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{context?.is_super_admin ? "Super Admin" : context?.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Permissions</dt>
              <dd>{context?.is_super_admin ? "All" : (context?.permissions?.length ?? 0)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Workspace</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Employees</dt>
              <dd>{counts?.employees ?? " "}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Roles</dt>
              <dd>{counts?.roles ?? " "}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/admin/employees" className="text-accent underline-offset-4 hover:underline">
              Manage employees
            </Link>
            <Link to="/admin/roles" className="text-accent underline-offset-4 hover:underline">
              Roles & permissions
            </Link>
            <Link to="/admin/audit-logs" className="text-accent underline-offset-4 hover:underline">
              Audit logs
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-medium">Integrations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The portal is structured so email, calendar, telephony and payment integrations can be attached per module
            later. Nothing is connected yet; leads, activities and tasks already store the fields those integrations
            need.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}

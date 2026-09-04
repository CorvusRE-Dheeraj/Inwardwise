import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adb, logAudit } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & permissions, InwardWise Admin" },
      { name: "description", content: "Configure what each staff role can see and change." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Roles & permissions, InwardWise Admin" },
      { property: "og:description", content: "Configure what each staff role can see and change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RolesPage,
});

type Role = { id: string; name: string; description: string | null };
type Perm = { id: string; key: string; category: string; label: string };

function RolesPage() {
  const { context, can } = useAdmin();
  const qc = useQueryClient();
  const editable = can("settings.manage") || !!context?.is_super_admin;

  const { data } = useQuery({
    queryKey: ["admin-portal", "roles"],
    queryFn: async () => {
      const [roles, perms, links] = await Promise.all([
        adb.from("admin_roles").select("id,name,description").order("name"),
        adb.from("admin_permissions").select("id,key,category,label").order("category"),
        adb.from("admin_role_permissions").select("role_id,permission_id"),
      ]);
      return {
        roles: (roles.data ?? []) as Role[],
        perms: (perms.data ?? []) as Perm[],
        links: (links.data ?? []) as { role_id: string; permission_id: string }[],
      };
    },
  });

  const toggle = async (roleId: string, permissionId: string, on: boolean) => {
    try {
      if (on) {
        const { error } = await adb.from("admin_role_permissions").insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await adb
          .from("admin_role_permissions")
          .delete()
          .eq("role_id", roleId)
          .eq("permission_id", permissionId);
        if (error) throw new Error(error.message);
      }
      await logAudit({
        employeeId: context?.employee_id ?? null,
        actorEmail: context?.email,
        action: on ? "grant_permission" : "revoke_permission",
        module: "roles",
        recordId: roleId,
        metadata: { permissionId },
      });
      qc.invalidateQueries({ queryKey: ["admin-portal", "roles"] });
      qc.invalidateQueries({ queryKey: ["admin-portal", "context"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update permission.");
    }
  };

  const categories = [...new Set((data?.perms ?? []).map((p) => p.category))];

  return (
    <AdminShell
      title="Roles & permissions"
      description="Super Admins can change what each role is allowed to do."
      requirePermission="employees.view"
    >
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Permission</th>
              {(data?.roles ?? []).map((r) => (
                <th key={r.id} className="px-3 py-2 text-center font-medium">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <>
                <tr key={cat} className="bg-muted/30">
                  <td colSpan={(data?.roles.length ?? 0) + 1} className="px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {cat}
                  </td>
                </tr>
                {(data?.perms ?? [])
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        {p.label}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{p.key}</span>
                      </td>
                      {(data?.roles ?? []).map((r) => {
                        const on = !!data?.links.some((l) => l.role_id === r.id && l.permission_id === p.id);
                        return (
                          <td key={r.id} className="px-3 py-2 text-center">
                            <Checkbox
                              checked={on}
                              disabled={!editable}
                              onCheckedChange={(v) => toggle(r.id, p.id, v === true)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {!editable && (
        <p className="mt-3 text-xs text-muted-foreground">You can view roles, but only a Super Admin can change them.</p>
      )}
    </AdminShell>
  );
}

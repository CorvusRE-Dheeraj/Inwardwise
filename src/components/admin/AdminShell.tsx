import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Search, ShieldAlert, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adb, claimSuperAdminIfNone } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { ADMIN_NAV, type PermissionKey } from "@/lib/admin-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchHit = { type: string; id: string; label: string; to: string };

function GlobalSearch({ canCrm, canTasks }: { canCrm: boolean; canTasks: boolean }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { data: hits = [] } = useQuery<SearchHit[]>({
    queryKey: ["admin-portal", "search", term],
    enabled: term.trim().length >= 2,
    queryFn: async () => {
      const q = `%${term.trim()}%`;
      const out: SearchHit[] = [];
      if (canCrm) {
        const [leads, contacts, companies, opps] = await Promise.all([
          adb.from("leads").select("id,name").ilike("name", q).limit(5),
          adb.from("contacts").select("id,first_name,last_name").ilike("first_name", q).limit(5),
          adb.from("companies").select("id,name").ilike("name", q).limit(5),
          adb.from("opportunities").select("id,name").ilike("name", q).limit(5),
        ]);
        for (const r of leads.data ?? []) out.push({ type: "Lead", id: r.id, label: r.name, to: "/admin/leads" });
        for (const r of contacts.data ?? [])
          out.push({ type: "Contact", id: r.id, label: [r.first_name, r.last_name].filter(Boolean).join(" "), to: "/admin/contacts" });
        for (const r of companies.data ?? []) out.push({ type: "Company", id: r.id, label: r.name, to: "/admin/companies" });
        for (const r of opps.data ?? []) out.push({ type: "Opportunity", id: r.id, label: r.name, to: "/admin/opportunities" });
      }
      if (canTasks) {
        const tasks = await adb.from("tasks").select("id,title").ilike("title", q).limit(5);
        for (const r of tasks.data ?? []) out.push({ type: "Task", id: r.id, label: r.title, to: "/admin/tasks" });
      }
      return out;
    },
  });

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Search leads, contacts, companies, tasks…"
        className="h-9 pl-9"
      />
      {open && term.trim().length >= 2 && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {hits.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matches.</p>
          ) : (
            hits.map((h) => (
              <Link
                key={`${h.type}-${h.id}`}
                to={h.to}
                search={{ q: h.label } as never}
                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="truncate">{h.label}</span>
                <span className="ml-3 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">{h.type}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NotificationBell({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false);
  const { data = [], refetch } = useQuery({
    queryKey: ["admin-portal", "notifications", employeeId],
    queryFn: async () => {
      const { data } = await adb
        .from("admin_notifications")
        .select("id,title,body,link,read_at,created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      return (data ?? []) as { id: string; title: string; body: string | null; read_at: string | null }[];
    },
    refetchInterval: 60_000,
  });
  const unread = data.filter((n) => !n.read_at).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-80 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium">Notifications</span>
            {unread > 0 && (
              <button
                className="text-xs text-accent"
                onClick={async () => {
                  await adb
                    .from("admin_notifications")
                    .update({ read_at: new Date().toISOString() })
                    .is("read_at", null);
                  refetch();
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto">
            {data.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              data.map((n) => (
                <div key={n.id} className={cn("border-b border-border px-3 py-2 text-sm last:border-0", !n.read_at && "bg-muted/50")}>
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminShell({
  children,
  title,
  description,
  requirePermission,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  requirePermission?: PermissionKey;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const { userId, context, can, loading } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && userId === null) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [loading, userId, navigate]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const nav = useMemo(
    () =>
      ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(i.permission)) })).filter(
        (g) => g.items.length > 0,
      ),
    [can],
  );

  if (loading || userId === undefined || userId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">No employee access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is not registered as an active employee. Ask a Super Admin to add you, or claim the first
            Super Admin seat if this workspace has no employees yet.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              disabled={claiming}
              onClick={async () => {
                setClaiming(true);
                try {
                  await claimSuperAdminIfNone();
                  window.location.reload();
                } finally {
                  setClaiming(false);
                }
              }}
            >
              {claiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Claim Super Admin seat
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/admin/login", replace: true });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const denied = requirePermission ? !can(requirePermission) : false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link to="/admin/dashboard" className="text-sm font-semibold tracking-tight">
            InwardWise <span className="text-muted-foreground">Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto px-2 py-3">
          {nav.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                    pathname === item.to && "bg-muted font-medium",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <GlobalSearch canCrm={can("crm.view")} canTasks={can("tasks.view")} />
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell employeeId={context.employee_id} />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight">{context.name}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {context.is_super_admin ? "Super Admin" : context.role}
              </p>
            </div>
            <button
              className="rounded-md p-2 hover:bg-muted"
              aria-label="Sign out"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/admin/login", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {!denied && actions}
          </div>
          {denied ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                You do not have permission to view this section.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { claimAdminIfNone, getAdminStats, isCurrentUserAdmin } from "@/lib/admin.functions";
import { Loader2, Shield, Users, LogIn, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin, Objective Solution Framework" },
      { name: "description", content: "Superadmin view of users and decision activity." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const claim = useServerFn(claimAdminIfNone);
  const fetchStats = useServerFn(getAdminStats);

  const roleQ = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: () => checkAdmin({}),
  });

  const statsQ = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats({}),
    enabled: roleQ.data?.isAdmin === true,
  });

  const claimMut = useMutation({
    mutationFn: () => claim({}),
    onSuccess: () => router.invalidate(),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl md:text-3xl">Superadmin</h1>
            <p className="text-sm text-muted-foreground">Users, sign-ins, and decision activity.</p>
          </div>
        </div>

        {roleQ.isLoading && (
          <div className="glass flex items-center gap-2 rounded-2xl p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
          </div>
        )}

        {roleQ.data && !roleQ.data.isAdmin && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg">You're not an admin yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              If no admin has been claimed yet, you can promote yourself to superadmin. Otherwise, ask
              an existing admin to grant you access.
            </p>
            <button
              onClick={() => claimMut.mutate()}
              disabled={claimMut.isPending}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
            >
              {claimMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Claim superadmin
            </button>
            {claimMut.data && !claimMut.data.isAdmin && (
              <p className="mt-3 text-xs text-red-500">
                An admin already exists. Ask them to grant you access.
              </p>
            )}
          </div>
        )}

        {statsQ.isLoading && roleQ.data?.isAdmin && (
          <div className="glass flex items-center gap-2 rounded-2xl p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
          </div>
        )}

        {statsQ.data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Users className="h-4 w-4" />} label="Total users" value={statsQ.data.totals.users} />
              <StatCard icon={<Sparkles className="h-4 w-4" />} label="Users using decisions" value={statsQ.data.totals.activeDecisionUsers} />
              <StatCard icon={<LogIn className="h-4 w-4" />} label="Sign-ins logged" value={statsQ.data.totals.signIns} />
              <StatCard icon={<Sparkles className="h-4 w-4" />} label="Decision requests" value={statsQ.data.totals.decisionRequests} />
            </div>

            <section className="glass mt-6 rounded-2xl p-5">
              <h2 className="font-display text-lg">Users</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 text-left">Email</th>
                      <th className="px-2 py-2 text-left">Joined</th>
                      <th className="px-2 py-2 text-left">Last sign-in</th>
                      <th className="px-2 py-2 text-right">Sign-ins</th>
                      <th className="px-2 py-2 text-right">Decisions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsQ.data.users.map((u) => (
                      <tr key={u.id} className="border-t border-glass-border">
                        <td className="px-2 py-2">{u.email ?? " "}</td>
                        <td className="px-2 py-2 text-muted-foreground">{fmt(u.created_at)}</td>
                        <td className="px-2 py-2 text-muted-foreground">{fmt(u.last_sign_in_at)}</td>
                        <td className="px-2 py-2 text-right">{u.signIns}</td>
                        <td className="px-2 py-2 text-right">{u.decisions}</td>
                      </tr>
                    ))}
                    {statsQ.data.users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">No users yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass mt-6 rounded-2xl p-5">
              <h2 className="font-display text-lg">Recent activity</h2>
              <ul className="mt-3 divide-y divide-glass-border text-sm">
                {statsQ.data.recentEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2">
                    <span>
                      <span className="rounded-full border border-glass-border px-2 py-0.5 text-xs">
                        {e.event_type}
                      </span>
                      <span className="ml-2 text-muted-foreground">{e.user_id ?? "anon"}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{fmt(e.created_at)}</span>
                  </li>
                ))}
                {statsQ.data.recentEvents.length === 0 && (
                  <li className="py-6 text-center text-muted-foreground">No activity yet.</li>
                )}
              </ul>
            </section>
          </>
        )}

        {statsQ.error && (
          <p className="mt-4 text-sm text-red-500">
            {statsQ.error instanceof Error ? statsQ.error.message : "Failed to load stats"}
          </p>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-3xl">{value.toLocaleString()}</div>
    </div>
  );
}

function fmt(v: string | null | undefined): string {
  if (!v) return " ";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

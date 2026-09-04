import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { User, CreditCard, BarChart3, Sparkles, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Account, InwardWise" },
      { name: "description", content: "Manage your personal details, dashboard, and InwardWise Self." },
    ],
  }),
  component: AccountLayout,
});

const tabs: Array<{ to: "/account" | "/account/billing" | "/account/dashboard" | "/account/self-avatar"; label: string; icon: typeof User; exact?: boolean }> = [
  { to: "/account", label: "Personal Settings", icon: User, exact: true },
  { to: "/account/billing", label: "Billing", icon: CreditCard },
  { to: "/account/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/account/self-avatar", label: "InwardWise Self Design", icon: Sparkles },
];

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</p>
          <nav className="mt-4 space-y-1">
            {tabs.map((t) => {
              const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={signOut}
            className="mt-6 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}

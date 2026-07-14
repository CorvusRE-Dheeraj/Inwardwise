import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Brain, Moon, Sun, Sparkles, LogOut, LogIn, Shield } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setUser(session?.user ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setIsAdmin(!!data); });
    return () => { cancelled = true; };
  }, [user]);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/decision", label: "New Decision" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/examples", label: "Examples" },
    { to: "/history", label: "History" },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-4 z-40 mx-auto mt-4 w-[min(1200px,calc(100%-2rem))]">
        <div className="glass flex items-center justify-between rounded-full px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
              <Brain className="h-4 w-4" />
            </span>
            <span className="font-display text-base leading-none md:text-lg">Objective Solution Framework</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-glass-border text-muted-foreground transition hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <button
                onClick={signOut}
                className="hidden items-center gap-1.5 rounded-full border border-glass-border px-3.5 py-2 text-xs text-muted-foreground transition hover:text-foreground sm:flex"
                title={user.email ?? "Signed in"}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="hidden items-center gap-1.5 rounded-full border border-glass-border px-3.5 py-2 text-xs text-muted-foreground transition hover:text-foreground sm:flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
            <Link
              to="/decision"
              className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90 sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1200px,calc(100%-2rem))] py-10 md:py-16">{children}</main>

      <footer className="mx-auto w-[min(1200px,calc(100%-2rem))] pb-10 pt-8">
        <div className="glass flex flex-col items-center justify-center gap-2 rounded-2xl px-5 py-4 text-xs text-muted-foreground md:flex-row md:gap-3">
          <span>Facilitated by AI.</span>
          <span className="hidden md:inline">·</span>
          <span>7 Stage Decision Intelligence Philosophy</span>
        </div>
      </footer>
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, Moon, Sun, LayoutDashboard, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/", label: "Home" },
    { to: "/decision", label: "New Decision" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/examples", label: "Examples" },
  ];

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-4 z-40 mx-auto mt-4 w-[min(1200px,calc(100%-2rem))]">
        <div className="glass flex items-center justify-between rounded-full px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
              <Brain className="h-4 w-4" />
            </span>
            <span className="font-display text-lg leading-none">OOOI</span>
            <span className="ml-2 hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              Decision Intelligence
            </span>
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
        <div className="glass flex flex-col items-start justify-between gap-3 rounded-2xl px-5 py-4 text-xs text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>OOOI · Objective-Oriented Out-In Framework</span>
          </div>
          <div>Built for clarity, not for chat.</div>
        </div>
      </footer>
    </div>
  );
}

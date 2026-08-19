import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [mobileStartOpen, setMobileStartOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "INITIAL_SESSION"].includes(event)) {
        setUser(session?.user ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    let cancelled = false;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => { if (!cancelled) setIsAdmin(!!data); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => { setMenuOpen(false); setStartOpen(false); setMobileStartOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav: { to: string; label: string; external?: boolean }[] = [
    { to: "/areas", label: "Services" },
    { to: "/science", label: "Science" },
    { to: "/history", label: "Message from Founder" },
    { to: "/testimonials", label: "Voices" },
    { to: "/pricing", label: "Pricing" },
    ...(user ? [{ to: "/account", label: "Account" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const startMenu: { to: string; label: string }[] = [
    { to: "/decision", label: "Decision" },
    { to: "/avatar", label: "Build Self" },
    { to: "/avatar/ask", label: "Self Aware" },
    { to: "/avatar/consult", label: "Connect" },
  ];

  const startActive = startMenu.some((item) => isActive(item.to));
  const topLevelNav = nav;
  const mobileNav = nav;

  function isActive(to: string): boolean {
    return pathname === to || (to !== "/" && pathname.startsWith(to));
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  void signOut;

  return (
    <div className="relative min-h-screen">
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
          scrolled ? "bg-[color:var(--paper)]/85 backdrop-blur-md border-b border-[color:var(--rule)]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-[min(1280px,calc(100%-2rem))] items-center justify-between py-4 md:py-5">
          <Link to="/" className="flex min-w-0 items-baseline gap-3">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Est. 2026</span>
            <span className="hidden h-4 w-px bg-[color:var(--rule)] sm:block" />
            <span className="font-display text-[1.35rem] leading-none tracking-tight text-[color:var(--ink)] md:text-2xl">
              Inward<span className="italic text-[color:var(--royal)]">wise</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setStartOpen(true)}
              onMouseLeave={() => setStartOpen(false)}
            >
              <button
                onClick={() => setStartOpen((v) => !v)}
                aria-expanded={startOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] tracking-wide transition hover:opacity-90 ${
                  startActive
                    ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                    : "bg-[color:var(--royal)] text-white"
                }`}
              >
                Start
                <ChevronDown className={`h-4 w-4 transition-transform ${startOpen ? "rotate-180" : ""}`} />
              </button>
              {startOpen && (
                <div className="absolute left-0 top-full z-50 w-60 pt-2">
                  <div className="overflow-hidden rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper)] shadow-lg">
                    {startMenu.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setStartOpen(false)}
                        className="block px-5 py-3 text-[14px] text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {topLevelNav.map((item) => {
              const active = isActive(item.to);
              const className = `group relative text-[13px] tracking-wide transition ${
                active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
              }`;
              const underline = (
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--ink)] transition-transform duration-500 group-hover:scale-x-100 ${
                    active ? "scale-x-100" : ""
                  }`}
                />
              );
              return item.external ? (
                <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" className={className}>
                  {item.label}
                  {underline}
                </a>
              ) : (
                <Link key={item.to} to={item.to} className={className}>
                  {item.label}
                  {underline}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {!user ? (
              <Link
                to="/auth"
                className="hidden text-[13px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)] sm:inline"
              >
                Sign in
              </Link>
            ) : (
              <Link to="/account" className="hidden text-[13px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)] sm:inline">
                Account
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--rule)] text-[color:var(--ink)] md:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mx-auto w-[min(1280px,calc(100%-2rem))] pb-6 md:hidden">
            <div className="rule-top pt-4">
              <div className="mb-4">
                <button
                  onClick={() => setMobileStartOpen((v) => !v)}
                  className="flex w-full items-center justify-between py-1 text-[15px] text-[color:var(--ink)]"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono-cap">01</span> Start
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileStartOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileStartOpen && (
                  <div className="ml-8 grid grid-cols-1 gap-y-2 pt-2">
                    {startMenu.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="text-[14px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <nav className="grid grid-cols-2 gap-x-6 gap-y-2">
                {mobileNav.map((item, i) => {
                  const active = isActive(item.to);
                  const cls = `flex items-baseline gap-3 py-1 text-[15px] ${
                    active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)]"
                  }`;
                  return item.external ? (
                    <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" className={cls}>
                      <span className="font-mono-cap">{String(i + 2).padStart(2, "0")}</span>
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.to} to={item.to} className={cls}>
                      <span className="font-mono-cap">{String(i + 2).padStart(2, "0")}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-5 flex gap-3">
                {!user && (
                  <Link to="/auth" className="flex-1 rounded-full border border-[color:var(--rule)] px-4 py-2 text-center text-[13px]">
                    Sign in
                  </Link>
                )}
                <Link to="/decision" className="flex-1 rounded-full bg-[color:var(--royal)] px-4 py-2 text-center text-[14px] text-white">
                  Decision
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 rule-top">
        <div className="mx-auto grid w-[min(1280px,calc(100%-2rem))] grid-cols-1 gap-8 py-12 md:grid-cols-4">
          <div>
            <div className="font-display text-xl">Inward<span className="italic text-[color:var(--royal)]">wise</span></div>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              A laboratory for thinking. Removing bias, fear, and ego — one decision at a time.
            </p>
          </div>
          <div>
            <div className="font-mono-cap mb-3">Explore</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/decision" className="hover:text-[color:var(--royal)]">Start a decision</Link></li>
              <li><Link to="/areas" className="hover:text-[color:var(--royal)]">Areas</Link></li>
              <li><Link to="/examples" className="hover:text-[color:var(--royal)]">Examples</Link></li>
              <li><Link to="/science" className="hover:text-[color:var(--royal)]">Science &amp; Philosophy</Link></li>
              <li><Link to="/history" className="hover:text-[color:var(--royal)]">History</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono-cap mb-3">Community</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/testimonials" className="hover:text-[color:var(--royal)]">Voices</Link></li>
              <li><Link to="/feedback" className="hover:text-[color:var(--royal)]">Feedback</Link></li>
              <li><Link to="/donate" className="hover:text-[color:var(--royal)]">Donate</Link></li>
              <li><Link to="/pricing" className="hover:text-[color:var(--royal)]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono-cap mb-3">Colophon</div>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Facilitated by AI. Grounded in the 7-Stage Decision Intelligence Philosophy by Alex Freeman, Ph.D.
            </p>
          </div>
        </div>
        <div className="rule-top">
          <div className="mx-auto flex w-[min(1280px,calc(100%-2rem))] items-center justify-between py-5 text-xs text-[color:var(--muted-foreground)]">
            <span>© {new Date().getFullYear()} Inwardwise</span>
            <span className="font-mono-cap">Volume I · Edition 001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

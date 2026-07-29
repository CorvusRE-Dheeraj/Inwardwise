import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
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

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav: NavItem[] = [
    {
      label: "Start Decision",
      children: [
        { to: "/decision", label: "Start a decision" },
        { to: "/examples", label: "Examples" },
      ],
    },
    { to: "/areas", label: "Areas" },
    { to: "/science", label: "Science" },
    { to: "/history", label: "History" },
    { to: "/testimonials", label: "Voices" },
    { to: "/pricing", label: "Pricing" },
    { to: "/donate", label: "Donate" },
    { to: "/feedback", label: "Feedback" },
    ...(user ? [{ to: "/account", label: "Account" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const topLevelNav = nav.slice(0, 7);
  const mobileNav = nav;

  function isActive(item: NavItem): boolean {
    if (isNavItemWithLink(item)) {
      return pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
    }
    return item.children.some((child) => isActive(child));
  }

  function toggleMobile(label: string) {
    setExpandedMobile((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
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
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Est. 2025</span>
            <span className="hidden h-4 w-px bg-[color:var(--rule)] sm:block" />
            <span className="font-display text-[1.35rem] leading-none tracking-tight text-[color:var(--ink)] md:text-2xl">
              Decision <span className="italic text-[color:var(--royal)]">Philosophy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" ref={dropdownRef}>
            {topLevelNav.map((item) => {
              if (!isNavItemWithLink(item) && item.children.length > 0) {
                const active = isActive(item);
                const open = openDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`group relative flex items-center gap-1 text-[13px] tracking-wide transition ${
                        active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
                      }`}
                      aria-expanded={open}
                      aria-haspopup="menu"
                      onClick={() => setOpenDropdown(open ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                      <span
                        className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--ink)] transition-transform duration-500 group-hover:scale-x-100 ${
                          active ? "scale-x-100" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper)]/95 p-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md">
                        <ul role="menu">
                          {item.children.map((child) => {
                            if (!isNavItemWithLink(child)) return null;
                            const childActive = pathname === child.to || (child.to !== "/" && pathname.startsWith(child.to));
                            return (
                              <li key={child.to} role="none">
                                <Link
                                  to={child.to}
                                  role="menuitem"
                                  className={`flex items-center rounded-lg px-3 py-2 text-[13px] transition ${
                                    childActive
                                      ? "bg-[color:var(--muted)]/60 text-[color:var(--ink)]"
                                      : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/40 hover:text-[color:var(--ink)]"
                                  }`}
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }

              if (!isNavItemWithLink(item)) return null;
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative text-[13px] tracking-wide transition ${
                    active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--ink)] transition-transform duration-500 group-hover:scale-x-100 ${
                      active ? "scale-x-100" : ""
                    }`}
                  />
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
            <Link
              to="/decision"
              className="hidden items-center gap-2 rounded-full border border-[color:var(--ink)] px-4 py-2 text-[12px] tracking-wide text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] sm:inline-flex"
            >
              Begin
            </Link>
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
              <nav className="grid grid-cols-2 gap-x-6 gap-y-2">
                {mobileNav.map((item, i) => {
                  if (!isNavItemWithLink(item) && item.children.length > 0) {
                    const expanded = expandedMobile.has(item.label);
                    const active = isActive(item);
                    return (
                      <div key={item.label} className="col-span-2">
                        <button
                          onClick={() => toggleMobile(item.label)}
                          className={`flex w-full items-baseline gap-3 py-1 text-[15px] ${
                            active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)]"
                          }`}
                          aria-expanded={expanded}
                        >
                          <span className="font-mono-cap">{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        {expanded && (
                          <div className="mt-1 ml-6 grid gap-1 border-l border-[color:var(--rule)] pl-4">
                            {item.children.map((child) => {
                              if (!isNavItemWithLink(child)) return null;
                              const childActive = pathname === child.to || (child.to !== "/" && pathname.startsWith(child.to));
                              return (
                                <Link
                                  key={child.to}
                                  to={child.to}
                                  className={`block py-1 text-[14px] ${
                                    childActive ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)]"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (!isNavItemWithLink(item)) return null;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-baseline gap-3 py-1 text-[15px] ${
                        active ? "text-[color:var(--ink)]" : "text-[color:var(--muted-foreground)]"
                      }`}
                    >
                      <span className="font-mono-cap">{String(i + 1).padStart(2, "0")}</span>
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
                <Link to="/decision" className="flex-1 rounded-full bg-[color:var(--ink)] px-4 py-2 text-center text-[13px] text-[color:var(--paper)]">
                  Begin
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
            <div className="font-display text-xl">Decision <span className="italic text-[color:var(--royal)]">Philosophy</span></div>
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
            <span>© {new Date().getFullYear()} Decision Philosophy</span>
            <span className="font-mono-cap">Volume I · Edition 001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

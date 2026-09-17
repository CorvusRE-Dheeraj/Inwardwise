import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PRODUCTS } from "@/lib/products";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

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
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fullNav: { to: string; label: string; external?: boolean }[] = user
    ? [
        { to: "/history", label: "Founder" },
        { to: "/testimonials", label: "Voices" },
        { to: "/pricing", label: "Pricing" },
        { to: "/donate", label: "Donate" },
        { to: "/feedback", label: "Feedback" },
        { to: "/people-like-me", label: "Alex and Mary" },
        { to: "/account", label: "Account" },
        ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
      ]
    : [];

  // Signed-out visitors see no menu; everything appears only after login.
  const topLevelNav = user ? fullNav : [];
  const mobileNav: { to: string; label: string; external?: boolean }[] = user
    ? [...fullNav, { to: "/contact", label: "Contact Us" }]
    : [];

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
          scrolled
            ? "bg-[color:var(--paper)]/85 backdrop-blur-md border-b border-[color:var(--rule)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-[min(1280px,calc(100%-2rem))] items-center justify-between py-4 md:py-5">
          <Link to="/" className="flex min-w-0 items-baseline gap-3">
            <span className="font-mono-cap text-[color:var(--muted-foreground)]">Est. 2026</span>
            <span className="hidden h-4 w-px bg-[color:var(--rule)] sm:block" />
            <span className="font-display text-[1.35rem] leading-none tracking-tight text-[color:var(--ink)] md:text-2xl">
              Inward<span className="italic text-[color:var(--royal)]">Wise</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex md:ml-8 lg:ml-12">
            {user && (
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] tracking-wide transition hover:opacity-90 ${
                  isActive("/products") ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "bg-[color:var(--royal)] text-white"
                }`}
              >
                Products
                <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
              </button>
              {productsOpen && (
                <div className="absolute left-0 top-full z-50 w-60 pt-2">
                  <div className="overflow-hidden rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper)] shadow-lg">
                    {PRODUCTS.map((p) => (
                      <Link
                        key={p.id}
                        to="/products"
                        onClick={() => setProductsOpen(false)}
                        className="block px-5 py-3 text-[14px] text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                      >
                        {p.shortName}
                      </Link>
                    ))}
                    <div className="rule-top">
                      <Link
                        to="/areas"
                        onClick={() => setProductsOpen(false)}
                        className="block px-5 py-3 text-[14px] text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                      >
                        Services
                      </Link>
                      <Link
                        to="/science"
                        onClick={() => setProductsOpen(false)}
                        className="block px-5 py-3 text-[14px] text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                      >
                        Science
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}


            {topLevelNav.map((item) => {
              const active = isActive(item.to);
              const className = `group relative text-[13px] tracking-wide transition ${
                active
                  ? "text-[color:var(--ink)]"
                  : "text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
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
            {!user && (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="hidden text-[13px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)] sm:inline"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="rounded-full bg-[color:var(--royal)] px-5 py-2 text-[13px] text-white transition hover:opacity-90"
                >
                  Sign up
                </Link>
              </>
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
                  onClick={() => setProductsOpen((v) => !v)}
                  className="flex w-full items-center justify-between py-1 text-[15px] text-[color:var(--ink)]"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono-cap">01</span> Products
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                </button>
                {productsOpen && (
                  <div className="ml-8 grid grid-cols-1 gap-y-2 pt-2">
                    {PRODUCTS.map((p) => (
                      <Link
                        key={p.id}
                        to="/products"
                        onClick={() => setProductsOpen(false)}
                        className="text-[14px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
                      >
                        {p.shortName}
                      </Link>
                    ))}
                    <div className="rule-top pt-2">
                      <Link
                        to="/areas"
                        onClick={() => setProductsOpen(false)}
                        className="block py-1 text-[14px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
                      >
                        Services
                      </Link>
                      <Link
                        to="/science"
                        onClick={() => setProductsOpen(false)}
                        className="block py-1 text-[14px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
                      >
                        Science
                      </Link>
                    </div>
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
                {user ? (
                  <Link
                    to="/decision"
                    className="flex-1 rounded-full bg-[color:var(--royal)] px-4 py-2 text-center text-[14px] text-white"
                  >
                    Decision
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      search={{ mode: "signin" }}
                      className="flex-1 rounded-full border border-[color:var(--rule)] px-4 py-2 text-center text-[13px]"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/auth"
                      search={{ mode: "signup" }}
                      className="flex-1 rounded-full bg-[color:var(--royal)] px-4 py-2 text-center text-[14px] text-white"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 rule-top">
        <div className="mx-auto grid w-[min(1280px,calc(100%-2rem))] grid-cols-1 gap-8 py-12 md:grid-cols-4">
          <div>
            <div className="font-display text-xl">
              Inward<span className="italic text-[color:var(--royal)]">Wise</span>
            </div>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              A laboratory for thinking. Removing bias, fear, and ego, one decision at a time.
            </p>
          </div>
          {user ? (
            <>
          <div>
            <div className="font-mono-cap mb-3">Explore</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-[color:var(--royal)]">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/decision" className="hover:text-[color:var(--royal)]">
                  Start a decision
                </Link>
              </li>
              <li>
                <Link to="/areas" className="hover:text-[color:var(--royal)]">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/avatar/ask" className="hover:text-[color:var(--royal)]">
                  Self Aware
                </Link>
              </li>
              <li className="pl-4">
                <Link to="/products/calm-mantra" className="hover:text-[color:var(--royal)]">
                  ↳ Meditation
                </Link>
              </li>

              <li>
                <Link to="/examples" className="hover:text-[color:var(--royal)]">
                  Examples
                </Link>
              </li>
              <li>
                <Link to="/science" className="hover:text-[color:var(--royal)]">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[color:var(--royal)]">
                  Founder
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono-cap mb-3">Community</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/testimonials" className="hover:text-[color:var(--royal)]">
                  Voices
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-[color:var(--royal)]">
                  Feedback
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-[color:var(--royal)]">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[color:var(--royal)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[color:var(--royal)]">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <div className="font-mono-cap mb-3">Get started</div>
              <p className="text-sm text-[color:var(--ink)]">
                Create an account to open everything InwardWise offers.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="rounded-full bg-[color:var(--royal)] px-5 py-2 text-[13px] text-white"
                >
                  Sign up
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
          <div>
            <div className="font-mono-cap mb-3">Colophon</div>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Facilitated by AI. Grounded in the 7-Stage Decision Intelligence Philosophy by Alex Freeman, Ph.D.
            </p>
          </div>
        </div>
        <div className="rule-top">
          <div className="mx-auto flex w-[min(1280px,calc(100%-2rem))] items-center justify-between py-5 text-xs text-[color:var(--muted-foreground)]">
            <span>© {new Date().getFullYear()} InwardWise</span>
            <span className="font-mono-cap">Volume I · Edition 001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

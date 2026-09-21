import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

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
                <Link to="/products" className="hover:text-[color:var(--royal)]">
                  Start a decision
                </Link>
              </li>
              <li>
                <Link to="/areas" className="hover:text-[color:var(--royal)]">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[color:var(--royal)]">
                  Self Aware
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

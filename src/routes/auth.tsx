import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in, InwardWise" },
      { name: "description", content: "Sign in or create an account to keep your decisions private and confidential." },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function isSafeRedirect(v: string | undefined): v is string {
  if (!v) return false;
  return v.startsWith("/") && !v.startsWith("//");
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = Route.useSearch();
  const target = isSafeRedirect(redirect) ? redirect : "/decision";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ to: target, replace: true });
    });
    return () => {
      mounted = false;
    };
  }, [navigate, target]);

  function friendlyAuthError(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err ?? "");
    const m = raw.toLowerCase();
    if (m.includes("weak") || m.includes("pwned") || m.includes("known to be"))
      return "That password has appeared in known data breaches. Please choose a longer, more unusual password — a phrase of a few unrelated words works well.";
    if (m.includes("rate limit") || m.includes("after") && m.includes("second"))
      return "Too many attempts in a row. Please wait a few seconds and try again.";
    if (m.includes("not confirmed"))
      return "Your email isn't confirmed yet. Please open the confirmation link we sent you, or resend it below.";
    if (m.includes("invalid login credentials"))
      return "That email and password don't match an account. Please check them and try again.";
    if (m.includes("already registered") || m.includes("already been registered"))
      return "An account with this email already exists. Try signing in instead.";
    return raw || "Something went wrong. Please try again.";
  }

  async function onResendConfirmation() {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
      });
      if (error) throw error;
      setInfo("Confirmation email sent. Please check your inbox.");
      setNeedsConfirmation(false);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    setNeedsConfirmation(false);
    if (mode === "signup" && password.length < 8) {
      setError("Please use at least 8 characters. Common or breached passwords are not accepted.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
        });
        if (error) throw error;
        if (data.session) navigate({ to: target, replace: true });
        else setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target, replace: true });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err ?? "");
      if (raw.toLowerCase().includes("not confirmed")) setNeedsConfirmation(true);
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    try {
      // Google sends the user back to this page; the session effect above then
      // forwards them to `target`, so carry the redirect through the round trip.
      const back = new URL(`${import.meta.env.BASE_URL}auth`, window.location.origin);
      if (isSafeRedirect(redirect)) back.searchParams.set("redirect", redirect);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: back.toString() },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-[min(440px,calc(100%-2rem))] flex-col justify-center py-16">
        <Link to="/" className="mb-8 flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
            <Brain className="h-4 w-4" />
          </span>
          <span className="font-display text-base">InwardWise</span>
        </Link>

        <div className="glass rounded-3xl p-6 md:p-8">
          <h1 className="font-display text-2xl leading-tight md:text-3xl">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your confidentiality is never compromised.
            <br />
            That's our promise.
          </p>

          <button
            onClick={onGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-glass-border bg-background/40 px-4 py-2.5 text-sm font-medium transition hover:bg-foreground/5 disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-glass-border" />
            or email
            <div className="h-px flex-1 bg-glass-border" />
          </div>

          <form onSubmit={onEmailSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-glass-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={mode === "signup" ? 8 : 6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-glass-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              />
              {mode === "signup" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Use at least 8 characters. Passwords found in known data breaches are not accepted, so avoid
                  common words — a phrase of a few unrelated words works well.
                </p>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {info && <p className="text-xs text-accent">{info}</p>}
            {needsConfirmation && (
              <button
                type="button"
                onClick={onResendConfirmation}
                disabled={busy}
                className="text-xs text-accent hover:underline disabled:opacity-60"
              >
                Resend the confirmation email
              </button>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="text-accent hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12A6.98 6.98 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

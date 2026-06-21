import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { getSafeNextPath } from "@/lib/auth/guards";
import { persistOnboardingToDatabase } from "@/lib/auth/persist-onboarding";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — aatman" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNextPath(getSafeNextPath("/dashboard"));
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ href: getSafeNextPath("/dashboard"), replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        try {
          await persistOnboardingToDatabase(data.session.user.id);
        } catch {
          /* questionnaire may already be saved */
        }
      }
      navigate({ href: nextPath, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)] pointer-events-none" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-[28rem] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-10 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> back to home
        </Link>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-9 shadow-[0_0_60px_-30px_var(--color-accent)]">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Sign in to continue building and managing your AI-powered website.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background/80 pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_18px_-4px_var(--color-accent)] transition"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-accent hover:text-foreground transition"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background/80 px-3 py-3 pr-10 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_18px_-4px_var(--color-accent)] transition"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-accent/70 bg-foreground text-background py-3 text-sm font-semibold hover:bg-foreground/90 transition disabled:opacity-60 shadow-[0_0_28px_-10px_var(--color-accent)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              search={{ next: nextPath }}
              className="text-accent hover:text-foreground underline-offset-4 hover:underline transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

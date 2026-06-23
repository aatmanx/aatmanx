import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShell } from "./login";
import { getSafeNextPath } from "@/lib/auth/guards";
import { persistOnboardingToDatabase } from "@/lib/auth/persist-onboarding";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — aatman" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    setNotice(null);
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        // Auto sign-in — try to persist onboarding then continue
        try {
          await persistOnboardingToDatabase(data.session.user.id);
        } catch {
          /* may not have onboarding state */
        }
        navigate({ href: nextPath, replace: true });
        return;
      }

      // Email confirmation required
      setNotice("Check your email — we sent you a confirmation link to verify your account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
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
    <AuthShell
      quote="aatman shipped our entire site — branding, copy, hosting — overnight."
      author="@northwind"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_18px_var(--color-accent)]" />
        <span className="font-semibold text-foreground">aatman</span>
      </Link>

      <h1 className="mt-10 text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save your questionnaire and generate your website.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="mt-2 w-full rounded-md border border-border bg-card/40 px-3 py-3 text-sm focus:outline-none focus:border-accent transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full rounded-md border border-border bg-card/40 px-3 py-3 pr-10 text-sm focus:outline-none focus:border-accent transition"
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
        {notice && (
          <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-foreground">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground py-3 text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" search={{ next: nextPath }} className="text-foreground underline underline-offset-4 hover:text-accent transition">
          Sign in
        </Link>
      </p>

      <p className="mt-10 text-[11px] text-muted-foreground leading-relaxed">
        By creating an account you agree to aatman&apos;s{" "}
        <a href="#" className="underline">Terms</a> and{" "}
        <a href="#" className="underline">Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

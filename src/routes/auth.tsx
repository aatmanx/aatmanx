import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — aatman" },
      { name: "description", content: "Sign in or create an aatman account to deploy your B2B website." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState("/dashboard");

  const getSafeNextPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
    return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  };

  // Redirect away if already signed in
  useEffect(() => {
    let mounted = true;
    const safeNext = getSafeNextPath();
    setNextPath(safeNext);
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ href: safeNext, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ href: safeNext, replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth?verified=1&next=${encodeURIComponent(nextPath)}` },
        });
        if (error) throw error;
        setInfo("Verification link sent. Open it from your inbox and you’ll return here automatically.");
        setMode("signin");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setInfo("Password reset link sent. Open it from your inbox to set a new password.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ href: nextPath, replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          aatman
        </Link>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "signin" ? "sign in" : mode === "signup" ? "create account" : "reset password"}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {mode === "signin"
              ? "Access your dashboard and deployed sites."
              : mode === "signup"
                ? "Create your account, then verify it from your inbox."
                : "We’ll send a secure link to your email."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-[11px] text-muted-foreground">email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/60 transition"
                placeholder="you@company.com"
              />
            </div>
            {mode !== "forgot" && <div>
              <label className="text-[11px] text-muted-foreground">password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/60 transition"
                placeholder="••••••••"
              />
            </div>}

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background py-3 text-sm font-semibold hover:bg-foreground/90 transition disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  $ {mode === "signin" ? "sign_in()" : mode === "signup" ? "create_account()" : "send_reset_link()"}
                  {mode === "forgot" ? <MailCheck className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground space-y-3">
            {mode === "signin" ? (
              <div>
                no account? <button onClick={() => setMode("signup")} className="text-foreground underline-offset-2 hover:underline">create one</button>
                <span className="mx-2 text-border">/</span>
                <button onClick={() => setMode("forgot")} className="text-foreground underline-offset-2 hover:underline">forgot password</button>
              </div>
            ) : (
              <div>
                already have one? <button onClick={() => setMode("signin")} className="text-foreground underline-offset-2 hover:underline">sign in</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

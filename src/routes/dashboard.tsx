import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowUpRight,
  Globe,
  LineChart,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Loader2,
  CircleCheck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — aatman" },
      { name: "description", content: "Manage your deployed business sites in the aatman dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth" });
      else setEmail(session.user.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            <span className="font-semibold text-foreground">aatman</span>
            <span className="text-muted-foreground hidden sm:inline">/ dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">{email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-xs hover:bg-card transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">// welcome_back</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tighter">
              {email?.split("@")[0] ?? "operator"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your deployed sites, generations and analytics — in one place.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition">
            <Plus className="h-4 w-4" />
            new site
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {[
            { l: "active sites", v: "3" },
            { l: "deploys (30d)", v: "12" },
            { l: "page views", v: "8.4k" },
            { l: "uptime", v: "99.98%" },
          ].map((s) => (
            <div key={s.l} className="bg-background p-6">
              <div className="text-3xl font-bold tracking-tighter">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Grid: sites + activity */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* Sites */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> sites.json
              </div>
              <span className="text-[11px] text-muted-foreground">3 of unlimited</span>
            </div>
            <ul className="divide-y divide-border">
              {[
                { name: "northandco.aatman.app", industry: "f&b · café", status: "live" },
                { name: "meridian.aatman.app", industry: "fintech · b2b", status: "live" },
                { name: "atlas-legal.com", industry: "legal · b2b", status: "deploying" },
              ].map((s) => (
                <li key={s.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CircleCheck
                      className={`h-4 w-4 shrink-0 ${
                        s.status === "live" ? "text-foreground" : "text-muted-foreground animate-pulse"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s.industry}</div>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    open <ArrowUpRight className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity */}
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> activity.log
            </div>
            <ul className="px-6 py-4 space-y-4 text-xs">
              {[
                ["12:04", "deployed meridian.aatman.app", "47s"],
                ["11:42", "regenerated pricing block", "8s"],
                ["10:15", "added custom domain atlas-legal.com", "—"],
                ["09:30", "new lead via northandco form", "—"],
              ].map(([t, m, d]) => (
                <li key={m} className="flex items-start gap-3">
                  <span className="text-muted-foreground tabular-nums">{t}</span>
                  <div className="flex-1 text-foreground/90">{m}</div>
                  <span className="text-muted-foreground tabular-nums">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row: analytics + settings */}
        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LineChart className="h-3.5 w-3.5" /> traffic.30d
            </div>
            <div className="mt-6 h-40 flex items-end gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 20 + Math.abs(Math.sin(i * 0.7) * 60) + (i % 4 === 0 ? 15 : 0);
                return <div key={i} className="flex-1 rounded-sm bg-foreground/70 hover:bg-foreground transition" style={{ height: `${h}%` }} />;
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>30 days ago</span>
              <span>today</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings className="h-3.5 w-3.5" /> account
            </div>
            <dl className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">plan</dt><dd className="text-foreground">studio</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">email</dt><dd className="text-foreground truncate ml-2">{email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">renews</dt><dd className="text-foreground">in 14 days</dd></div>
            </dl>
            <button className="mt-6 w-full rounded-md border border-border bg-background py-2 text-xs hover:bg-muted transition">
              manage subscription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

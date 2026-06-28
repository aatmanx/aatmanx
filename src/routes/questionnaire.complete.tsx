import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { completeQuestionnaire, hasUserCompletedQuestionnaire } from "@/lib/questionnaire/persistence";
import { generateWebsiteProfileJson } from "@/lib/questionnaire/json-generator";
import { clearState, loadState } from "@/lib/questionnaire/storage";
import { loadQuestionnaireFromDatabase, ensureWebsitePipeline } from "@/lib/questionnaire/auth-sync";

export const Route = createFileRoute("/questionnaire/complete")({
  head: () => ({
    meta: [
      { title: "Questionnaire complete — aatman" },
      { name: "description", content: "Your real estate website intake is ready." },
    ],
  }),
  component: CompletePage,
});

const CHECKLIST = [
  "Business profile captured",
  "Property information structured",
  "Template category selected",
  "JSON blueprint generated",
  "Ready for AI content generation",
];

function CompletePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localState, setLocalState] = useState(loadState());

  const profile = localState ? generateWebsiteProfileJson({ ...localState, status: "completed" }) : null;
  const businessName = profile?.businessName ?? "your business";

  useEffect(() => {
    const tryPersist = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;

      if (userId) {
        const alreadySaved = await hasUserCompletedQuestionnaire(userId);
        if (alreadySaved) {
          clearState();
          navigate({ to: "/dashboard", replace: true });
          return;
        }

        const localState = loadState();
        const dbState = await loadQuestionnaireFromDatabase(userId);
        const state = localState?.answers.business_type ? localState : dbState;

        if (!state?.answers.business_type) {
          navigate({ to: "/questionnaire", replace: true });
          return;
        }

        setSaving(true);
        try {
          const completedState = { ...state, status: "completed" as const };
          await completeQuestionnaire(completedState, userId);
          await ensureWebsitePipeline(userId);
          clearState();
          navigate({ to: "/dashboard", replace: true });
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save questionnaire");
        } finally {
          setSaving(false);
        }
      }

      const state = loadState();
      setLocalState(state);

      if (!state?.answers.business_type) {
        navigate({ to: "/questionnaire", replace: true });
        return;
      }

      setChecking(false);
    };

    tryPersist();
  }, [navigate]);

  if (checking || saving) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 font-mono">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">{saving ? "Saving your questionnaire…" : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <Link to="/" className="absolute left-6 top-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_18px_var(--color-accent)]" />
          aatman
        </Link>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/60 bg-accent/10 shadow-[0_0_60px_-20px_var(--color-accent)]">
          <Sparkles className="h-7 w-7 text-accent" />
        </div>

        <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-accent">questionnaire complete</div>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tighter">Your website blueprint is ready.</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
          We&apos;ve captured everything needed to generate a production-grade real estate website for{" "}
          <span className="text-foreground">{businessName}</span>.
        </p>

        {profile && (
          <div className="mt-6 rounded-xl border border-foreground/10 bg-foreground/[0.03] px-5 py-4 text-left text-xs w-full max-w-sm">
            <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Template category</div>
            <div className="mt-1 text-sm font-medium capitalize">{profile.template_category}</div>
          </div>
        )}

        <ul className="mt-10 w-full max-w-sm space-y-3 text-left">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm">
              <Check className="h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mt-6 w-full max-w-sm rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">{error}</div>
        )}

        <div className="mt-12 w-full max-w-sm space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Create account to save & continue</p>
          <Link
            to="/signup"
            search={{ next: "/dashboard" }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-accent/70 bg-foreground px-6 py-3.5 text-sm font-semibold text-background hover:bg-foreground/90 transition shadow-[0_0_40px_-15px_var(--color-accent)]"
          >
            Sign Up & Save <ArrowRight className="h-4 w-4" />
          </Link>
          <GoogleAuthButton mode="signup" />
          <Link
            to="/login"
            search={{ next: "/dashboard" }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card/40 px-6 py-3 text-sm text-foreground hover:border-accent/40 transition"
          >
            Already have an account? Log in
          </Link>
        </div>

        <p className="mt-8 text-[10px] text-muted-foreground max-w-xs">
          Your answers are saved locally until you sign in. Creating an account permanently stores them in the database.
        </p>
      </div>
    </div>
  );
}

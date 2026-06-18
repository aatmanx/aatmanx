import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type AnswerMap = Record<string, string>;

const STORAGE_ANSWERS = "aatman.questionnaire.answers";
const STORAGE_INDEX = "aatman.questionnaire.index";
const STORAGE_SESSION = "aatman.questionnaire.session";

const questions = [
  {
    key: "business_category",
    text: "Which category does your business align to?",
    type: "choice" as const,
    options: ["Education institution", "Sports institution", "Manufacturing business", "Packaging business"],
  },
  { key: "business_name", text: "What is the business name we should design around?", type: "text" as const },
  { key: "business_location", text: "Where does the business primarily operate?", type: "text" as const },
  { key: "core_offer", text: "What is the main service or product customers buy from you?", type: "text" as const },
  { key: "ideal_customer", text: "Who is the ideal customer this website should attract?", type: "text" as const },
  { key: "brand_tone", text: "What tone should the website use when speaking to customers?", type: "text" as const },
  { key: "must_have_sections", text: "Which pages or sections are absolutely required?", type: "text" as const },
  { key: "conversion_goal", text: "What should visitors do first: call, book, buy, enquire, or visit?", type: "text" as const },
];

export const Route = createFileRoute("/questionnaire")({
  head: () => ({
    meta: [
      { title: "Website questionnaire — aatman" },
      { name: "description", content: "Answer a structured intake so aatman can generate your business website." },
    ],
  }),
  component: QuestionnairePage,
});

function getSessionId() {
  const existing = sessionStorage.getItem(STORAGE_SESSION);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_SESSION, created);
  return created;
}

function QuestionnairePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[current];
  const progress = useMemo(() => questions.filter((q) => Boolean(answers[q.key]?.trim())).length, [answers]);
  const value = answers[question.key] ?? "";

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth", search: { next: "/questionnaire" }, replace: true });
        return;
      }

      const localSessionId = getSessionId();
      const cachedAnswers = sessionStorage.getItem(STORAGE_ANSWERS);
      const cachedIndex = Number(sessionStorage.getItem(STORAGE_INDEX) ?? "0");
      const nextAnswers = cachedAnswers ? (JSON.parse(cachedAnswers) as AnswerMap) : {};

      const { data: stored } = await supabase
        .from("questionnaire_responses")
        .select("question_key, answer, completed")
        .eq("session_id", localSessionId)
        .order("question_index", { ascending: true });

      stored?.forEach((row) => {
        const answer = row.answer as { value?: string };
        if (typeof answer.value === "string") nextAnswers[row.question_key] = answer.value;
        if (row.completed) setComplete(true);
      });

      setUserId(data.session.user.id);
      setSessionId(localSessionId);
      setAnswers(nextAnswers);
      setCurrent(Number.isFinite(cachedIndex) ? Math.min(Math.max(cachedIndex, 0), questions.length - 1) : 0);
      setLoading(false);
    };
    boot();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_ANSWERS, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_INDEX, String(current));
  }, [current]);

  const saveCurrent = async (markComplete = false) => {
    if (!userId || !sessionId) return false;
    const active = questions[current];
    const answerValue = answers[active.key]?.trim();
    if (!answerValue) return false;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("questionnaire_responses").upsert(
      {
        user_id: userId,
        session_id: sessionId,
        question_index: current,
        question_key: active.key,
        question_text: active.text,
        answer: { value: answerValue } as Json,
        completed: markComplete,
      },
      { onConflict: "user_id,session_id,question_key" },
    );
    setSaving(false);
    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  };

  const updateAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: answer }));
  };

  const goNext = async () => {
    const isLast = current === questions.length - 1;
    const ok = await saveCurrent(isLast);
    if (!ok) return;
    if (isLast) {
      setComplete(true);
      return;
    }
    setCurrent((prev) => prev + 1);
  };

  const goBack = async () => {
    if (current === 0) return;
    await saveCurrent(false);
    setCurrent((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-foreground flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-foreground font-mono overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_12%,transparent_72%)]" />
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-5xl items-center justify-between px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_18px_var(--color-accent)]" />
          aatman
        </Link>
        <div className="text-[11px] text-muted-foreground tabular-nums">{String(progress).padStart(2, "0")}/{String(questions.length).padStart(2, "0")}</div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl grid-rows-[auto_1fr_auto] gap-3 px-6 pb-6">
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-1.5">
            {questions.map((q, i) => (
              <div key={q.key} className="h-1 rounded-full bg-foreground/10 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${i <= current ? "w-full bg-accent" : answers[q.key] ? "w-full bg-foreground/50" : "w-0 bg-transparent"}`} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>question {current + 1}</span>
            <span>{question.key}</span>
          </div>
        </div>

        <section className="aatman-scrollbar min-h-0 overflow-y-auto py-10 sm:py-16">
          {complete ? (
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-accent/10">
                <Check className="h-5 w-5 text-accent" />
              </div>
              <h1 className="mt-8 text-4xl sm:text-6xl font-bold tracking-tighter">intake saved.</h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">Your answers are attached to this account and ready for the website build workspace.</p>
              <button onClick={() => navigate({ to: "/dashboard" })} className="mt-8 inline-flex items-center gap-2 rounded-md border border-accent/70 bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition">
                open dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.3em] text-accent">aatman intake</div>
              <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tighter leading-[1.02]">{question.text}</h1>
              {question.type === "choice" && (
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = value === option;
                    return (
                      <button
                        key={option}
                        onClick={() => updateAnswer(option)}
                        className={`flex min-h-20 items-center justify-between rounded-xl border px-5 py-4 text-left text-sm transition ${selected ? "border-accent/80 bg-accent/10 text-foreground shadow-[0_0_35px_-20px_var(--color-accent)]" : "border-foreground/10 bg-foreground/[0.03] text-muted-foreground hover:border-accent/40 hover:text-foreground"}`}
                      >
                        <span>{option}</span>
                        {selected && <Check className="h-4 w-4 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {!complete && (
          <div className="rounded-2xl border border-foreground/15 bg-foreground/[0.055] p-3 shadow-[0_24px_80px_-50px_var(--color-accent)] backdrop-blur-2xl">
            {question.type === "text" ? (
              <textarea
                value={value}
                onChange={(e) => updateAnswer(e.target.value)}
                rows={3}
                className="aatman-scrollbar max-h-36 min-h-24 w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Type your answer here..."
              />
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">{value || "Select one option to continue."}</div>
            )}
            {error && <div className="px-2 pb-2 text-xs text-destructive">{error}</div>}
            <div className="flex items-center justify-between border-t border-foreground/10 pt-3">
              <button onClick={goBack} disabled={current === 0 || saving} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background/20 text-muted-foreground transition hover:text-foreground disabled:opacity-30">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={goNext} disabled={!value.trim() || saving} className="inline-flex items-center gap-2 rounded-full border border-accent/70 bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : current === questions.length - 1 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {current === questions.length - 1 ? "finish" : "next"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
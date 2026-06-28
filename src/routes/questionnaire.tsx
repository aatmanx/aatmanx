import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { isQuestionAnswered, QuestionRenderer } from "@/components/questionnaire/QuestionRenderer";
import { QuestionnaireShell } from "@/components/questionnaire/QuestionnaireShell";
import {
  getProgressPercent,
  getQuestionByIndex,
  getTotalQuestionCount,
  getVisibleQuestions,
} from "@/lib/questionnaire/questions/real-estate-questions";
import type { QuestionnaireAnswers, QuestionnaireState } from "@/lib/questionnaire/types";
import { mapBusinessTypeToTemplate } from "@/lib/questionnaire/template-mapping";
import { clampStepIndex, getValidationError } from "@/lib/questionnaire/validation";
import {
  deriveStatus,
  loadState,
  saveState,
  setupLeaveGuard,
} from "@/lib/questionnaire/storage";
import { resolveQuestionnaireInit, finalizeQuestionnaireForUser } from "@/lib/questionnaire/auth-sync";
import { syncQuestionnaireToDatabase } from "@/lib/questionnaire/persistence";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/questionnaire")({
  head: () => ({
    meta: [
      { title: "Real Estate Questionnaire — aatman" },
      { name: "description", content: "Complete the real estate intake questionnaire to generate your business website." },
    ],
  }),
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const navigate = useNavigate();
  const [state, setState] = useState<QuestionnaireState | null>(null);
  const [ready, setReady] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      if (!mounted) return;

      setUserId(uid);

      const { state: resolved, redirectTo } = await resolveQuestionnaireInit(uid);
      if (!mounted) return;

      if (redirectTo) {
        navigate({ to: redirectTo, replace: true });
        return;
      }

      setState(resolved);
      setReady(true);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!state || userId) return;
    saveState(state);
  }, [state, userId]);

  useEffect(() => setupLeaveGuard(Boolean(state)), [state]);

  const visibleQuestions = useMemo(
    () => (state ? getVisibleQuestions(state.answers) : []),
    [state?.answers, state],
  );

  const currentQuestion = state ? getQuestionByIndex(state.stepIndex, state.answers) : null;
  const totalSteps = state ? getTotalQuestionCount(state.answers) : 0;
  const progressPercent = state ? getProgressPercent(state.stepIndex, state.answers) : 0;

  const persistAnswer = useCallback(
    async (nextState: QuestionnaireState, questionKey?: string) => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return nextState;

      setSyncing(true);
      try {
        const question = questionKey ? visibleQuestions.find((q) => q.key === questionKey) : currentQuestion ?? undefined;
        return await syncQuestionnaireToDatabase(nextState, data.session.user.id, question);
      } catch {
        return nextState;
      } finally {
        setSyncing(false);
      }
    },
    [visibleQuestions, currentQuestion],
  );

  const updateAnswer = useCallback(
    async (key: string, value: unknown) => {
      if (!state) return;

      const answers: QuestionnaireAnswers = { ...state.answers, [key]: value };
      let templateCategory = state.templateCategory;

      if (key === "business_type" && typeof value === "string") {
        templateCategory = mapBusinessTypeToTemplate(value);
      }

      let nextState: QuestionnaireState = {
        ...state,
        answers,
        templateCategory,
        status: deriveStatus(state.stepIndex, totalSteps, false),
      };

      if (state.status === "draft" && state.stepIndex >= 0) {
        nextState.status = "in_progress";
      }

      const visibleAfter = getVisibleQuestions(answers);
      const clampedIndex = clampStepIndex(state.stepIndex, answers, getVisibleQuestions);
      if (clampedIndex !== state.stepIndex) {
        nextState = { ...nextState, stepIndex: clampedIndex };
      }

      setState(nextState);
      setValidationError(null);

      const synced = await persistAnswer(nextState, key);
      setState(synced);
    },
    [state, totalSteps, persistAnswer],
  );

  const canProceed = useMemo(() => {
    if (!state || !currentQuestion) return false;
    return isQuestionAnswered(currentQuestion, state.answers);
  }, [state, currentQuestion]);

  const goNext = async () => {
    if (!state || !currentQuestion || completing) return;

    if (!canProceed) {
      setValidationError(getValidationError(currentQuestion, state.answers));
      return;
    }

    setValidationError(null);
    const isLast = state.stepIndex >= totalSteps - 1;

    if (isLast) {
      setCompleting(true);
      const completedState: QuestionnaireState = { ...state, status: "completed" };
      setState(completedState);

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? userId;

      if (uid) {
        try {
          await finalizeQuestionnaireForUser(uid, completedState);
          navigate({ to: "/dashboard", replace: true });
          return;
        } catch {
          /* fall through to anonymous flow */
        }
      }

      saveState(completedState);
      navigate({ to: "/signup", search: { next: "/dashboard" } });
      return;
    }

    const nextState: QuestionnaireState = {
      ...state,
      stepIndex: state.stepIndex + 1,
      status: "in_progress",
    };
    setState(nextState);
    const synced = await persistAnswer(nextState);
    setState(synced);
  };

  const goBack = () => {
    if (!state) return;
    if (state.stepIndex === 0) return;

    const nextIndex = state.stepIndex - 1;
    setState({ ...state, stepIndex: nextIndex });
    setValidationError(null);
  };

  if (!ready || !state) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Restoring questionnaire…</p>
      </div>
    );
  }

  const isLastStep = state.stepIndex >= totalSteps - 1;

  const stepLabel = `${currentQuestion.sectionTitle} · Question ${state.stepIndex + 1} of ${totalSteps}`;

  return (
    <QuestionnaireShell
      progressPercent={progressPercent}
      stepLabel={stepLabel}
      stepKey={currentQuestion.key}
      totalSteps={totalSteps}
      currentStep={state.stepIndex + 1}
      syncing={syncing || completing}
      nextLabel={isLastStep ? "finish" : "next"}
      nextLoading={completing}
      onBack={goBack}
      onNext={goNext}
      backDisabled={state.stepIndex === 0 || completing}
      nextDisabled={!canProceed || completing}
    >
      <QuestionRenderer
        question={currentQuestion}
        answers={state.answers}
        onAnswerChange={updateAnswer}
        error={validationError ?? undefined}
      />
      {validationError && currentQuestion.type !== "text" && currentQuestion.type !== "textarea" && (
        <p className="mt-6 text-sm text-destructive">{validationError}</p>
      )}
    </QuestionnaireShell>
  );
}

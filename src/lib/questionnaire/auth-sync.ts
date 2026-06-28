import { supabase } from "@/integrations/supabase/client";
import type { QuestionnaireAnswers, QuestionnaireState } from "./types";
import { clearState, createInitialState, loadState } from "./storage";
import {
  completeQuestionnaire,
  getLatestCompletedQuestionnaire,
  getLatestQuestionnaireForUser,
  getWebsiteForQuestionnaire,
  hasUserCompletedQuestionnaire,
} from "./persistence";
import { runWebsiteGenerationPipeline } from "@/services/ai/pipeline";
import type { RealEstateWebsiteProfile } from "./types";
import { generateWebsiteProfileJson } from "./json-generator";
import { isQuestionnaireFinished } from "./profile-adapter";

export type PersistResult = {
  businessId: string;
  questionnaireId: string;
  websiteId: string;
};

async function startPipelineForResult(result: {
  questionnaireId: string;
  websiteId: string;
  generatedJson: unknown;
}): Promise<void> {
  void runWebsiteGenerationPipeline({
    questionnaireId: result.questionnaireId,
    websiteId: result.websiteId,
    profile: result.generatedJson as RealEstateWebsiteProfile,
  }).catch((error) => {
    console.error("[pipeline] Background generation failed:", error);
  });
}

/**
 * Ensures a completed questionnaire has business/website records and AI pipeline has run.
 */
export async function ensureWebsitePipeline(userId: string): Promise<PersistResult | null> {
  const questionnaire = await getLatestCompletedQuestionnaire(userId);
  if (!questionnaire) return null;

  const existingWebsite = await getWebsiteForQuestionnaire(questionnaire.id);
  if (existingWebsite) {
    const { data: fullWebsite } = await supabase
      .from("websites")
      .select("id, status, website_json")
      .eq("id", existingWebsite.id)
      .maybeSingle();

    const websiteJson = fullWebsite?.website_json as {
      aiContent?: Record<string, unknown>;
      siteContent?: unknown;
    } | null;

    const needsGeneration =
      fullWebsite?.status === "draft" ||
      (fullWebsite?.status === "generating") ||
      !websiteJson?.siteContent;

    if (needsGeneration && fullWebsite) {
      const profile =
        (questionnaire.generated_json as RealEstateWebsiteProfile | null) ??
        generateWebsiteProfileJson({
          version: 2,
          sessionId: questionnaire.session_id,
          industry: "real-estate",
          stepIndex: questionnaire.current_step_index ?? 0,
          answers: (questionnaire.answers_json ?? {}) as QuestionnaireAnswers,
          status: "completed",
          templateCategory: questionnaire.template_category ?? undefined,
          questionnaireId: questionnaire.id,
          updatedAt: questionnaire.updated_at ?? new Date().toISOString(),
        });

      await startPipelineForResult({
        questionnaireId: questionnaire.id,
        websiteId: fullWebsite.id,
        generatedJson: profile,
      });
    }

    return {
      businessId: existingWebsite.business_id,
      questionnaireId: questionnaire.id,
      websiteId: existingWebsite.id,
    };
  }

  const state: QuestionnaireState = {
    version: 2,
    sessionId: questionnaire.session_id,
    industry: "real-estate",
    stepIndex: questionnaire.current_step_index ?? 0,
    answers: (questionnaire.answers_json ?? {}) as QuestionnaireAnswers,
    status: "completed",
    templateCategory: questionnaire.template_category ?? undefined,
    questionnaireId: questionnaire.id,
    updatedAt: questionnaire.updated_at ?? new Date().toISOString(),
  };

  const result = await completeQuestionnaire(state, userId);
  await startPipelineForResult(result);
  return {
    businessId: result.businessId,
    questionnaireId: result.questionnaireId,
    websiteId: result.websiteId,
  };
}

/**
 * For authenticated users: merge anonymous draft into DB, then discard local storage.
 * Returns null when there is nothing to merge or DB already has completed data.
 */
export async function syncAuthenticatedDraft(userId: string): Promise<PersistResult | null> {
  const localDraft = loadState();
  const alreadyComplete = await hasUserCompletedQuestionnaire(userId);

  if (alreadyComplete) {
    if (localDraft) clearState();
    await ensureWebsitePipeline(userId);
    return null;
  }

  if (!localDraft?.answers.business_type) {
    const dbRow = await getLatestQuestionnaireForUser(userId);
    if (dbRow && isQuestionnaireFinished(dbRow.status)) {
      await ensureWebsitePipeline(userId);
    }
    return null;
  }

  const completedState: QuestionnaireState = {
    ...localDraft,
    status: "completed",
  };

  const result = await completeQuestionnaire(completedState, userId);
  clearState();
  await startPipelineForResult(result);

  return {
    businessId: result.businessId,
    questionnaireId: result.questionnaireId,
    websiteId: result.websiteId,
  };
}

/**
 * Load questionnaire state from Supabase for authenticated users.
 * Database is the single source of truth when logged in.
 */
export async function loadQuestionnaireFromDatabase(
  userId: string,
): Promise<QuestionnaireState | null> {
  const row = await getLatestQuestionnaireForUser(userId);
  if (!row) return null;

  return {
    version: 2,
    sessionId: row.session_id,
    industry: row.industry ?? "real-estate",
    stepIndex: row.current_step_index ?? 0,
    answers: (row.answers_json ?? {}) as QuestionnaireAnswers,
    status: row.status as QuestionnaireState["status"],
    templateCategory: row.template_category ?? undefined,
    questionnaireId: row.id,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Ensures authenticated session never reads stale localStorage for dashboard data.
 */
export async function prepareAuthenticatedSession(userId: string): Promise<void> {
  await syncAuthenticatedDraft(userId);

  const dbRow = await getLatestQuestionnaireForUser(userId);
  if (dbRow && isQuestionnaireFinished(dbRow.status) && loadState()) {
    clearState();
  }
}

export async function resolveQuestionnaireInit(userId: string | null): Promise<{
  state: QuestionnaireState;
  redirectTo: "/questionnaire/complete" | "/dashboard" | null;
}> {
  if (!userId) {
    const local = loadState();
    if (local?.status === "completed") {
      return { state: local, redirectTo: "/questionnaire/complete" };
    }
    return { state: local ?? createInitialState(), redirectTo: null };
  }

  await syncAuthenticatedDraft(userId);

  const dbState = await loadQuestionnaireFromDatabase(userId);
  if (dbState && isQuestionnaireFinished(dbState.status)) {
    clearState();
    return { state: dbState, redirectTo: "/dashboard" };
  }

  if (dbState) {
    clearState();
    return { state: dbState, redirectTo: null };
  }

  clearState();
  return { state: createInitialState(), redirectTo: null };
}

export async function persistOnboardingToDatabase(userId: string): Promise<PersistResult | null> {
  return syncAuthenticatedDraft(userId);
}

export async function finalizeQuestionnaireForUser(
  userId: string,
  state: QuestionnaireState,
): Promise<PersistResult> {
  const completedState: QuestionnaireState = { ...state, status: "completed" };
  const result = await completeQuestionnaire(completedState, userId);
  clearState();
  await startPipelineForResult(result);
  return {
    businessId: result.businessId,
    questionnaireId: result.questionnaireId,
    websiteId: result.websiteId,
  };
}

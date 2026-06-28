import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { QuestionConfig, QuestionnaireState } from "./types";
import { buildCompletionPayload } from "./json-generator";
import { mapBusinessTypeToTemplate } from "./template-mapping";
import { getProgressPercent, getVisibleQuestions } from "./questions/real-estate-questions";
import { uploadAllPendingFiles } from "./file-store";

export async function syncQuestionnaireToDatabase(
  state: QuestionnaireState,
  userId: string,
  question?: QuestionConfig,
): Promise<QuestionnaireState> {
  const visible = getVisibleQuestions(state.answers);
  const progressPercent = getProgressPercent(state.stepIndex, state.answers);
  const businessType = state.answers.business_type as string | undefined;
  const templateCategory = businessType ? mapBusinessTypeToTemplate(businessType) : state.templateCategory;

  const payload = {
    user_id: userId,
    session_id: state.sessionId,
    industry: state.industry,
    status: state.status,
    template_category: templateCategory ?? null,
    current_step_index: state.stepIndex,
    progress_percent: progressPercent,
    answers_json: state.answers as unknown as Json,
    template_selection: templateCategory ? ({ template_category: templateCategory } as Json) : null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("questionnaires")
    .select("id")
    .eq("session_id", state.sessionId)
    .maybeSingle();

  let questionnaireId = existing?.id;

  if (questionnaireId) {
    await supabase.from("questionnaires").update(payload).eq("id", questionnaireId);
  } else {
    const { data: created, error } = await supabase
      .from("questionnaires")
      .insert({ ...payload, status: state.status === "draft" ? "in_progress" : state.status })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    questionnaireId = created.id;
  }

  if (question && questionnaireId) {
    const questionIndex = visible.findIndex((q) => q.key === question.key);
    await supabase.from("questionnaire_answers").upsert(
      {
        questionnaire_id: questionnaireId,
        question_key: question.key,
        question_index: questionIndex,
        section_key: question.section,
        answer_json: (state.answers[question.key] ?? null) as Json,
      },
      { onConflict: "questionnaire_id,question_key" },
    );
  }

  return { ...state, questionnaireId, templateCategory };
}

export async function getLatestQuestionnaireForUser(userId: string) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getWebsiteForQuestionnaire(questionnaireId: string) {
  const { data, error } = await supabase
    .from("websites")
    .select("id, business_id, slug, status")
    .eq("questionnaire_id", questionnaireId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function completeQuestionnaire(state: QuestionnaireState, userId: string) {
  const answersWithFiles = await uploadAllPendingFiles(userId, state.answers);
  const completedState: QuestionnaireState = {
    ...state,
    answers: answersWithFiles,
    status: "completed",
  };

  const completion = buildCompletionPayload(completedState);
  const businessName = (answersWithFiles.business_name as string) ?? "My Business";

  const { data: existingQuestionnaire } = await supabase
    .from("questionnaires")
    .select("id, status")
    .eq("session_id", state.sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingQuestionnaire?.status === "completed") {
    const existingWebsite = await getWebsiteForQuestionnaire(existingQuestionnaire.id);
    if (existingWebsite) {
      return {
        questionnaireId: existingQuestionnaire.id,
        businessId: existingWebsite.business_id,
        websiteId: existingWebsite.id,
        generatedJson: completion.generated_json,
        templateSelection: completion.template_selection,
      };
    }
  }

  const { data: questionnaire, error: qError } = await supabase
    .from("questionnaires")
    .upsert(
      {
        user_id: userId,
        session_id: state.sessionId,
        industry: "real-estate",
        status: "completed",
        template_category: completion.template_category,
        current_step_index: getVisibleQuestions(answersWithFiles).length - 1,
        progress_percent: 100,
        answers_json: answersWithFiles as unknown as Json,
        generated_json: completion.generated_json as unknown as Json,
        template_selection: completion.template_selection as unknown as Json,
        ai_generation_status: completion.ai_generation_status as unknown as Json,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    )
    .select("id")
    .single();

  if (qError || !questionnaire) throw new Error(qError?.message ?? "Failed to complete questionnaire");

  const existingWebsite = await getWebsiteForQuestionnaire(questionnaire.id);
  if (existingWebsite) {
    return {
      questionnaireId: questionnaire.id,
      businessId: existingWebsite.business_id,
      websiteId: existingWebsite.id,
      generatedJson: completion.generated_json,
      templateSelection: completion.template_selection,
    };
  }

  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .eq("business_name", businessName)
    .maybeSingle();

  let businessId = existingBusiness?.id;

  if (!businessId) {
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        category: "real-estate",
        business_name: businessName,
        description: (answersWithFiles.business_description as string) ?? "",
        email: (answersWithFiles.contact_email as string) ?? "",
        phone: (answersWithFiles.contact_phone as string) ?? "",
        address: (answersWithFiles.primary_location as string) ?? "",
        social_links: [] as unknown as Json,
      })
      .select("id")
      .single();

    if (bizError || !business) throw new Error(bizError?.message ?? "Failed to save business");
    businessId = business.id;
  }

  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);

  const { data: website, error: webError } = await supabase
    .from("websites")
    .insert({
      user_id: userId,
      business_id: businessId,
      questionnaire_id: questionnaire.id,
      slug,
      website_json: { profile: completion.generated_json } as unknown as Json,
      status: "draft",
    })
    .select("id")
    .single();

  if (webError || !website) throw new Error(webError?.message ?? "Failed to create website record");

  return {
    questionnaireId: questionnaire.id,
    businessId,
    websiteId: website.id,
    generatedJson: completion.generated_json,
    templateSelection: completion.template_selection,
  };
}

export async function getUserQuestionnaires(userId: string) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function hasUserCompletedQuestionnaire(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("questionnaires")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["completed", "processing", "generated"]);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getLatestCompletedQuestionnaire(userId: string) {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["completed", "processing", "generated"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

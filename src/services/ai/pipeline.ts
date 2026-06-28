import { supabase } from "@/integrations/supabase/client";
import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import { triggerWebsiteGeneration } from "@/services/ai/trigger-generation";
import type { AiGenerationTask } from "./types";

export type PipelineInput = {
  questionnaireId: string;
  websiteId: string;
  profile: RealEstateWebsiteProfile;
  tasks?: AiGenerationTask[];
};

export type PipelineResult = {
  success: boolean;
  templateId?: string;
  error?: string;
  skipped?: boolean;
};

/** Runs the website generation pipeline on the server (OpenAI key stays server-side). */
export async function runWebsiteGenerationPipeline(input: PipelineInput): Promise<PipelineResult> {
  try {
    const result = await triggerWebsiteGeneration({
      questionnaireId: input.questionnaireId,
      websiteId: input.websiteId,
    });
    return result as PipelineResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Pipeline failed",
    };
  }
}

export async function triggerPipelineForWebsite(
  userId: string,
  websiteId: string,
): Promise<PipelineResult> {
  const { data: website, error } = await supabase
    .from("websites")
    .select("questionnaire_id")
    .eq("id", websiteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !website?.questionnaire_id) {
    return { success: false, error: "Website not found" };
  }

  return runWebsiteGenerationPipeline({
    questionnaireId: website.questionnaire_id,
    websiteId,
    profile: {} as RealEstateWebsiteProfile,
  });
}

export { loadTemplate } from "./pipeline-core";

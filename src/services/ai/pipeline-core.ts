import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import { hydrateSiteContent } from "@/lib/templates/hydrateSiteContent";
import { hydrateTemplate, loadTemplate } from "@/services/templates/templateLoader";
import { aiLog } from "./logger";
import { generateWebsiteProfile } from "./websiteProfileGenerator";
import { selectTemplate } from "./selectTemplate";
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
};

const DEFAULT_TASKS: AiGenerationTask[] = [
  "homepage_content",
  "about_page",
  "property_descriptions",
  "seo_metadata",
  "faqs",
];

async function markProfileProcessing(
  supabase: SupabaseClient<Database>,
  questionnaireId: string,
): Promise<void> {
  await supabase
    .from("questionnaires")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", questionnaireId);
}

async function markProfileGenerated(
  supabase: SupabaseClient<Database>,
  questionnaireId: string,
  aiStatus: Record<string, string>,
  profile: RealEstateWebsiteProfile,
  generatedContent: Record<string, unknown>,
): Promise<void> {
  await supabase
    .from("questionnaires")
    .update({
      status: "generated",
      ai_generation_status: aiStatus as unknown as Json,
      generated_json: {
        ...profile,
        aiContent: generatedContent,
      } as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionnaireId);
}

export async function runWebsiteGenerationPipelineCore(
  supabase: SupabaseClient<Database>,
  input: PipelineInput,
): Promise<PipelineResult> {
  const tasks = input.tasks ?? DEFAULT_TASKS;

  try {
    aiLog.info("Starting website generation pipeline", { questionnaireId: input.questionnaireId });

    await markProfileProcessing(supabase, input.questionnaireId);
    await supabase.from("websites").update({ status: "generating" }).eq("id", input.websiteId);

    const aiResult = await generateWebsiteProfile({ profile: input.profile, tasks });
    await markProfileGenerated(
      supabase,
      input.questionnaireId,
      aiResult.status as unknown as Record<string, string>,
      input.profile,
      aiResult.generatedContent as Record<string, unknown>,
    );

    const templateSelection = await selectTemplate({
      templateCategory: input.profile.template_category,
      websiteStyle: input.profile.branding?.websiteStyle ?? "",
      colorStyle: input.profile.branding?.colorStyle ?? "",
      websiteGoal: input.profile.websiteGoal ?? "",
    });

    await supabase
      .from("questionnaires")
      .update({
        template_selection: {
          templateId: templateSelection.templateId,
          category: templateSelection.templateCategory,
          confidence: templateSelection.confidence,
          rationale: templateSelection.rationale,
        } as unknown as Json,
      })
      .eq("id", input.questionnaireId);

    const hydrated = await hydrateTemplate(
      templateSelection.templateId,
      input.profile as unknown as Record<string, unknown>,
      aiResult.generatedContent as Record<string, unknown>,
    );

    const siteContent = hydrateSiteContent(input.profile, aiResult.generatedContent as Record<string, unknown>);

    if (hydrated) {
      await supabase
        .from("websites")
        .update({
          status: "ready",
          website_json: {
            profile: input.profile,
            aiContent: aiResult.generatedContent,
            template: hydrated.manifest,
            siteContent,
            hydratedAt: new Date().toISOString(),
          } as unknown as Json,
        })
        .eq("id", input.websiteId);
    } else {
      await supabase.from("websites").update({ status: "draft" }).eq("id", input.websiteId);
    }

    aiLog.info("Pipeline complete", { templateId: templateSelection.templateId });
    return { success: true, templateId: templateSelection.templateId };
  } catch (error) {
    aiLog.error("Pipeline failed", { error: error instanceof Error ? error.message : String(error) });
    await supabase.from("websites").update({ status: "draft" }).eq("id", input.websiteId);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Pipeline failed",
    };
  }
}

export { loadTemplate };

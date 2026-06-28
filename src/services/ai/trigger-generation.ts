import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import { runWebsiteGenerationPipelineCore } from "@/services/ai/pipeline-core";

type TriggerInput = {
  questionnaireId: string;
  websiteId: string;
};

export const triggerWebsiteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown): TriggerInput => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    const { questionnaireId, websiteId } = data as TriggerInput;
    if (!questionnaireId || !websiteId) throw new Error("questionnaireId and websiteId are required");
    return { questionnaireId, websiteId };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;

    const { data: website, error } = await supabaseAdmin
      .from("websites")
      .select("id, questionnaire_id, website_json, status")
      .eq("id", data.websiteId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !website) {
      throw new Error("Website not found");
    }

    if (website.questionnaire_id !== data.questionnaireId) {
      throw new Error("Questionnaire mismatch");
    }

    const websiteJson = website.website_json as {
      profile?: RealEstateWebsiteProfile;
      aiContent?: Record<string, unknown>;
    } | null;

    let profile = websiteJson?.profile;

    if (!profile) {
      const { data: questionnaire } = await supabaseAdmin
        .from("questionnaires")
        .select("generated_json, answers_json")
        .eq("id", data.questionnaireId)
        .eq("user_id", userId)
        .maybeSingle();

      profile = (questionnaire?.generated_json ?? questionnaire?.answers_json) as
        | RealEstateWebsiteProfile
        | undefined;
    }

    if (!profile || !profile.businessName) {
      throw new Error("Missing website profile for generation");
    }

    if (website.status === "ready" && websiteJson?.aiContent && Object.keys(websiteJson.aiContent).length > 0) {
      return { success: true, skipped: true };
    }

    return runWebsiteGenerationPipelineCore(supabaseAdmin, {
      questionnaireId: data.questionnaireId,
      websiteId: data.websiteId,
      profile,
    });
  });

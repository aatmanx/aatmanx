export type PipelineStage =
  | "draft"
  | "completed"
  | "processing"
  | "ai_generation"
  | "template_selection"
  | "website_building"
  | "website_ready";

export type PipelineStageMeta = {
  id: PipelineStage;
  label: string;
  description: string;
};

export const PIPELINE_STAGES: PipelineStageMeta[] = [
  { id: "draft", label: "Draft", description: "Questionnaire in progress" },
  { id: "completed", label: "Completed", description: "Intake saved and linked" },
  { id: "processing", label: "Processing", description: "Structuring your business data" },
  { id: "ai_generation", label: "AI Generation", description: "Generating website content" },
  { id: "template_selection", label: "Template Selection", description: "Matching the best template" },
  { id: "website_building", label: "Website Building", description: "Assembling pages and assets" },
  { id: "website_ready", label: "Website Ready", description: "Ready to preview and publish" },
];

type QuestionnaireRow = {
  status?: string | null;
  ai_generation_status?: unknown;
  template_selection?: unknown;
};

type WebsiteRow = {
  status?: string | null;
};

export function derivePipelineStage(
  questionnaire: QuestionnaireRow | null | undefined,
  website: WebsiteRow | null | undefined,
): PipelineStage {
  if (!questionnaire || questionnaire.status === "draft" || questionnaire.status === "in_progress") {
    return "draft";
  }

  if (website?.status === "ready" || website?.status === "published") {
    return "website_ready";
  }

  if (website?.status === "generating") {
    return "website_building";
  }

  if (questionnaire.status === "processing") {
    return "processing";
  }

  const aiStatus = (questionnaire.ai_generation_status ?? {}) as Record<string, string>;
  const aiActive = Object.values(aiStatus).some((s) => s === "pending" || s === "processing");
  if (aiActive) {
    return "ai_generation";
  }

  const templateSelection = questionnaire.template_selection as Record<string, unknown> | null | undefined;
  const hasTemplateSelection =
    templateSelection &&
    Object.keys(templateSelection).length > 0 &&
    questionnaire.status !== "generated";

  if (hasTemplateSelection && website?.status === "draft") {
    return "template_selection";
  }

  if (questionnaire.status === "completed" || questionnaire.status === "generated") {
    return "completed";
  }

  return "draft";
}

export function getStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === stage);
}

import type { FileAsset, QuestionnaireAnswers, QuestionnaireState, RealEstateWebsiteProfile, TeamMember } from "./types";
import { mapBusinessTypeToTemplate, buildTemplateSelection } from "./template-mapping";
import { getVisibleQuestions } from "./questions/real-estate-questions";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asFileRecord(value: unknown): Record<string, FileAsset[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, FileAsset[]> = {};
  for (const [key, files] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(files)) {
      result[key] = files as FileAsset[];
    }
  }
  return result;
}

function asTeamMembers(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) return [];
  return value as TeamMember[];
}

export function generateWebsiteProfileJson(state: QuestionnaireState): RealEstateWebsiteProfile {
  const answers = state.answers;
  const businessType = asString(answers.business_type);
  const templateCategory = state.templateCategory ?? mapBusinessTypeToTemplate(businessType);
  const bookSiteVisits = asString(answers.book_site_visits) === "Yes";

  return {
    industry: "real-estate",
    template_category: templateCategory,
    businessType,
    businessName: asString(answers.business_name),
    hasLogo: asString(answers.has_logo),
    logo: asFileRecord(answers.logo_upload).Logo,
    primaryLocation: asString(answers.primary_location),
    services: asStringArray(answers.services),
    websiteGoal: asString(answers.website_goal),
    propertyDataMethod: asString(answers.property_data_method),
    propertyCount: asString(answers.property_count),
    propertyTypes: asStringArray(answers.property_types),
    sellRent: asString(answers.sell_rent),
    contactMethods: asStringArray(answers.contact_methods),
    bookSiteVisits,
    siteVisitAvailability: bookSiteVisits ? asString(answers.site_visit_availability) : undefined,
    showcaseTeam: asString(answers.showcase_team),
    teamMembers: asString(answers.showcase_team) === "Yes" ? asTeamMembers(answers.team_members) : undefined,
    trustCredentials: asStringArray(answers.trust_credentials),
    completedTransactions: asString(answers.completed_transactions),
    testimonials: asString(answers.testimonials),
    features: asStringArray(answers.website_features),
    branding: {
      websiteStyle: asString(answers.website_style),
      colorStyle: asString(answers.color_style),
    },
    content: {
      businessDescription: asString(answers.business_description),
      differentiator: asString(answers.business_differentiator),
    },
    media: asFileRecord(answers.media_uploads),
    automation: asStringArray(answers.ai_auto_generate),
    properties: [],
    contact: {
      methods: asStringArray(answers.contact_methods),
      bookSiteVisits,
      siteVisitAvailability: bookSiteVisits ? asString(answers.site_visit_availability) : undefined,
      email: asString(answers.contact_email),
      phone: asString(answers.contact_phone),
      address: asString(answers.primary_location),
    },
    metadata: {
      sessionId: state.sessionId,
      questionnaireId: state.questionnaireId,
      completedAt: new Date().toISOString(),
      status: "completed",
    },
  };
}

export function buildCompletionPayload(state: QuestionnaireState) {
  const profile = generateWebsiteProfileJson(state);
  const templateSelection = buildTemplateSelection(profile.template_category);
  const visibleQuestions = getVisibleQuestions(state.answers);

  return {
    generated_json: profile,
    template_selection: templateSelection,
    template_category: profile.template_category,
    answers_json: state.answers,
    progress_percent: 100,
    status: "completed" as const,
    ai_generation_status: buildAiGenerationStatus(profile.automation),
    question_count: visibleQuestions.length,
  };
}

function buildAiGenerationStatus(automation: string[]) {
  const map: Record<string, string> = {
    "Homepage Content": "homepage_content",
    "About Us Page": "about_page",
    "Property Descriptions": "property_descriptions",
    "SEO Metadata": "seo_metadata",
    FAQs: "faqs",
    "Blog Content": "blog_content",
  };

  const status: Record<string, string> = {};
  for (const [label, key] of Object.entries(map)) {
    status[key] = automation.includes(label) ? "pending" : "skipped";
  }
  return status;
}

export function getDefaultAnswers(): QuestionnaireAnswers {
  return {
    ai_auto_generate: [
      "Homepage Content",
      "About Us Page",
      "Property Descriptions",
      "SEO Metadata",
      "FAQs",
      "Blog Content",
    ],
  };
}

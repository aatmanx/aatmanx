import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import type { AiGenerationTask } from "./types";

export function buildSystemPrompt(): string {
  return `You are an expert real estate website copywriter. Generate professional, concise content for a property developer website.
Return valid JSON only — no markdown fences, no commentary.
Match the tone requested in the business profile. Use Indian English conventions where appropriate.`;
}

export function buildTaskPrompt(
  task: AiGenerationTask,
  profile: RealEstateWebsiteProfile,
  context?: Record<string, unknown>,
): string {
  const location = profile.primaryLocation ?? "";
  const description = profile.content?.businessDescription ?? "";
  const base = `Business: ${profile.businessName}
Type: ${profile.businessType}
Location: ${location}
Description: ${description}
Differentiator: ${profile.content?.differentiator ?? ""}
Services: ${(profile.services ?? []).join(", ")}
Property types: ${(profile.propertyTypes ?? []).join(", ")}
Website goal: ${profile.websiteGoal ?? ""}
Style: ${profile.branding?.websiteStyle ?? ""}
Color style: ${profile.branding?.colorStyle ?? ""}`;

  const taskPrompts: Record<AiGenerationTask, string> = {
    homepage_content: `${base}

Generate homepage content as JSON with keys: hero (eyebrow, title, subtitle, stats array of {label, value}), whyChooseUs (title, subtitle, items array of {title, description}), cta (label, subtext).`,

    about_page: `${base}

Generate about page content as JSON with keys: title, intro, story, mission, vision, stats array of {label, value}, leadership array of {name, role, bio}.`,

    property_descriptions: `${base}

Generate property/project descriptions as JSON array. Each item: name, tagline, location, type, overview, highlights (string array), startingPrice.
Property info from profile: ${JSON.stringify(profile.propertyInfo ?? {})}`,

    seo_metadata: `${base}

Generate SEO metadata as JSON with keys: title, description, keywords (string array), ogTitle, ogDescription.`,

    faqs: `${base}

Generate 6-8 FAQs as JSON array of {question, answer} relevant to this real estate business.`,

    blog_content: `${base}

Generate 3 blog post summaries as JSON array of {title, excerpt, category}.`,
  };

  const prompt = taskPrompts[task];
  if (context && Object.keys(context).length > 0) {
    return `${prompt}\n\nAdditional context: ${JSON.stringify(context)}`;
  }
  return prompt;
}

export function buildWebsiteProfilePrompt(profile: RealEstateWebsiteProfile): string {
  return `Review this real estate website profile and suggest content improvements as JSON with keys: tagline, heroSubtitle, aboutIntro, valuePropositions (string array).

Profile: ${JSON.stringify(profile, null, 2)}`;
}

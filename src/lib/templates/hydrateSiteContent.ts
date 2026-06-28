import { siteContent as defaultContent } from "../../../templates/real-estate/developer-v1/constants/siteContent";
import type { SiteContent } from "../../../templates/real-estate/developer-v1/constants/types";
import type { RealEstateWebsiteProfile } from "@/lib/questionnaire/types";
import { toPromptProfile } from "@/lib/questionnaire/profile-adapter";

type ProfileLike = ReturnType<typeof toPromptProfile>;

function deepMerge<T extends Record<string, unknown>>(base: T, overrides: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const val = overrides[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      result[key] = deepMerge(
        (base[key] ?? {}) as Record<string, unknown>,
        val as Record<string, unknown>,
      ) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

function replacePlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => values[key.trim()] ?? text);
}

function applyProfileValues(content: SiteContent, profile: ProfileLike): SiteContent {
  const values: Record<string, string> = {
    businessName: profile.businessName ?? "Your Business Name",
    tagline: profile.content?.differentiator ?? "Your Tagline Here",
    establishedYear: "2000",
    logoText: (profile.businessName ?? "BRAND").slice(0, 12).toUpperCase(),
    "hero.eyebrow": "Premium Real Estate Developer",
    "hero.title": profile.businessName ? `Welcome to ${profile.businessName}` : "Where Address Becomes Identity.",
    "hero.subtitle": profile.description ?? profile.content?.businessDescription ?? "Crafted residences and commercial landmarks.",
    "hero.primaryCta.label": "Explore Projects",
    "hero.secondaryCta.label": "Book a Site Visit",
    "contact.address": profile.contact?.address ?? profile.location?.primary ?? profile.primaryLocation ?? "",
    "contact.phone": profile.contact?.phone ?? "",
    "contact.email": profile.contact?.email ?? "",
    "contact.whatsapp": profile.contact?.whatsapp ?? profile.contact?.phone ?? "",
    "contact.hours": "Mon – Sat · 10:00 AM – 7:00 PM",
    "about.title": `About ${profile.businessName ?? "Us"}`,
    "about.intro": profile.description ?? profile.content?.businessDescription ?? "",
    "seo.title": `${profile.businessName ?? "Real Estate Developer"} — Official Website`,
    "seo.description": profile.description ?? profile.content?.businessDescription ?? "",
  };

  const json = JSON.stringify(content);
  return JSON.parse(replacePlaceholders(json, values)) as SiteContent;
}

export function hydrateSiteContent(
  profile: RealEstateWebsiteProfile,
  aiContent?: Record<string, unknown>,
): SiteContent {
  const promptProfile = toPromptProfile(profile);
  let content = structuredClone(defaultContent) as SiteContent;

  content = applyProfileValues(content, promptProfile);

  if (aiContent?.homepage_content) {
    const home = aiContent.homepage_content as Record<string, unknown>;
    if (home.hero) {
      content.hero = deepMerge(
        content.hero as unknown as Record<string, unknown>,
        home.hero as Record<string, unknown>,
      ) as SiteContent["hero"];
    }
    if (home.whyChooseUs) {
      content.whyChooseUs = deepMerge(
        content.whyChooseUs as unknown as Record<string, unknown>,
        home.whyChooseUs as Record<string, unknown>,
      ) as SiteContent["whyChooseUs"];
    }
    if (home.cta && content.hero) {
      const cta = home.cta as { label?: string; subtext?: string };
      if (cta.label) content.hero.primaryCta = { ...content.hero.primaryCta, label: cta.label };
    }
  }

  if (aiContent?.about_page) {
    content.about = deepMerge(
      content.about as unknown as Record<string, unknown>,
      aiContent.about_page as Record<string, unknown>,
    ) as SiteContent["about"];
  }

  if (aiContent?.property_descriptions && Array.isArray(aiContent.property_descriptions)) {
    const projects = aiContent.property_descriptions as SiteContent["projects"];
    content.projects = projects.map((p, i) => ({
      ...content.projects[i],
      ...p,
      slug: p.slug ?? content.projects[i]?.slug ?? `project-${i}`,
      heroImage: content.projects[i]?.heroImage ?? content.projects[0]?.heroImage,
    }));
  }

  if (aiContent?.seo_metadata) {
    content.seo = deepMerge(
      (content.seo ?? {}) as unknown as Record<string, unknown>,
      aiContent.seo_metadata as Record<string, unknown>,
    ) as SiteContent["seo"];
  }

  if (aiContent?.faqs && Array.isArray(aiContent.faqs)) {
    content.faqs = aiContent.faqs as SiteContent["faqs"];
  }

  content.businessName = profile.businessName ?? content.businessName;
  content.tagline = profile.content?.differentiator ?? content.tagline;

  return content;
}

export type { SiteContent };
